<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class CrudController extends Controller
{
    protected string $modelClass;

    public function index()
    {
        return response()->json(($this->modelClass)::all());
    }

    public function store(Request $request)
    {
        $modelo = new ($this->modelClass);
        $datos = $request->only($modelo->getFillable());
        $registro = ($this->modelClass)::create($datos);

        return response()->json($registro, 201);
    }

    public function show(string $id)
    {
        return response()->json(($this->modelClass)::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $registro = ($this->modelClass)::findOrFail($id);
        $datos = $request->only($registro->getFillable());
        $registro->update($datos);

        return response()->json($registro);
    }

    public function destroy(string $id)
    {
        $registro = ($this->modelClass)::findOrFail($id);
        $registro->delete();

        return response()->json(null, 204);
    }
}
