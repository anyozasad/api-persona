<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ClaseController extends Controller
{
    public function index()
    {
        return response()->json(
            Clase::with('entrenador')
                ->withCount(['reservas as reservas_activas' => function ($q) {
                    $q->where('estado', 'Reservada')->whereDate('fecha_clase', '>=', today());
                }])
                ->orderBy('dia_semana')
                ->orderBy('hora_inicio')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_entrenador' => 'nullable|integer|exists:entrenadores,id_entrenador',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'dia_semana' => [
                'required',
                Rule::in(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']),
            ],
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'cupo_maximo' => 'required|integer|min:1|max:200',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['estado'] = $datos['estado'] ?? 'Activo';
        $this->validarChoqueHorario($datos);

        return response()->json(Clase::create($datos)->load('entrenador'), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Clase::with(['entrenador', 'reservas.cliente'])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $clase = Clase::findOrFail($id);

        $datos = $request->validate([
            'id_entrenador' => 'sometimes|nullable|integer|exists:entrenadores,id_entrenador',
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'sometimes|nullable|string|max:500',
            'dia_semana' => [
                'sometimes',
                Rule::in(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']),
            ],
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin' => 'sometimes|date_format:H:i',
            'cupo_maximo' => 'sometimes|integer|min:1|max:200',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $final = array_merge($clase->only([
            'id_entrenador', 'nombre', 'descripcion', 'dia_semana',
            'hora_inicio', 'hora_fin', 'cupo_maximo', 'estado',
        ]), $datos);

        if ($final['hora_fin'] <= $final['hora_inicio']) {
            throw ValidationException::withMessages([
                'hora_fin' => ['La hora de fin debe ser posterior a la hora de inicio.'],
            ]);
        }

        $this->validarChoqueHorario($final, (int) $clase->id_clase);
        $clase->update($datos);

        return response()->json($clase->fresh('entrenador'));
    }

    public function destroy(string $id)
    {
        $clase = DB::transaction(function () use ($id) {
            $clase = Clase::lockForUpdate()->findOrFail($id);
            $clase->update(['estado' => 'Inactivo']);

            $canceladas = Reserva::where('id_clase', $clase->id_clase)
                ->where('estado', 'Reservada')
                ->whereDate('fecha_clase', '>=', today())
                ->update(['estado' => 'Cancelada']);

            $clase->setAttribute('reservas_canceladas', $canceladas);
            return $clase;
        });

        return response()->json([
            'mensaje' => 'Clase desactivada y reservas futuras activas canceladas.',
            'clase' => $clase,
            'reservas_canceladas' => $clase->reservas_canceladas ?? 0,
        ]);
    }

    private function validarChoqueHorario(array $datos, ?int $idExcluir = null): void
    {
        if (empty($datos['id_entrenador']) || ($datos['estado'] ?? 'Activo') !== 'Activo') {
            return;
        }

        $query = Clase::query()
            ->where('id_entrenador', $datos['id_entrenador'])
            ->where('dia_semana', $datos['dia_semana'])
            ->where('estado', 'Activo')
            ->where('hora_inicio', '<', $datos['hora_fin'])
            ->where('hora_fin', '>', $datos['hora_inicio']);

        if ($idExcluir) {
            $query->where('id_clase', '!=', $idExcluir);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'hora_inicio' => ['El entrenador ya tiene otra clase que se cruza con ese horario.'],
            ]);
        }
    }
}
