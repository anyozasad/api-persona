<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
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
        $datos = $request->validate([
            'id_categoria' => 'required|integer|exists:categorias,id_categoria',
            'codigo_producto' => 'required|string|max:60|unique:productos,codigo_producto',
            'nombre_producto' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:500',
            'precio_compra' => 'nullable|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'unidad_medida' => 'required|string|max:50',
            'fecha_registro' => 'nullable|date',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['precio_compra'] = $datos['precio_compra'] ?? 0;
        $datos['stock'] = $datos['stock'] ?? 0;
        $datos['stock_minimo'] = $datos['stock_minimo'] ?? 0;
        $datos['fecha_registro'] = $datos['fecha_registro'] ?? now();
        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Producto::create($datos)->load('categoria'), 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Producto::with(['categoria', 'detallesCompra.compra', 'detallesVenta.venta'])
                ->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $producto = Producto::findOrFail($id);

        $datos = $request->validate([
            'id_categoria' => 'sometimes|integer|exists:categorias,id_categoria',
            'codigo_producto' => [
                'sometimes', 'string', 'max:60',
                Rule::unique('productos', 'codigo_producto')->ignore($producto->id_producto, 'id_producto'),
            ],
            'nombre_producto' => 'sometimes|string|max:150',
            'descripcion' => 'sometimes|nullable|string|max:500',
            'precio_compra' => 'sometimes|numeric|min:0',
            'precio_venta' => 'sometimes|numeric|min:0',
            'stock_minimo' => 'sometimes|integer|min:0',
            'unidad_medida' => 'sometimes|string|max:50',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        // El stock no se modifica desde este CRUD: cambia mediante compras y ventas.
        $producto->update($datos);

        return response()->json($producto->fresh('categoria'));
    }

    public function destroy(string $id)
    {
        $producto = Producto::findOrFail($id);
        $producto->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Producto desactivado correctamente. Se conserva su historial.',
            'producto' => $producto->fresh(),
        ]);
    }
}
