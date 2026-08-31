<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(
            Categoria::withCount('productos')->orderBy('nombre_categoria')->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre_categoria' => 'required|string|max:120|unique:categorias,nombre_categoria',
            'descripcion' => 'nullable|string|max:500',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Categoria::create($datos), 201);
    }

    public function show(string $id)
    {
        return response()->json(Categoria::with('productos')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $categoria = Categoria::findOrFail($id);

        $datos = $request->validate([
            'nombre_categoria' => [
                'sometimes', 'string', 'max:120',
                Rule::unique('categorias', 'nombre_categoria')->ignore($categoria->id_categoria, 'id_categoria'),
            ],
            'descripcion' => 'sometimes|nullable|string|max:500',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $categoria->update($datos);

        return response()->json($categoria->fresh());
    }

    public function destroy(string $id)
    {
        $categoria = Categoria::findOrFail($id);
        $categoria->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Categoría desactivada; se conserva el historial de productos.',
            'categoria' => $categoria->fresh(),
        ]);
    }
}
