<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\Membresia;
use App\Models\PagoMembresia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SolicitudPagoMembresiaController extends Controller
{
    private const METODOS_DIGITALES = ['Yape', 'Plin', 'Transferencia', 'Tarjeta'];

    public function solicitar(Request $request)
    {
        $datos = $request->validate([
            'id_membresia' => 'required|integer|exists:membresias,id_membresia',
            'fecha_inicio' => 'nullable|date|after_or_equal:today',
            'metodo_pago' => ['required', Rule::in(self::METODOS_DIGITALES)],
            'numero_operacion' => 'required|string|max:100',
            'observacion' => 'nullable|string|max:500',
        ]);

        $cliente = $this->clienteDelUsuario($request);

        $resultado = DB::transaction(function () use ($datos, $cliente) {
            if (PagoMembresia::where('numero_operacion', $datos['numero_operacion'])->exists()) {
                throw ValidationException::withMessages([
                    'numero_operacion' => ['Ese número de operación ya fue registrado.'],
                ]);
            }

            $membresia = Membresia::where('id_membresia', $datos['id_membresia'])
                ->lockForUpdate()
                ->firstOrFail();

            if (mb_strtolower((string) $membresia->estado) !== 'activo') {
                throw ValidationException::withMessages([
                    'id_membresia' => ['La membresía seleccionada no está disponible.'],
                ]);
            }

            $fechaInicio = Carbon::parse($datos['fecha_inicio'] ?? now())->startOfDay();

            $vigente = ClienteMembresia::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Activo')
                ->whereDate('fecha_inicio', '<=', $fechaInicio)
                ->whereDate('fecha_fin', '>=', $fechaInicio)
                ->exists();

            if ($vigente) {
                throw ValidationException::withMessages([
                    'id_membresia' => ['Ya tienes una membresía vigente. La renovación debe procesarse desde caja.'],
                ]);
            }

            $pendiente = ClienteMembresia::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'PendientePago')
                ->exists();

            if ($pendiente) {
                throw ValidationException::withMessages([
                    'id_membresia' => ['Ya tienes una solicitud de pago pendiente de revisión.'],
                ]);
            }

            $fechaFin = $fechaInicio->copy()
                ->addMonthsNoOverflow((int) $membresia->duracion_meses)
                ->subDay();

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
                'metodo_pago' => $datos['metodo_pago'],
                'numero_operacion' => $datos['numero_operacion'],
                'observacion' => $datos['observacion'] ?? null,
                'estado_pago' => 'Pendiente',
            ]);

            return compact('relacion', 'pago');
        });

        return response()->json([
            'mensaje' => 'Solicitud enviada. El pago debe ser confirmado por administración antes de activar la membresía.',
            'membresia_cliente' => $resultado['relacion']->load('membresia'),
            'pago' => $resultado['pago'],
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

    public function confirmar(string $idPago)
    {
        $pago = DB::transaction(function () use ($idPago) {
            $pago = PagoMembresia::with('clienteMembresia.membresia')
                ->lockForUpdate()
                ->findOrFail($idPago);

            if ($pago->estado_pago !== 'Pendiente') {
                throw ValidationException::withMessages([
                    'pago' => ['Este pago ya fue procesado.'],
                ]);
            }

            $relacion = ClienteMembresia::lockForUpdate()
                ->findOrFail($pago->id_cliente_membresia);

            $membresia = Membresia::findOrFail($relacion->id_membresia);

            $otraVigente = ClienteMembresia::query()
                ->where('id_cliente', $relacion->id_cliente)
                ->where('id_cliente_membresia', '!=', $relacion->id_cliente_membresia)
                ->where('estado', 'Activo')
                ->whereDate('fecha_inicio', '<=', today())
                ->whereDate('fecha_fin', '>=', today())
                ->exists();

            if ($otraVigente) {
                throw ValidationException::withMessages([
                    'pago' => ['El cliente ya tiene otra membresía vigente. Revisa el caso antes de confirmar.'],
                ]);
            }

            $inicio = Carbon::parse($relacion->fecha_inicio);
            if ($inicio->lt(today())) {
                $inicio = today();
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
                'estado_pago' => 'Completado',
            ]);

            return $pago;
        });

        return response()->json([
            'mensaje' => 'Pago confirmado y membresía activada correctamente.',
            'pago' => $pago->fresh(['clienteMembresia.cliente', 'clienteMembresia.membresia']),
        ]);
    }

    public function rechazar(Request $request, string $idPago)
    {
        $datos = $request->validate([
            'motivo' => 'required|string|max:500',
        ]);

        $pago = DB::transaction(function () use ($idPago, $datos) {
            $pago = PagoMembresia::lockForUpdate()->findOrFail($idPago);

            if ($pago->estado_pago !== 'Pendiente') {
                throw ValidationException::withMessages([
                    'pago' => ['Este pago ya fue procesado.'],
                ]);
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

        return response()->json([
            'mensaje' => 'Solicitud de pago cancelada.',
        ]);
    }

    private function clienteDelUsuario(Request $request): Cliente
    {
        $dni = trim((string) ($request->user()?->dni ?? ''));
        $cliente = $dni !== '' ? Cliente::where('dni', $dni)->first() : null;

        if (!$cliente) {
            throw new NotFoundHttpException('No existe un cliente asociado a tu cuenta.');
        }

        return $cliente;
    }
}
