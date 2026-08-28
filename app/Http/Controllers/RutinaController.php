<?php

namespace App\Http\Controllers;

use App\Models\Rutina;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RutinaController extends Controller
{
    public function index(Request $request)
    {
        $query = Rutina::with(['cliente', 'entrenador', 'detalles'])
            ->orderByDesc('fecha_inicio');

        if ($request->filled('id_cliente')) {
            $query->where('id_cliente', $request->integer('id_cliente'));
        }

        if ($request->filled('id_entrenador')) {
            $query->where('id_entrenador', $request->integer('id_entrenador'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'id_entrenador' => 'required|integer|exists:entrenadores,id_entrenador',
            'nombre_rutina' => 'required|string|max:150',
            'objetivo' => 'nullable|string|max:150',
            'descripcion' => 'nullable|string|max:1000',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'estado' => ['nullable', Rule::in(['Activo', 'Finalizado', 'Inactivo'])],
        ]);

        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Rutina::create($datos)->load(['cliente', 'entrenador']), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Rutina::with(['cliente', 'entrenador', 'detalles'])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $rutina = Rutina::findOrFail($id);

        $datos = $request->validate([
            'id_cliente' => 'sometimes|integer|exists:clientes,id_cliente',
            'id_entrenador' => 'sometimes|integer|exists:entrenadores,id_entrenador',
            'nombre_rutina' => 'sometimes|string|max:150',
            'objetivo' => 'sometimes|nullable|string|max:150',
            'descripcion' => 'sometimes|nullable|string|max:1000',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|nullable|date',
            'estado' => ['sometimes', Rule::in(['Activo', 'Finalizado', 'Inactivo'])],
        ]);

        $fechaInicio = $datos['fecha_inicio'] ?? optional($rutina->fecha_inicio)->toDateString();
        $fechaFin = $datos['fecha_fin'] ?? optional($rutina->fecha_fin)->toDateString();

        if ($fechaFin && $fechaInicio && $fechaFin < $fechaInicio) {
            return response()->json([
                'mensaje' => 'La fecha de fin no puede ser anterior a la fecha de inicio.',
            ], 422);
        }

        $rutina->update($datos);

        return response()->json($rutina->fresh(['cliente', 'entrenador', 'detalles']));
    }

    public function destroy(string $id)
    {
        $rutina = Rutina::findOrFail($id);
        $rutina->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Rutina desactivada; se conserva su historial.',
            'rutina' => $rutina->fresh(),
        ]);
    }
}
