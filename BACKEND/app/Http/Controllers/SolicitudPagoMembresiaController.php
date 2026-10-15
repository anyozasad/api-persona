<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\Membresia;
use App\Models\PagoMembresia;
use App\Services\ComprobanteMembresiaService;
use App\Services\CajaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SolicitudPagoMembresiaController extends Controller
{
    private const METODOS_PAGO = ['Yape', 'Plin', 'Transferencia', 'Tarjeta', 'Efectivo'];

    public function comprar(Request $request, ComprobanteMembresiaService $comprobantes)
    {
        $datos = $request->validate([
            'id_membresia' => 'required|integer|exists:membresias,id_membresia',
            'fecha_inicio' => 'nullable|date|after_or_equal:today',
            'metodo_pago' => ['required', Rule::in(self::METODOS_PAGO)],
            'numero_operacion' => 'nullable|string|max:100',
            'observacion' => 'nullable|string|max:500',
        ]);

        $esEfectivo = $datos['metodo_pago'] === 'Efectivo';
        $numeroOperacion = trim((string) ($datos['numero_operacion'] ?? ''));

        if (!$esEfectivo && $numeroOperacion === '') {
            throw ValidationException::withMessages([
                'numero_operacion' => ['Ingresa el número de operación del pago.'],
            ]);
        }

        $cliente = $this->clienteDelUsuario($request);

        $resultado = DB::transaction(function () use ($datos, $cliente, $esEfectivo, $numeroOperacion) {
            $membresia = Membresia::where('id_membresia', $datos['id_membresia'])
                ->lockForUpdate()
                ->firstOrFail();

            if (mb_strtolower((string) $membresia->estado) !== 'activo') {
                throw ValidationException::withMessages([
                    'id_membresia' => ['La membresía seleccionada no está disponible.'],
                ]);
            }

            $pagoExistente = null;
            if (!$esEfectivo) {
                $pagoExistente = PagoMembresia::with('clienteMembresia')
                    ->where('numero_operacion', $numeroOperacion)
                    ->lockForUpdate()
                    ->first();

                if ($pagoExistente) {
                    $relacionExistente = $pagoExistente->clienteMembresia;
                    $esDelMismoCliente = $relacionExistente
                        && (int) $relacionExistente->id_cliente === (int) $cliente->id_cliente;
                    $esMismoPlan = $relacionExistente
                        && (int) $relacionExistente->id_membresia === (int) $membresia->id_membresia;
                    $esPendienteAnterior = $pagoExistente->estado_pago === 'Pendiente'
                        && $relacionExistente?->estado === 'PendientePago';

                    if (!$esDelMismoCliente || !$esMismoPlan || !$esPendienteAnterior) {
                        throw ValidationException::withMessages([
                            'numero_operacion' => ['Ese número de operación ya fue registrado.'],
                        ]);
                    }
                }
            } else {
                $pagoExistente = PagoMembresia::with('clienteMembresia')
                    ->where('metodo_pago', 'Efectivo')
                    ->where('estado_pago', 'Pendiente')
                    ->whereHas('clienteMembresia', fn ($q) => $q
                        ->where('id_cliente', $cliente->id_cliente)
                        ->where('id_membresia', $membresia->id_membresia)
                        ->where('estado', 'PendientePago'))
                    ->lockForUpdate()
                    ->first();
            }

            $fechaInicio = Carbon::parse($datos['fecha_inicio'] ?? now())->startOfDay();

            $vigente = ClienteMembresia::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->when(
                    $pagoExistente,
                    fn ($q) => $q->where(
                        'id_cliente_membresia',
                        '!=',
                        $pagoExistente->id_cliente_membresia
                    )
                )
                ->where('estado', 'Activo')
                ->whereDate('fecha_inicio', '<=', today())
                ->whereDate('fecha_fin', '>=', today())
                ->orderByDesc('fecha_fin')
                ->lockForUpdate()
                ->first();

            if ($vigente) {
                $siguienteInicio = Carbon::parse($vigente->fecha_fin)->addDay()->startOfDay();
                if ($fechaInicio->lt($siguienteInicio)) {
                    $fechaInicio = $siguienteInicio;
                }
            }

            $fechaFin = $fechaInicio->copy()
                ->addMonthsNoOverflow((int) $membresia->duracion_meses)
                ->subDay();

            if ($esEfectivo) {
                if ($pagoExistente) {
                    $relacion = ClienteMembresia::findOrFail($pagoExistente->id_cliente_membresia);
                    $relacion->update([
                        'fecha_inicio' => $fechaInicio->toDateString(),
                        'fecha_fin' => $fechaFin->toDateString(),
                        'estado' => 'PendientePago',
                    ]);
                    $pagoExistente->update([
                        'monto' => $membresia->precio,
                        'observacion' => $datos['observacion'] ?? 'Pago en efectivo pendiente de confirmación en recepción.',
                    ]);
                    $pago = $pagoExistente->fresh();
                } else {
                    $relacion = ClienteMembresia::create([
                        'id_cliente' => $cliente->id_cliente,
                        'id_membresia' => $membresia->id_membresia,
                        'fecha_inicio' => $fechaInicio->toDateString(),
                        'fecha_fin' => $fechaFin->toDateString(),
                        'estado' => 'PendientePago',
                    ]);

                    $pago = PagoMembresia::create([
                        'id_cliente_membresia' => $relacion->id_cliente_membresia,
                        'fecha_pago' => now(),
                        'monto' => $membresia->precio,
                        'metodo_pago' => 'Efectivo',
                        'numero_operacion' => null,
                        'observacion' => $datos['observacion'] ?? 'Pago en efectivo pendiente de confirmación en recepción.',
                        'estado_pago' => 'Pendiente',
                    ]);
                }

                return compact('relacion', 'pago', 'vigente') + ['pendiente' => true];
            }

            // Para pagos digitales se cancelan solicitudes antiguas pendientes,
            // porque la operación validada activa la membresía de forma inmediata.
            $pendientes = ClienteMembresia::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'PendientePago')
                ->when(
                    $pagoExistente,
                    fn ($q) => $q->where('id_cliente_membresia', '!=', $pagoExistente->id_cliente_membresia)
                )
                ->lockForUpdate()
                ->get();

            foreach ($pendientes as $pendiente) {
                PagoMembresia::query()
                    ->where('id_cliente_membresia', $pendiente->id_cliente_membresia)
                    ->where('estado_pago', 'Pendiente')
                    ->update([
                        'estado_pago' => 'Cancelado',
                        'observacion' => DB::raw("CONCAT(COALESCE(observacion,''), CASE WHEN observacion IS NULL OR observacion='' THEN '' ELSE ' | ' END, 'Reemplazado por pago digital')"),
                    ]);
                $pendiente->update(['estado' => 'Cancelado']);
            }

            if ($pagoExistente) {
                $relacion = ClienteMembresia::lockForUpdate()
                    ->findOrFail($pagoExistente->id_cliente_membresia);

                $relacion->update([
                    'id_membresia' => $membresia->id_membresia,
                    'fecha_inicio' => $fechaInicio->toDateString(),
                    'fecha_fin' => $fechaFin->toDateString(),
                    'estado' => 'Activo',
                ]);

                $pagoExistente->update([
                    'fecha_pago' => now(),
                    'monto' => $membresia->precio,
                    'metodo_pago' => $datos['metodo_pago'],
                    'numero_operacion' => $numeroOperacion,
                    'observacion' => $datos['observacion']
                        ?? 'Pago pendiente anterior convertido a compra automática',
                    'estado_pago' => 'Completado',
                ]);

                $pago = $pagoExistente->fresh();
            } else {
                $relacion = ClienteMembresia::create([
                    'id_cliente' => $cliente->id_cliente,
                    'id_membresia' => $membresia->id_membresia,
                    'fecha_inicio' => $fechaInicio->toDateString(),
                    'fecha_fin' => $fechaFin->toDateString(),
                    'estado' => 'Activo',
                ]);

                $pago = PagoMembresia::create([
                    'id_cliente_membresia' => $relacion->id_cliente_membresia,
                    'fecha_pago' => now(),
                    'monto' => $membresia->precio,
                    'metodo_pago' => $datos['metodo_pago'],
                    'numero_operacion' => $numeroOperacion,
                    'observacion' => $datos['observacion']
                        ?? ($vigente
                            ? 'Renovación registrada automáticamente por el cliente'
                            : 'Compra registrada automáticamente por el cliente'),
                    'estado_pago' => 'Completado',
                ]);
            }

            return compact('relacion', 'pago', 'vigente') + ['pendiente' => false];
        });

        $pagoCompleto = $resultado['pago']->fresh(['clienteMembresia.membresia']);

        if ($resultado['pendiente']) {
            return response()->json([
                'mensaje' => 'Solicitud de pago en efectivo registrada. Confirma el pago en recepción para activar la membresía.',
                'membresia_cliente' => $resultado['relacion']->load('membresia'),
                'pago' => $pagoCompleto,
                'comprobante' => null,
            ], 201);
        }

        return response()->json([
            'mensaje' => $resultado['vigente']
                ? 'Renovación comprada correctamente. El nuevo periodo quedó programado automáticamente.'
                : 'Membresía comprada y activada correctamente.',
            'membresia_cliente' => $resultado['relacion']->load('membresia'),
            'pago' => $pagoCompleto,
            'comprobante' => $comprobantes->formatear($pagoCompleto),
        ], 201);
    }

    public function pendientes()
    {
        return response()->json(
            PagoMembresia::with(['clienteMembresia.cliente', 'clienteMembresia.membresia'])
                ->where('estado_pago', 'Pendiente')
                ->orderBy('fecha_pago')
                ->get()
        );
    }

    public function confirmar(Request $request, string $idPago, CajaService $cajaService)
    {
        $pago = PagoMembresia::with('clienteMembresia.membresia')->findOrFail($idPago);

        if ($pago->estado_pago !== 'Pendiente') {
            throw ValidationException::withMessages(['pago' => ['Este pago ya fue procesado.']]);
        }

        if ($pago->metodo_pago === 'Efectivo' && !$cajaService->cajaAbierta()) {
            throw ValidationException::withMessages([
                'caja' => ['Debes abrir caja antes de confirmar un pago en efectivo.'],
            ]);
        }

        $pago = DB::transaction(function () use ($idPago, $request, $cajaService) {
            $pago = PagoMembresia::with('clienteMembresia.membresia')->lockForUpdate()->findOrFail($idPago);

            if ($pago->estado_pago !== 'Pendiente') {
                throw ValidationException::withMessages(['pago' => ['Este pago ya fue procesado.']]);
            }

            $relacion = ClienteMembresia::lockForUpdate()->findOrFail($pago->id_cliente_membresia);
            $membresia = Membresia::findOrFail($relacion->id_membresia);

            $inicio = Carbon::parse($relacion->fecha_inicio)->startOfDay();
            if ($inicio->lt(today())) $inicio = today();

            $otra = ClienteMembresia::query()
                ->where('id_cliente', $relacion->id_cliente)
                ->where('id_cliente_membresia', '!=', $relacion->id_cliente_membresia)
                ->where('estado', 'Activo')
                ->whereDate('fecha_fin', '>=', today())
                ->orderByDesc('fecha_fin')
                ->lockForUpdate()
                ->first();

            if ($otra) {
                $siguiente = Carbon::parse($otra->fecha_fin)->addDay()->startOfDay();
                if ($inicio->lt($siguiente)) $inicio = $siguiente;
            }

            $fin = $inicio->copy()
                ->addMonthsNoOverflow((int) $membresia->duracion_meses)
                ->subDay();

            $relacion->update([
                'fecha_inicio' => $inicio->toDateString(),
                'fecha_fin' => $fin->toDateString(),
                'estado' => 'Activo',
            ]);

            $pago->update([
                'fecha_pago' => now(),
                'estado_pago' => 'Completado',
            ]);

            if ($pago->metodo_pago === 'Efectivo') {
                $movimiento = $cajaService->registrarMovimiento(
                    (int) $request->user()->id_usuario,
                    'Ingreso',
                    'Membresia',
                    'Pago en efectivo de membresía '.$membresia->nombre,
                    (float) $pago->monto,
                    'PagoMembresia',
                    (int) $pago->id_pago
                );

                if (!$movimiento) {
                    throw ValidationException::withMessages([
                        'caja' => ['No se pudo registrar el ingreso porque no existe una caja abierta.'],
                    ]);
                }
            }

            return $pago;
        });

        return response()->json([
            'mensaje' => 'Pago confirmado y membresía/renovación programada correctamente.',
            'pago' => $pago->fresh(['clienteMembresia.cliente', 'clienteMembresia.membresia']),
        ]);
    }

    public function rechazar(Request $request, string $idPago)
    {
        $datos = $request->validate(['motivo' => 'required|string|max:500']);

        $pago = DB::transaction(function () use ($idPago, $datos) {
            $pago = PagoMembresia::lockForUpdate()->findOrFail($idPago);

            if ($pago->estado_pago !== 'Pendiente') {
                throw ValidationException::withMessages(['pago' => ['Este pago ya fue procesado.']]);
            }

            $pago->update([
                'estado_pago' => 'Rechazado',
                'observacion' => trim(($pago->observacion ? $pago->observacion.' | ' : '').'Rechazado: '.$datos['motivo']),
            ]);

            ClienteMembresia::where('id_cliente_membresia', $pago->id_cliente_membresia)
                ->update(['estado' => 'Cancelado']);

            return $pago;
        });

        return response()->json([
            'mensaje' => 'Pago rechazado y solicitud cancelada.',
            'pago' => $pago->fresh(['clienteMembresia.cliente', 'clienteMembresia.membresia']),
        ]);
    }

    public function cancelarPropia(Request $request, string $idPago)
    {
        $cliente = $this->clienteDelUsuario($request);

        $pago = PagoMembresia::query()
            ->where('id_pago', $idPago)
            ->where('estado_pago', 'Pendiente')
            ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $cliente->id_cliente))
            ->firstOrFail();

        DB::transaction(function () use ($pago) {
            $pago->update([
                'estado_pago' => 'Cancelado',
                'observacion' => trim(($pago->observacion ? $pago->observacion.' | ' : '').'Cancelado por el cliente'),
            ]);

            ClienteMembresia::where('id_cliente_membresia', $pago->id_cliente_membresia)
                ->update(['estado' => 'Cancelado']);
        });

        return response()->json(['mensaje' => 'Solicitud de pago cancelada.']);
    }

    private function clienteDelUsuario(Request $request): Cliente
    {
        $usuario = $request->user();
        $cliente = $usuario?->id_cliente ? Cliente::find($usuario->id_cliente) : null;

        if (!$cliente && $usuario?->dni) {
            $cliente = Cliente::where('dni', trim((string) $usuario->dni))->first();
        }

        if (!$cliente) {
            throw new NotFoundHttpException('No existe un cliente asociado a tu cuenta.');
        }
        if (mb_strtolower((string) $cliente->estado) !== 'activo') {
            abort(403, 'El cliente se encuentra inactivo.');
        }

        return $cliente;
    }
}
