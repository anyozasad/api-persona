<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;

class PersonaController extends Controller
{
    //LISTAR TODOS
    public function index()
    {
        $personas = Persona::all();
        return response()->json($personas);
    }

    //BUSCAR POR ID
    public function show(string $id)
    {
        $persona = Persona::find($id);
        if (!$persona) {
            return response()->json(['mensaje' => 'persona no encontrada'], 404);
        }
        return response()->json($persona);
    }

    //AGREGAR
    public function store(Request $request)
    {
        $persona = Persona::create($request->all());
        return response()->json(['mensaje' => 'persona creada correctamente', 'persona' =>$persona], 201);
    }

    //MODIFICAR
    public function update(Request $request, string $id)
    {
        $persona = Persona::find($id);
        if (!$persona) {
            return response()->json(['mensaje' => 'persona no encontrada'], 404);
        }
        $persona->update($request->all());
        return response()->json(['mensaje' => 'persona actualizada correctamente', 'persona' =>$persona], 201);
    }

    //ELIMINAR
    public function destroy(int$id)
    {
        $persona = Persona::find($id);
        if (!$persona) {
            return response()->json(['mensaje' => 'persona no encontrada'], 404);
        }
        $persona->delete();
        return response()->json(['mensaje' => 'persona eliminada correctamente'], 201);
    }
}
