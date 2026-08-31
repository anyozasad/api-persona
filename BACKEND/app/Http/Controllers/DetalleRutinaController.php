<?php

namespace App\Http\Controllers;

use App\Models\DetalleRutina;
use Illuminate\Http\Request;

class DetalleRutinaController extends Controller
{
    public function index(Request $request)
    {
        $query = DetalleRutina::with('rutina')->orderBy('id_detalle_rutina');

        if ($request->filled('id_rutina')) {
            $query->where('id_rutina', $request->integer('id_rutina'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_rutina' => 'required|integer|exists:rutinas,id_rutina',
            'ejercicio' => 'required|string|max:150',
            'series' => 'required|integer|min:1|max:20',
            'repeticiones' => 'required|integer|min:1|max:200',
            'peso_recomendado' => 'nullable|numeric|min:0',
            'descanso_segundos' => 'nullable|integer|min:0|max:3600',
            'observaciones' => 'nullable|string|max:500',
        ]);

        return response()->json(DetalleRutina::create($datos)->load('rutina'), 201);
    }

    public function show(string $id)
    {
        return response()->json(DetalleRutina::with('rutina')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $detalle = DetalleRutina::findOrFail($id);

        $datos = $request->validate([
            'id_rutina' => 'sometimes|integer|exists:rutinas,id_rutina',
            'ejercicio' => 'sometimes|string|max:150',
            'series' => 'sometimes|integer|min:1|max:20',
            'repeticiones' => 'sometimes|integer|min:1|max:200',
            'peso_recomendado' => 'sometimes|nullable|numeric|min:0',
            'descanso_segundos' => 'sometimes|nullable|integer|min:0|max:3600',
            'observaciones' => 'sometimes|nullable|string|max:500',
        ]);

        $detalle->update($datos);

        return response()->json($detalle->fresh('rutina'));
    }

    public function destroy(string $id)
    {
        DetalleRutina::findOrFail($id)->delete();

        return response()->json(null, 204);
    }
}
