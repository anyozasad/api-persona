<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\Cliente;
use App\Models\ClienteMembresia;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ReservaController extends Controller
{
    public function index(Request $request)
    {
        $query = Reserva::with(['cliente', 'clase.entrenador'])
            ->orderByDesc('fecha_clase')
            ->orderByDesc('fecha_reserva');

        if ($request->filled('fecha')) {
            $query->whereDate('fecha_clase', $request->input('fecha'));
        }

        if ($request->filled('id_clase')) {
            $query->where('id_clase', $request->integer('id_clase'));
        }

        return response()->json($query->get());
    }

    public function reservar(Request $request)
    {
        $datos = $request->validate([
            'id_clase' => 'required|integer|exists:clases,id_clase',
            'fecha_clase' => 'required|date|after_or_equal:today',
        ]);

        $cliente = $this->clienteDelUsuario($request);

        $reserva = DB::transaction(function () use ($datos, $cliente) {
            $clase = Clase::where('id_clase', $datos['id_clase'])
                ->lockForUpdate()
                ->firstOrFail();

            if (mb_strtolower((string) $clase->estado) !== 'activo') {
                throw ValidationException::withMessages([
                    'id_clase' => ['La clase seleccionada no está disponible.'],
                ]);
            }

            $fechaClase = Carbon::parse($datos['fecha_clase'])->startOfDay();
            $this->validarDiaClase($clase, $fechaClase);

            $tieneMembresia = ClienteMembresia::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->where('estado', 'Activo')
                ->whereDate('fecha_inicio', '<=', $fechaClase)
                ->whereDate('fecha_fin', '>=', $fechaClase)
                ->exists();

            if (!$tieneMembresia) {
                throw ValidationException::withMessages([
                    'fecha_clase' => ['Necesitas una membresía vigente para la fecha de la clase.'],
                ]);
            }

            $duplicada = Reserva::query()
                ->where('id_cliente', $cliente->id_cliente)
                ->where('id_clase', $clase->id_clase)
                ->whereDate('fecha_clase', $fechaClase)
                ->where('estado', '!=', 'Cancelada')
                ->exists();

            if ($duplicada) {
                throw ValidationException::withMessages([
                    'id_clase' => ['Ya tienes una reserva para esta clase y fecha.'],
                ]);
            }

            $ocupados = Reserva::query()
                ->where('id_clase', $clase->id_clase)
                ->whereDate('fecha_clase', $fechaClase)
                ->whereIn('estado', ['Reservada', 'Asistio'])
                ->count();

            if ($ocupados >= (int) $clase->cupo_maximo) {
                throw ValidationException::withMessages([
                    'id_clase' => ['La clase ya alcanzó su cupo máximo.'],
                ]);
            }

            return Reserva::create([
                'id_cliente' => $cliente->id_cliente,
                'id_clase' => $clase->id_clase,
                'fecha_clase' => $fechaClase->toDateString(),
                'fecha_reserva' => now(),
                'estado' => 'Reservada',
            ]);
        });

        return response()->json([
            'mensaje' => 'Clase reservada correctamente.',
            'reserva' => $reserva->load(['clase.entrenador']),
        ], 201);
    }

    public function misReservas(Request $request)
    {
        $cliente = $this->clienteDelUsuario($request);

        return response()->json(
            Reserva::with(['clase.entrenador'])
                ->where('id_cliente', $cliente->id_cliente)
                ->orderByDesc('fecha_clase')
                ->get()
        );
    }

    public function cancelarMia(Request $request, string $id)
    {
        $cliente = $this->clienteDelUsuario($request);
        $reserva = Reserva::where('id_reserva', $id)
            ->where('id_cliente', $cliente->id_cliente)
            ->firstOrFail();

        if ($reserva->estado !== 'Reservada') {
            throw ValidationException::withMessages([
                'reserva' => ['Solo se pueden cancelar reservas que todavía están activas.'],
            ]);
        }

        $reserva->update(['estado' => 'Cancelada']);

        return response()->json([
            'mensaje' => 'Reserva cancelada correctamente.',
            'reserva' => $reserva->fresh('clase'),
        ]);
    }

    public function cambiarEstado(Request $request, string $id)
    {
        $datos = $request->validate([
            'estado' => ['required', Rule::in(['Reservada', 'Asistio', 'NoAsistio', 'Cancelada'])],
        ]);

        $reserva = Reserva::findOrFail($id);
        $reserva->update(['estado' => $datos['estado']]);

        return response()->json([
            'mensaje' => 'Estado de la reserva actualizado.',
            'reserva' => $reserva->fresh(['cliente', 'clase']),
        ]);
    }

    private function clienteDelUsuario(Request $request): Cliente
    {
        $dni = trim((string) ($request->user()?->dni ?? ''));

        if ($dni === '') {
            throw new NotFoundHttpException('Tu cuenta no tiene DNI para vincularla con un cliente.');
        }

        $cliente = Cliente::where('dni', $dni)->first();

        if (!$cliente) {
            throw new NotFoundHttpException('No existe un cliente asociado a tu cuenta.');
        }

        return $cliente;
    }

    private function validarDiaClase(Clase $clase, Carbon $fechaClase): void
    {
        if (blank($clase->dia_semana)) {
            return;
        }

        $dias = [
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo',
        ];

        $diaFecha = $dias[$fechaClase->dayOfWeekIso] ?? null;

        if ($diaFecha !== $clase->dia_semana) {
            throw ValidationException::withMessages([
                'fecha_clase' => ["Esta clase se dicta los {$clase->dia_semana}."],
            ]);
        }
    }
}
