<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\Membresia;
use App\Models\PagoMembresia;
use App\Services\CajaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MembresiaProcesoController extends Controller
{
    private const METODOS_PAGO = ['Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta'];

    public function contratar(Request $request, CajaService $cajaService)
    {
        $datos = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'id_membresia' => 'required|integer|exists:membresias,id_membresia',
            'fecha_inicio' => 'nullable|date',
            'metodo_pago' => ['required', 'string', Rule::in(self::METODOS_PAGO)],
            'numero_operacion' => 'nullable|string|max:100',
            'observacion' => 'nullable|string|max:500',
        ]);

        if (!$cajaService->cajaAbierta()) {
            throw ValidationException::withMessages([
                'caja' => ['Debes abrir caja antes de cobrar una membresía en recepción.'],
            ]);
        }

        $this->validarNumeroOperacion($datos['metodo_pago'], $datos['numero_operacion'] ?? null);

        $resultado = DB::transaction(function () use ($datos, $request, $cajaService) {
            $cliente = Cliente::lockForUpdate()->findOrFail($datos['id_cliente']);
            $membresia = Membresia::lockForUpdate()->findOrFail($datos['id_membresia']);

            if (mb_strtolower((string) $cliente->estado) !== 'activo') {
                throw ValidationException::withMessages([
                    'id_cliente' => ['El cliente no se encuentra activo.'],
                ]);
            }

            if (mb_strtolower((string) $membresia->estado) !== 'activo') {
                throw ValidationException::withMessages([
                    'id_membresia' => ['La membresía seleccionada no se encuentra activa.'],
                ]);
            }

            $fechaInicio = Carbon::parse($datos['fecha_inicio'] ?? now())->startOfDay();

            $membresiaVigente = ClienteMembresia::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Activo')
                ->whereDate('fecha_inicio', '<=', $fechaInicio)
                ->whereDate('fecha_fin', '>=', $fechaInicio)
                ->lockForUpdate()
                ->first();

            if ($membresiaVigente) {
                throw ValidationException::withMessages([
                    'id_cliente' => ['El cliente ya tiene una membresía vigente. Usa el proceso de renovación.'],
                ]);
            }

            $this->validarOperacionDuplicada($datos['numero_operacion'] ?? null);

            $fechaFin = $fechaInicio->copy()
                ->addMonthsNoOverflow((int) $membresia->duracion_meses)
                ->subDay();

            $clienteMembresia = ClienteMembresia::create([
                'id_cliente' => $cliente->id_cliente,
                'id_membresia' => $membresia->id_membresia,
                'fecha_inicio' => $fechaInicio->toDateString(),
                'fecha_fin' => $fechaFin->toDateString(),
                'estado' => 'Activo',
            ]);

            $pago = PagoMembresia::create([
                'id_cliente_membresia' => $clienteMembresia->id_cliente_membresia,
                'fecha_pago' => now(),
                'monto' => $membresia->precio,
                'metodo_pago' => $datos['metodo_pago'],
                'numero_operacion' => $datos['numero_operacion'] ?? null,
                'observacion' => $datos['observacion'] ?? null,
                'estado_pago' => 'Completado',
            ]);

            if ($datos['metodo_pago'] === 'Efectivo') {
                $cajaService->registrarMovimiento(
                    $request->user()->id_usuario,
                    'Ingreso',
                    'Membresia',
                    'Pago de membresía '.$membresia->nombre,
                    (float) $pago->monto,
                    'PagoMembresia',
                    $pago->id_pago
                );
            }

            return compact('clienteMembresia', 'pago');
        });

        return response()->json([
            'mensaje' => 'Membresía contratada y pago registrado correctamente.',
            'membresia_cliente' => $resultado['clienteMembresia']->load(['cliente', 'membresia']),
            'pago' => $resultado['pago'],
            'comprobante' => $this->formatearComprobante($resultado['pago']),
        ], 201);
    }

    public function renovar(Request $request, CajaService $cajaService)
    {
        $datos = $request->validate([
            'id_cliente_membresia' => 'required|integer|exists:cliente_membresia,id_cliente_membresia',
            'metodo_pago' => ['required', 'string', Rule::in(self::METODOS_PAGO)],
            'numero_operacion' => 'nullable|string|max:100',
            'observacion' => 'nullable|string|max:500',
        ]);

        if (!$cajaService->cajaAbierta()) {
            throw ValidationException::withMessages([
                'caja' => ['Debes abrir caja antes de cobrar una renovación en recepción.'],
            ]);
        }

        $this->validarNumeroOperacion($datos['metodo_pago'], $datos['numero_operacion'] ?? null);

        $resultado = DB::transaction(function () use ($datos, $request, $cajaService) {
            $clienteMembresia = ClienteMembresia::with(['cliente', 'membresia'])
                ->lockForUpdate()
                ->findOrFail($datos['id_cliente_membresia']);

            $membresia = Membresia::lockForUpdate()->findOrFail($clienteMembresia->id_membresia);

            if (mb_strtolower((string) $membresia->estado) !== 'activo') {
                throw ValidationException::withMessages([
                    'id_cliente_membresia' => ['La membresía asociada ya no se encuentra activa para nuevas renovaciones.'],
                ]);
            }

            $this->validarOperacionDuplicada($datos['numero_operacion'] ?? null);

            $fechaFinActual = Carbon::parse($clienteMembresia->fecha_fin)->startOfDay();

            if ($fechaFinActual->greaterThanOrEqualTo(today())) {
                $nuevaFechaFin = $fechaFinActual->copy()
                    ->addMonthsNoOverflow((int) $membresia->duracion_meses);
            } else {
                $nuevaFechaFin = today()
                    ->addMonthsNoOverflow((int) $membresia->duracion_meses)
                    ->subDay();
            }

            $clienteMembresia->update([
                'fecha_fin' => $nuevaFechaFin->toDateString(),
                'estado' => 'Activo',
            ]);

            $pago = PagoMembresia::create([
                'id_cliente_membresia' => $clienteMembresia->id_cliente_membresia,
                'fecha_pago' => now(),
                'monto' => $membresia->precio,
                'metodo_pago' => $datos['metodo_pago'],
                'numero_operacion' => $datos['numero_operacion'] ?? null,
                'observacion' => $datos['observacion'] ?? 'Renovación de membresía',
                'estado_pago' => 'Completado',
            ]);

            if ($datos['metodo_pago'] === 'Efectivo') {
                $cajaService->registrarMovimiento(
                    $request->user()->id_usuario,
                    'Ingreso',
                    'Membresia',
                    'Renovación de membresía '.$membresia->nombre,
                    (float) $pago->monto,
                    'PagoMembresia',
                    $pago->id_pago
                );
            }

            return compact('clienteMembresia', 'pago');
        });

        return response()->json([
            'mensaje' => 'Membresía renovada y pago registrado correctamente.',
            'membresia_cliente' => $resultado['clienteMembresia']->fresh(['cliente', 'membresia']),
            'pago' => $resultado['pago'],
            'comprobante' => $this->formatearComprobante($resultado['pago']),
        ]);
    }

    public function estadoCliente(string $idCliente)
    {
        $cliente = Cliente::findOrFail($idCliente);
        $hoy = today();

        ClienteMembresia::query()
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_fin', '<', $hoy)
            ->update(['estado' => 'Vencido']);

        $actual = ClienteMembresia::with(['membresia'])
            ->where('id_cliente', $cliente->id_cliente)
            ->where('estado', 'Activo')
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_fin', '>=', $hoy)
            ->orderByDesc('fecha_fin')
            ->first();

        $ultima = ClienteMembresia::with(['membresia'])
            ->where('id_cliente', $cliente->id_cliente)
            ->orderByDesc('fecha_fin')
            ->first();

        return response()->json([
            'cliente' => $cliente,
            'tiene_membresia_vigente' => (bool) $actual,
            'membresia_actual' => $actual,
            'dias_restantes' => $actual
                ? $hoy->diffInDays(Carbon::parse($actual->fecha_fin), false) + 1
                : 0,
            'ultima_membresia' => $ultima,
        ]);
    }

    public function historialPagos(string $idCliente)
    {
        Cliente::findOrFail($idCliente);

        $pagos = PagoMembresia::query()
            ->with(['clienteMembresia.membresia'])
            ->whereHas('clienteMembresia', fn ($q) => $q->where('id_cliente', $idCliente))
            ->orderByDesc('fecha_pago')
            ->get();

        return response()->json($pagos);
    }

    public function comprobante(string $idPago)
    {
        $pago = PagoMembresia::with(['clienteMembresia.cliente', 'clienteMembresia.membresia'])
            ->findOrFail($idPago);

        return response()->json($this->formatearComprobante($pago));
    }

    private function validarNumeroOperacion(string $metodoPago, ?string $numeroOperacion): void
    {
        if ($metodoPago !== 'Efectivo' && blank($numeroOperacion)) {
            throw ValidationException::withMessages([
                'numero_operacion' => ['El número de operación es obligatorio para pagos que no son en efectivo.'],
            ]);
        }
    }

    private function validarOperacionDuplicada(?string $numeroOperacion): void
    {
        if (blank($numeroOperacion)) {
            return;
        }

        if (PagoMembresia::where('numero_operacion', $numeroOperacion)->exists()) {
            throw ValidationException::withMessages([
                'numero_operacion' => ['Ese número de operación ya fue registrado.'],
            ]);
        }
    }

    private function formatearComprobante(PagoMembresia $pago): array
    {
        $pago->loadMissing(['clienteMembresia.cliente', 'clienteMembresia.membresia']);
        $relacion = $pago->clienteMembresia;

        return [
            'id_pago' => $pago->id_pago,
            'fecha_pago' => $pago->fecha_pago,
            'cliente' => $relacion?->cliente
                ? trim($relacion->cliente->nombres.' '.$relacion->cliente->apellidos)
                : null,
            'dni' => $relacion?->cliente?->dni,
            'membresia' => $relacion?->membresia?->nombre,
            'periodo' => [
                'fecha_inicio' => $relacion?->fecha_inicio,
                'fecha_fin' => $relacion?->fecha_fin,
            ],
            'monto' => $pago->monto,
            'metodo_pago' => $pago->metodo_pago,
            'numero_operacion' => $pago->numero_operacion,
            'estado_pago' => $pago->estado_pago,
        ];
    }
}
