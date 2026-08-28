<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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

        if (isset($datos['hora_inicio'], $datos['hora_fin']) && $datos['hora_fin'] <= $datos['hora_inicio']) {
            return response()->json([
                'mensaje' => 'La hora de fin debe ser posterior a la hora de inicio.',
            ], 422);
        }

        $clase->update($datos);

        return response()->json($clase->fresh('entrenador'));
    }

    public function destroy(string $id)
    {
        $clase = Clase::findOrFail($id);
        $clase->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Clase desactivada correctamente. Se conserva su historial de reservas.',
            'clase' => $clase->fresh(),
        ]);
    }
}
