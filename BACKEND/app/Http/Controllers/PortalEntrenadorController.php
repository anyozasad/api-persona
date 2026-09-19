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

        return response()->json([
            'entrenador' => $entrenador,
            'clientes' => $clientes,
            'rutinas_activas' => Rutina::where('id_entrenador', $entrenador->id_entrenador)->where('estado', 'Activo')->count(),
            'clases_activas' => Clase::where('id_entrenador', $entrenador->id_entrenador)->where('estado', 'Activo')->count(),
            'reservas_hoy' => Reserva::whereDate('fecha_clase', today())
                ->whereHas('clase', fn ($q) => $q->where('id_entrenador', $entrenador->id_entrenador))
                ->whereIn('estado', ['Reservada', 'Asistio'])
                ->count(),
        ]);
    }

    public function clientes(Request $request)
    {
        $entrenador = $this->entrenadorDelUsuario($request);

        // Lista mínima de clientes activos para poder asignar la PRIMERA rutina.
        // No se exponen correo, teléfono, dirección, pagos ni otra información sensible.
        return response()->json(
            Cliente::query()
                ->select(['id_cliente', 'dni', 'nombres', 'apellidos', 'estado'])
                ->where('estado', 'Activo')
                ->with(['rutinas' => function ($q) use ($entrenador) {
                    $q->select([
                        'id_rutina', 'id_cliente', 'id_entrenador',
                        'nombre_rutina', 'objetivo', 'fecha_inicio', 'fecha_fin', 'estado',
                    ])->where('id_entrenador', $entrenador->id_entrenador)
                      ->orderByDesc('fecha_inicio');
                }])
                ->orderBy('nombres')
                ->orderBy('apellidos')
                ->get()
        );
    }

    public function rutinas(Request $request)
    {
        $entrenador = $this->entrenadorDelUsuario($request);

        return response()->json(
            Rutina::with(['cliente:id_cliente,dni,nombres,apellidos,estado', 'detalles'])
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
            Reserva::with([
                'cliente:id_cliente,dni,nombres,apellidos,estado',
                'clase',
            ])
                ->whereHas('clase', fn ($q) => $q->where('id_entrenador', $entrenador->id_entrenador))
                ->orderByDesc('fecha_clase')
                ->orderByDesc('fecha_reserva')
                ->get()
        );
    }

    private function entrenadorDelUsuario(Request $request): Entrenador
    {
        $usuario = $request->user();

        $entrenador = $usuario?->id_entrenador
            ? Entrenador::find($usuario->id_entrenador)
            : null;

        // Compatibilidad con cuentas antiguas creadas antes de la relación directa.
        if (!$entrenador && $usuario?->dni) {
            $entrenador = Entrenador::where('dni', trim((string) $usuario->dni))->first();
        }

        if (!$entrenador) {
            throw new NotFoundHttpException('No existe un entrenador asociado a esta cuenta.');
        }

        if (mb_strtolower((string) $entrenador->estado) !== 'activo') {
            throw new NotFoundHttpException('El entrenador se encuentra inactivo.');
        }

        return $entrenador;
    }
}
