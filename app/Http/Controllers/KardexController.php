<?php

namespace App\Http\Controllers;

use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Services\InventarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class KardexController extends Controller
{
    public function index(Request $request)
    {
        $query = MovimientoInventario::with(['producto', 'usuario'])
            ->orderByDesc('fecha_movimiento');

        if ($request->filled('id_producto')) {
            $query->where('id_producto', $request->integer('id_producto'));
        }

        if ($request->filled('desde')) {
            $query->whereDate('fecha_movimiento', '>=', $request->input('desde'));
        }

        if ($request->filled('hasta')) {
            $query->whereDate('fecha_movimiento', '<=', $request->input('hasta'));
        }

        return response()->json($query->limit(500)->get());
    }

    public function ajustar(Request $request, InventarioService $inventario)
    {
        $datos = $request->validate([
            'id_producto' => 'required|integer|exists:productos,id_producto',
            'tipo' => ['required', Rule::in(['Entrada', 'Salida'])],
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'required|string|max:500',
        ]);

        $resultado = DB::transaction(function () use ($datos, $request, $inventario) {
            $producto = Producto::where('id_producto', $datos['id_producto'])
                ->lockForUpdate()
                ->firstOrFail();

            $anterior = (int) $producto->stock;
            $cantidad = (int) $datos['cantidad'];
            $nuevo = $datos['tipo'] === 'Entrada'
                ? $anterior + $cantidad
                : $anterior - $cantidad;

            if ($nuevo < 0) {
                abort(422, 'El ajuste dejaría el stock en negativo.');
            }

            $producto->update(['stock' => $nuevo]);

            $movimiento = $inventario->registrar(
                $producto,
                $request->user()->id_usuario,
                $datos['tipo'],
                'Ajuste',
                $cantidad,
                $anterior,
                $nuevo,
                'Producto',
                $producto->id_producto,
                $datos['motivo']
            );

            return compact('producto', 'movimiento');
        });

        return response()->json([
            'mensaje' => 'Ajuste de inventario registrado correctamente.',
            'producto' => $resultado['producto']->fresh(),
            'movimiento' => $resultado['movimiento'],
        ]);
    }
}
