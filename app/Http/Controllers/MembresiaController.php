<?php

namespace App\Http\Controllers;

use App\Models\Membresia;
use Illuminate\Http\Request;

class MembresiaController extends Controller
{
    public function index()
    {
        return response()->json(Membresia::withCount('clienteMembresias')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100',
            'duracion_meses' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string|max:30',
        ]);

        return response()->json(Membresia::create($data), 201);
    }

    public function show(Membresia $membresia)
    {
        return response()->json($membresia->load('clienteMembresias.cliente'));
    }

    public function update(Request $request, Membresia $membresia)
    {
        $membresia->update($request->only([
            'nombre', 'duracion_meses', 'precio', 'descripcion', 'estado'
        ]));

        return response()->json($membresia);
    }

    public function destroy(Membresia $membresia)
    {
        $membresia->delete();
        return response()->json(['mensaje' => 'Membresía eliminada correctamente']);
    }
}
