<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;

class CategoriaController extends Controller
{
    private function usaEsquemaOriginal(): bool
    {
        return Schema::hasTable('categorias')
            && Schema::hasColumn('categorias', 'id')
            && !Schema::hasColumn('categorias', 'id_categoria');
    }


    public function index()
    {
        if ($this->usaEsquemaOriginal()) {
            return app(GymSystemAdminController::class)->categorias();
        }
        return response()->json(
            Categoria::withCount('productos')->orderBy('nombre_categoria')->get()
        );
    }

    public function store(Request $request)
    {
        if ($this->usaEsquemaOriginal()) {
            $respuesta = app(GymSystemAdminController::class)->guardarCategoria($request);
            $id = (int) ($respuesta->getData(true)['id_categoria'] ?? 0);
            $categoria = collect(app(GymSystemAdminController::class)->categorias()->getData(true))
                ->firstWhere('id_categoria', $id);
            return response()->json($categoria, 201);
        }
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
        if ($this->usaEsquemaOriginal()) {
            $categoria = collect(app(GymSystemAdminController::class)->categorias()->getData(true))
                ->firstWhere('id_categoria', (int) $id);
            abort_if(!$categoria, 404, 'Categoría no encontrada.');
            return response()->json($categoria);
        }
        return response()->json(Categoria::with('productos')->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        if ($this->usaEsquemaOriginal()) {
            app(GymSystemAdminController::class)->actualizarCategoria($request, $id);
            return $this->show($id);
        }
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
        if ($this->usaEsquemaOriginal()) {
            $request = Request::create('/api/categorias/'.$id, 'DELETE', ['estado' => 'Inactivo']);
            app(GymSystemAdminController::class)->cambiarEstadoCategoria($request, $id);
            return response()->json([
                'mensaje' => 'Categoría desactivada; se conserva el historial de productos.',
                'categoria' => $this->show($id)->getData(true),
            ]);
        }
        $categoria = Categoria::findOrFail($id);
        $categoria->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Categoría desactivada; se conserva el historial de productos.',
            'categoria' => $categoria->fresh(),
        ]);
    }
}
