<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use Illuminate\Http\Request;

class ClaseController extends Controller
{
    public function index()
    {
        return response()->json(Clase::orderBy('hora_inicio')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'hora_inicio' => 'required',
            'hora_fin' => 'required',
            'cupo_maximo' => 'required|integer|min:1',
            'estado' => 'nullable|string|max:30',
            'entrenador_id' => 'nullable|integer',
        ]);

        return response()->json(Clase::create($data), 201);
    }

    public function show(Clase $clase)
    {
        return response()->json($clase);
    }

    public function update(Request $request, Clase $clase)
    {
        $clase->update($request->only([
            'nombre','descripcion','hora_inicio','hora_fin','cupo_maximo','estado','entrenador_id'
        ]));

        return response()->json($clase);
    }

    public function destroy(Clase $clase)
    {
        $clase->delete();
        return response()->json(['mensaje' => 'Clase eliminada correctamente']);
    }
}
