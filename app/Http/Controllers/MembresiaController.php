<?php

namespace App\Http\Controllers;

use App\Models\Membresia;
use Illuminate\Http\Request;

class MembresiaController extends Controller
{
    public function index()
    {
        return response()->json(Membresia::withCount('miembros')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'precio' => 'required|numeric|min:0',
            'duracion_dias' => 'required|integer|min:1',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string|max:30',
        ]);

        return response()->json(Membresia::create($data), 201);
    }

    public function show(Membresia $membresia)
    {
        return response()->json($membresia->load('miembros'));
    }

    public function update(Request $request, Membresia $membresia)
    {
        $membresia->update($request->only(['nombre','precio','duracion_dias','descripcion','estado']));
        return response()->json($membresia);
    }

    public function destroy(Membresia $membresia)
    {
        $membresia->delete();
        return response()->json(['mensaje' => 'Membresía eliminada correctamente']);
    }
}
