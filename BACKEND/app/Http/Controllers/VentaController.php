<?php

namespace App\Http\Controllers;

use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use App\Services\CajaService;
use App\Services\InventarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            Venta::with(['cliente', 'usuario', 'detalles.producto'])
                ->findOrFail($id)
        );
    }

    public function store(Request $request, InventarioService $inventario, CajaService $cajaService)
    {
        $datos = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'fecha_venta' => 'nullable|date',
            'tipo_comprobante' => 'required|string|max:50',
            'numero_comprobante' => 'required|string|max:80',
            'metodo_pago' => ['required', 'string', Rule::in(self::METODOS_PAGO)],
            'numero_operacion' => 'nullable|string|max:100',
            'igv_porcentaje' => 'nullable|numeric|min:0|max:100',
            'items' => 'required|array|min:1',
            'items.*.id_producto' => 'required|integer|distinct|exists:productos,id_producto',
            'items.*.cantidad' => 'required|integer|min:1',
        ]);

        if (!$cajaService->cajaAbierta()) {
            throw ValidationException::withMessages([
                'caja' => ['Debes abrir caja antes de registrar una venta.'],
            ]);
        }

        if ($datos['metodo_pago'] !== 'Efectivo' && blank($datos['numero_operacion'] ?? null)) {
            throw ValidationException::withMessages([
                'numero_operacion' => ['El número de operación es obligatorio para pagos que no son en efectivo.'],
            ]);
        }

        if (Venta::where('numero_comprobante', $datos['numero_comprobante'])->exists()) {
            throw ValidationException::withMessages([
                'numero_comprobante' => ['Ese comprobante de venta ya fue registrado.'],
            ]);
        }

        if (!blank($datos['numero_operacion'] ?? null) && Venta::where('numero_operacion', $datos['numero_operacion'])->exists()) {
            throw ValidationException::withMessages([
                'numero_operacion' => ['Ese número de operación ya fue utilizado en otra venta.'],
            ]);
        }

        $venta = DB::transaction(function () use ($datos, $request, $inventario, $cajaService) {
            $itemsPreparados = [];
            $subtotal = 0;

            foreach ($datos['items'] as $item) {
                $producto = Producto::where('id_producto', $item['id_producto'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if (mb_strtolower((string) $producto->estado) !== 'activo') {
                    throw ValidationException::withMessages([
                        'items' => ["El producto {$producto->nombre_producto} no se encuentra activo."],
                    ]);
                }

                if ((int) $producto->stock < (int) $item['cantidad']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stock insuficiente para {$producto->nombre_producto}. Disponible: {$producto->stock}."],
                    ]);
                }

                $precio = (float) $producto->precio_venta;
                $subtotalItem = round((float) $item['cantidad'] * $precio, 2);
                $subtotal += $subtotalItem;

                $itemsPreparados[] = [
                    'producto' => $producto,
                    'cantidad' => (int) $item['cantidad'],
                    'precio_unitario' => $precio,
                    'subtotal' => $subtotalItem,
                ];
            }

            $porcentajeIgv = array_key_exists('igv_porcentaje', $datos) ? (float) $datos['igv_porcentaje'] : 18.0;
            $subtotal = round($subtotal, 2);
            $igv = round($subtotal * ($porcentajeIgv / 100), 2);
            $total = round($subtotal + $igv, 2);

            $venta = Venta::create([
                'id_cliente' => $datos['id_cliente'],
                'id_usuario' => $request->user()->id_usuario,
                'fecha_venta' => $datos['fecha_venta'] ?? now(),
                'tipo_comprobante' => $datos['tipo_comprobante'],
                'numero_comprobante' => $datos['numero_comprobante'],
                'metodo_pago' => $datos['metodo_pago'],
                'numero_operacion' => $datos['numero_operacion'] ?? null,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
            ]);

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

            // El cierre de caja fisica solo suma dinero en efectivo.
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
            'mensaje' => 'Venta registrada, pago controlado y Kardex actualizado correctamente.',
            'venta' => $venta->load(['cliente', 'usuario', 'detalles.producto']),
        ], 201);
    }
}
