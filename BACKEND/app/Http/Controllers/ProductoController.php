<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;

class ProductoController extends Controller
{
    /**
     * La instalación original gym_system tiene productos.id / categoria_id.
     * La instalación Laravel nueva utiliza id_producto / id_categoria.
     * Ambas deben operar en la misma conexión DB_DATABASE, sin copiar
     * registros a una tabla paralela ni perder fotografías ya almacenadas.
     */
    private function usaEsquemaOriginal(): bool
    {
        return Schema::hasTable('productos')
            && Schema::hasColumn('productos', 'id')
            && !Schema::hasColumn('productos', 'id_producto');
    }


    public function index(Request $request)
    {
        if ($this->usaEsquemaOriginal()) {
            return app(GymSystemAdminController::class)->productos();
        }
        $query = Producto::with('categoria')->orderBy('nombre_producto');

        if ($request->boolean('stock_bajo')) {
            $query->whereColumn('stock', '<=', 'stock_minimo');
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        if ($this->usaEsquemaOriginal()) {
            $respuesta = app(GymSystemAdminController::class)->guardarProducto($request);
            $id = (int) ($respuesta->getData(true)['id_producto'] ?? 0);
            return response()->json(
                app(GymSystemAdminController::class)->producto((string) $id)->getData(true),
                201
            );
        }
        $datos = $request->validate([
            'id_categoria' => 'required|integer|exists:categorias,id_categoria',
            'codigo_producto' => 'required|string|max:60|unique:productos,codigo_producto',
            'nombre_producto' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:500',
            'foto' => 'nullable|string|max:3000000',
            'precio_compra' => 'nullable|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'unidad_medida' => 'required|string|max:50',
            'fecha_registro' => 'nullable|date',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        if (array_key_exists('foto', $datos) && $datos['foto'] !== null && $datos['foto'] !== '') {
            abort_unless(
                preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+\/=]+$/i', $datos['foto']) === 1,
                422,
                'La imagen del producto no tiene un formato válido.'
            );
        }

        $datos['foto'] = $datos['foto'] ?? null;
        $datos['precio_compra'] = $datos['precio_compra'] ?? 0;
        $datos['stock'] = $datos['stock'] ?? 0;
        $datos['stock_minimo'] = $datos['stock_minimo'] ?? 0;
        $datos['fecha_registro'] = $datos['fecha_registro'] ?? now();
        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Producto::create($datos)->load('categoria'), 201);
    }

    public function show(string $id)
    {
        if ($this->usaEsquemaOriginal()) {
            return app(GymSystemAdminController::class)->producto($id);
        }
        return response()->json(
            Producto::with(['categoria', 'detallesCompra.compra', 'detallesVenta.venta'])
                ->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        if ($this->usaEsquemaOriginal()) {
            app(GymSystemAdminController::class)->actualizarProducto($request, $id);
            return app(GymSystemAdminController::class)->producto($id);
        }
        $producto = Producto::findOrFail($id);

        $datos = $request->validate([
            'id_categoria' => 'sometimes|integer|exists:categorias,id_categoria',
            'codigo_producto' => [
                'sometimes', 'string', 'max:60',
                Rule::unique('productos', 'codigo_producto')->ignore($producto->id_producto, 'id_producto'),
            ],
            'nombre_producto' => 'sometimes|string|max:150',
            'descripcion' => 'sometimes|nullable|string|max:500',
            'foto' => 'sometimes|nullable|string|max:3000000',
            'precio_compra' => 'sometimes|numeric|min:0',
            'precio_venta' => 'sometimes|numeric|min:0',
            'stock_minimo' => 'sometimes|integer|min:0',
            'unidad_medida' => 'sometimes|string|max:50',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        if (array_key_exists('foto', $datos) && $datos['foto'] !== null && $datos['foto'] !== '') {
            abort_unless(
                preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+\/=]+$/i', $datos['foto']) === 1,
                422,
                'La imagen del producto no tiene un formato válido.'
            );
        }

        if (array_key_exists('foto', $datos) && $datos['foto'] === '') {
            $datos['foto'] = null;
        }

        // El stock no se modifica desde este CRUD: cambia mediante compras y ventas.
        $producto->update($datos);

        return response()->json($producto->fresh('categoria'));
    }

    public function destroy(string $id)
    {
        if ($this->usaEsquemaOriginal()) {
            $request = Request::create('/api/productos/'.$id, 'DELETE', ['estado' => 'Inactivo']);
            app(GymSystemAdminController::class)->cambiarEstadoProducto($request, $id);
            return response()->json([
                'mensaje' => 'Producto desactivado correctamente. Se conserva su historial.',
                'producto' => app(GymSystemAdminController::class)->producto($id)->getData(true),
            ]);
        }
        $producto = Producto::findOrFail($id);
        $producto->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Producto desactivado correctamente. Se conserva su historial.',
            'producto' => $producto->fresh(),
        ]);
    }
}
