<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\Cliente;
use App\Models\Entrenador;
use App\Models\Reserva;
use App\Models\Rutina;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PortalEntrenadorController extends Controller
{
    public function resumen(Request $request)
    {
        $entrenador = $this->entrenadorDelUsuario($request);

        $clientes = Cliente::query()
            ->whereHas('rutinas', fn ($q) => $q->where('id_entrenador', $entrenador->id_entrenador))
            ->distinct('clientes.id_cliente')
            ->count('clientes.id_cliente');

        $rutinasActivas = Rutina::where('id_entrenador', $entrenador->id_entrenador)
            ->where('estado', 'Activo')
            ->count();

        $clasesActivas = Clase::where('id_entrenador', $entrenador->id_entrenador)
            ->where('estado', 'Activo')
            ->count();

        $reservasHoy = Reserva::whereDate('fecha_clase', today())
            ->whereHas('clase', fn ($q) => $q->where('id_entrenador', $entrenador->id_entrenador))
            ->whereIn('estado', ['Reservada', 'Asistio'])
            ->count();

        return response()->json([
            'entrenador' => $entrenador,
            'clientes' => $clientes,
            'rutinas_activas' => $rutinasActivas,
            'clases_activas' => $clasesActivas,
            'reservas_hoy' => $reservasHoy,
        ]);
    }

    public function clientes(Request $request)
    {
        $entrenador = $this->entrenadorDelUsuario($request);

        return response()->json(
            Cliente::query()
                ->with(['rutinas' => fn ($q) => $q->where('id_entrenador', $entrenador->id_entrenador)->orderByDesc('fecha_inicio')])
                ->whereHas('rutinas', fn ($q) => $q->where('id_entrenador', $entrenador->id_entrenador))
                ->orderBy('nombres')
                ->orderBy('apellidos')
                ->get()
        );
    }

    public function rutinas(Request $request)
    {
        $entrenador = $this->entrenadorDelUsuario($request);

        return response()->json(
            Rutina::with(['cliente', 'detalles'])
                ->where('id_entrenador', $entrenador->id_entrenador)
                ->orderByDesc('fecha_inicio')
                ->get()
        );
    }

    public function clases(Request $request)
    {
        $entrenador = $this->entrenadorDelUsuario($request);

        return response()->json(
            Clase::withCount(['reservas as reservas_activas' => function ($q) {
                $q->where('estado', 'Reservada')->whereDate('fecha_clase', '>=', today());
            }])
                ->where('id_entrenador', $entrenador->id_entrenador)
                ->orderBy('dia_semana')
                ->orderBy('hora_inicio')
                ->get()
        );
    }

    public function reservas(Request $request)
    {
        $entrenador = $this->entrenadorDelUsuario($request);

        return response()->json(
            Reserva::with(['cliente', 'clase'])
                ->whereHas('clase', fn ($q) => $q->where('id_entrenador', $entrenador->id_entrenador))
                ->orderByDesc('fecha_clase')
                ->orderByDesc('fecha_reserva')
                ->get()
        );
    }

    private function entrenadorDelUsuario(Request $request): Entrenador
    {
        $dni = trim((string) ($request->user()?->dni ?? ''));

        if ($dni === '') {
            throw new NotFoundHttpException('La cuenta del entrenador no tiene DNI asociado.');
        }

        $entrenador = Entrenador::where('dni', $dni)->first();

        if (!$entrenador) {
            throw new NotFoundHttpException('No existe un entrenador asociado a esta cuenta.');
        }

        if (mb_strtolower((string) $entrenador->estado) !== 'activo') {
            throw new NotFoundHttpException('El entrenador se encuentra inactivo.');
        }

        return $entrenador;
    }
}
