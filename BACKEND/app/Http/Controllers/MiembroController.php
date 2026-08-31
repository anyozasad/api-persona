<?php

namespace App\Http\Controllers;

use App\Models\Miembro;
use Illuminate\Http\Request;

class MiembroController extends Controller
{
    public function index()
    {
        return response()->json(Miembro::with('membresia')->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:120',
            'apellido' => 'required|string|max:120',
            'dni' => 'required|string|max:20',
            'telefono' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'fecha_nacimiento' => 'nullable|date',
            'fecha_ingreso' => 'nullable|date',
            'estado' => 'nullable|string|max:30',
            'membresia_id' => 'nullable|integer',
        ]);

        return response()->json(Miembro::create($data), 201);
    }

    public function show(Miembro $miembro)
    {
        return response()->json($miembro->load('membresia'));
    }

    public function update(Request $request, Miembro $miembro)
    {
        $miembro->update($request->only([
            'nombre','apellido','dni','telefono','email','fecha_nacimiento',
            'fecha_ingreso','estado','membresia_id'
        ]));

        return response()->json($miembro->fresh('membresia'));
    }

    public function destroy(Miembro $miembro)
    {
        $miembro->delete();
        return response()->json(['mensaje' => 'Miembro eliminado correctamente']);
    }
}
