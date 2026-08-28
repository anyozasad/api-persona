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
        $registro = ($this->modelClass)::create($request->all());
        return response()->json($registro, 201);
    }

    public function show(string $id)
    {
        return response()->json(($this->modelClass)::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $registro = ($this->modelClass)::findOrFail($id);
        $registro->update($request->all());
        return response()->json($registro);
    }

    public function destroy(string $id)
    {
        $registro = ($this->modelClass)::findOrFail($id);
        $registro->delete();
        return response()->json(null, 204);
    }
}
