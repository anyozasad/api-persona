<?php

namespace App\Http\Controllers;

use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use App\Services\CajaService;
use App\Services\InventarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VentaController extends Controller
{
    private const METODOS_PAGO = ['Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta'];

    public function index()
    {
        return response()->json(
            Venta::with(['cliente', 'usuario', 'detalles.producto'])
                ->orderByDesc('fecha_venta')
                ->get()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            Venta::with(['cliente', 'usuario', 'detalles.producto'])->findOrFail($id)
        );
    }

    public function store(Request $request, InventarioService $inventario, CajaService $cajaService)
    {
        $datos = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'fecha_venta' => 'nullable|date',
            'tipo_comprobante' => 'required|string|max:50',
            'numero_comprobante' => 'nullable|string|max:80',
            'metodo_pago' => ['required', 'string', Rule::in(self::METODOS_PAGO)],
            'numero_operacion' => 'nullable|string|max:100',
            'igv_porcentaje' => 'nullable|numeric|min:0|max:100',
            'items' => 'required|array|min:1',
            'items.*.id_producto' => 'required|integer|distinct|exists:productos,id_producto',
            'items.*.cantidad' => 'required|integer|min:1',
        ]);

        $cajaAbierta = $cajaService->cajaAbierta();
        if (!$cajaAbierta) {
            throw ValidationException::withMessages(['caja' => ['Debes abrir caja antes de registrar una venta.']]);
        }

        if ($datos['metodo_pago'] !== 'Efectivo' && blank($datos['numero_operacion'] ?? null)) {
            throw ValidationException::withMessages(['numero_operacion' => ['El número de operación es obligatorio para pagos que no son en efectivo.']]);
        }

        $numeroSolicitado = trim((string) ($datos['numero_comprobante'] ?? ''));
        if ($numeroSolicitado !== '' && Venta::where('numero_comprobante', $numeroSolicitado)->exists()) {
            throw ValidationException::withMessages(['numero_comprobante' => ['Ese comprobante de venta ya fue registrado.']]);
        }

        if (!blank($datos['numero_operacion'] ?? null) && Venta::where('numero_operacion', $datos['numero_operacion'])->exists()) {
            throw ValidationException::withMessages(['numero_operacion' => ['Ese número de operación ya fue utilizado en otra venta.']]);
        }

        $venta = DB::transaction(function () use ($datos, $request, $inventario, $cajaService, $cajaAbierta) {
            $itemsPreparados = [];
            $totalPrecioFinal = 0;

            foreach ($datos['items'] as $item) {
                $producto = Producto::where('id_producto', $item['id_producto'])->lockForUpdate()->firstOrFail();

                if (mb_strtolower((string) $producto->estado) !== 'activo') {
                    throw ValidationException::withMessages(['items' => ["El producto {$producto->nombre_producto} no se encuentra activo."]]);
                }

                if ((int) $producto->stock < (int) $item['cantidad']) {
                    throw ValidationException::withMessages(['items' => ["Stock insuficiente para {$producto->nombre_producto}. Disponible: {$producto->stock}."]]);
                }

                // precio_venta se trata como PRECIO FINAL AL PÚBLICO (IGV incluido).
                $precioFinalUnitario = (float) $producto->precio_venta;
                $totalLinea = round((float) $item['cantidad'] * $precioFinalUnitario, 2);
                $totalPrecioFinal += $totalLinea;

                $itemsPreparados[] = [
                    'producto' => $producto,
                    'cantidad' => (int) $item['cantidad'],
                    'precio_unitario' => $precioFinalUnitario,
                    'subtotal' => $totalLinea,
                ];
            }

            $porcentajeIgv = array_key_exists('igv_porcentaje', $datos) ? (float) $datos['igv_porcentaje'] : 18.0;
            $total = round($totalPrecioFinal, 2);
            $factor = 1 + ($porcentajeIgv / 100);
            $subtotal = $factor > 0 ? round($total / $factor, 2) : $total;
            $igv = round($total - $subtotal, 2);

            $numeroComprobante = trim((string) ($datos['numero_comprobante'] ?? ''));
            if ($numeroComprobante === '') {
                $prefijo = mb_strtolower((string) $datos['tipo_comprobante']) === 'factura' ? 'F001' : 'B001';
                // En la antigua gym_system el ID real sigue siendo ventas.id.
                // No generar el comprobante a partir de un alias id_venta vacío.
                $ultimoId = Schema::hasColumn('ventas', 'id') && Schema::hasColumn('ventas', 'caja_id')
                    ? DB::table('ventas')->lockForUpdate()->max('id')
                    : Venta::query()->lockForUpdate()->orderByDesc('id_venta')->value('id_venta');
                $siguiente = ((int) $ultimoId) + 1;
                $numeroComprobante = $prefijo.'-'.str_pad((string) $siguiente, 8, '0', STR_PAD_LEFT);
            }

            if (Venta::where('numero_comprobante', $numeroComprobante)->exists()) {
                throw ValidationException::withMessages([
                    'numero_comprobante' => ['No se pudo generar un número de comprobante único. Intenta nuevamente.'],
                ]);
            }

            $atributosVenta = [
                'id_cliente' => $datos['id_cliente'],
                'id_usuario' => $request->user()->id_usuario,
                'fecha_venta' => $datos['fecha_venta'] ?? now(),
                'tipo_comprobante' => $datos['tipo_comprobante'],
                'numero_comprobante' => $numeroComprobante,
                'metodo_pago' => $datos['metodo_pago'],
                'numero_operacion' => $datos['numero_operacion'] ?? null,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'estado' => 'Registrado',
            ];
            $venta = $this->crearVentaCompatible($atributosVenta, $cajaAbierta, $porcentajeIgv);

            foreach ($itemsPreparados as $item) {
                DetalleVenta::create([
                    'id_venta' => $venta->id_venta,
                    'id_producto' => $item['producto']->id_producto,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'subtotal' => $item['subtotal'],
                ]);

                $anterior = (int) $item['producto']->stock;
                $nuevo = $anterior - $item['cantidad'];
                $item['producto']->update(['stock' => $nuevo]);

                $inventario->registrar(
                    $item['producto'],
                    $request->user()->id_usuario,
                    'Salida',
                    'Venta',
                    $item['cantidad'],
                    $anterior,
                    $nuevo,
                    'Venta',
                    $venta->id_venta,
                    'Salida automática por venta'
                );
            }

            if ($datos['metodo_pago'] === 'Efectivo') {
                $cajaService->registrarMovimiento(
                    $request->user()->id_usuario,
                    'Ingreso',
                    'Venta',
                    'Venta '.$venta->numero_comprobante,
                    (float) $venta->total,
                    'Venta',
                    $venta->id_venta
                );
            }

            return $venta;
        });

        return response()->json([
            'mensaje' => 'Venta registrada; el precio final ya incluye IGV, y stock/Kardex fueron actualizados.',
            'numero_comprobante' => $venta->numero_comprobante,
            'venta' => $venta->load(['cliente', 'usuario', 'detalles.producto']),
        ], 201);
    }

    /**
     * Si MySQL usa todavía tablas gym_system antiguas, ventas.id es la
     * PK autoincremental y caja_id/fecha/descuento siguen siendo obligatorios.
     * Registrar solo las columnas modernas provocaba SQLSTATE 23000/1364
     * al confirmar el cobro. Se guardan ambos contratos en UNA transacción.
     */
    private function crearVentaCompatible(array $atributos, \App\Models\Caja $caja, float $igvPorcentaje): Venta
    {
        if (!Schema::hasColumn('ventas', 'id') || !Schema::hasColumn('ventas', 'caja_id')) {
            return Venta::create($atributos);
        }

        $campos = array_fill_keys(Schema::getColumnListing('ventas'), true);
        $idCajaLegacy = $caja->getAttribute('id') ?: $caja->getAttribute('id_caja');
        if (!$idCajaLegacy) {
            throw ValidationException::withMessages([
                'caja' => ['La caja antigua no tiene identificador válido. Comprueba el esquema de caja.'],
            ]);
        }

        $atributos['caja_id'] = (int) $idCajaLegacy;
        if (isset($campos['fecha'])) {
            $atributos['fecha'] = $atributos['fecha_venta'];
        }
        if (isset($campos['descuento'])) {
            $atributos['descuento'] = 0;
        }
        if (isset($campos['igv_porcentaje'])) {
            $atributos['igv_porcentaje'] = $igvPorcentaje;
        }
        if (isset($campos['socio_id'])) {
            $dni = DB::table('clientes')->where('id_cliente', $atributos['id_cliente'])->value('dni');
            $atributos['socio_id'] = $dni && Schema::hasTable('socios')
                ? DB::table('socios')->where('dni', $dni)->value('id')
                : null;
        }

        $idLegacy = (int) DB::table('ventas')->insertGetId($atributos, 'id');
        // id_venta es una columna de compatibilidad, no el AUTO_INCREMENT original.
        // Eloquent, comprobantes, detalle_venta y los reportes necesitan el mismo ID.
        if (isset($campos['id_venta'])) {
            DB::table('ventas')->where('id', $idLegacy)->update(['id_venta' => $idLegacy]);
        }

        return Venta::findOrFail($idLegacy);
    }

    public function anular(Request $request, string $id, InventarioService $inventario, CajaService $cajaService)
    {
        $datos = $request->validate(['motivo' => 'required|string|min:5|max:500']);

        $venta = DB::transaction(function () use ($request, $id, $datos, $inventario, $cajaService) {
            $venta = Venta::with('detalles')->lockForUpdate()->findOrFail($id);

            if (($venta->estado ?? 'Registrado') === 'Anulado') {
                throw ValidationException::withMessages(['venta' => ['La venta ya se encuentra anulada.']]);
            }

            if ($venta->metodo_pago === 'Efectivo' && !$cajaService->cajaAbierta()) {
                throw ValidationException::withMessages(['caja' => ['Debes abrir caja para registrar la devolución de efectivo de una venta anulada.']]);
            }

            foreach ($venta->detalles as $detalle) {
                $producto = Producto::where('id_producto', $detalle->id_producto)->lockForUpdate()->firstOrFail();
                $anterior = (int) $producto->stock;
                $nuevo = $anterior + (int) $detalle->cantidad;
                $producto->update(['stock' => $nuevo]);

                $inventario->registrar(
                    $producto,
                    $request->user()->id_usuario,
                    'Entrada',
                    'AnulacionVenta',
                    (int) $detalle->cantidad,
                    $anterior,
                    $nuevo,
                    'Venta',
                    $venta->id_venta,
                    'Reposición de stock por anulación de venta'
                );
            }

            if ($venta->metodo_pago === 'Efectivo') {
                $cajaService->registrarMovimiento(
                    $request->user()->id_usuario,
                    'Egreso',
                    'AnulacionVenta',
                    'Devolución de venta '.$venta->numero_comprobante,
                    (float) $venta->total,
                    'Venta',
                    $venta->id_venta
                );
            }

            $venta->update([
                'estado' => 'Anulado',
                'fecha_anulacion' => now(),
                'motivo_anulacion' => $datos['motivo'],
                'id_usuario_anulacion' => $request->user()->id_usuario,
            ]);

            return $venta;
        });

        return response()->json([
            'mensaje' => 'Venta anulada, stock restaurado y movimientos registrados.',
            'venta' => $venta->load(['cliente', 'usuario', 'detalles.producto']),
        ]);
    }
}
