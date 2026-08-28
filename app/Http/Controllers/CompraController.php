<?php

namespace App\Http\Controllers;

use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompraController extends Controller
{
    public function index()
    {
        return response()->json(
            Compra::with(['proveedor', 'usuario', 'detalles.producto'])
                ->orderByDesc('fecha_compra')
                ->get()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            Compra::with(['proveedor', 'usuario', 'detalles.producto'])
                ->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_proveedor' => 'required|integer|exists:proveedores,id_proveedor',
            'fecha_compra' => 'nullable|date',
            'tipo_comprobante' => 'required|string|max:50',
            'numero_comprobante' => 'required|string|max:80',
            'items' => 'required|array|min:1',
            'items.*.id_producto' => 'required|integer|distinct|exists:productos,id_producto',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.precio_compra' => 'required|numeric|min:0.01',
        ]);

        if (Compra::where('numero_comprobante', $datos['numero_comprobante'])->exists()) {
            throw ValidationException::withMessages([
                'numero_comprobante' => ['Ese comprobante de compra ya fue registrado.'],
            ]);
        }

        $compra = DB::transaction(function () use ($datos, $request) {
            $itemsPreparados = [];
            $total = 0;

            foreach ($datos['items'] as $item) {
                $producto = Producto::where('id_producto', $item['id_producto'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $subtotal = round((float) $item['cantidad'] * (float) $item['precio_compra'], 2);
                $total += $subtotal;

                $itemsPreparados[] = [
                    'producto' => $producto,
                    'cantidad' => (int) $item['cantidad'],
                    'precio_compra' => (float) $item['precio_compra'],
                    'subtotal' => $subtotal,
                ];
            }

            $compra = Compra::create([
                'id_proveedor' => $datos['id_proveedor'],
                'id_usuario' => $request->user()->id_usuario,
                'fecha_compra' => $datos['fecha_compra'] ?? now(),
                'tipo_comprobante' => $datos['tipo_comprobante'],
                'numero_comprobante' => $datos['numero_comprobante'],
                'total' => round($total, 2),
                'estado' => 'Registrado',
            ]);

            foreach ($itemsPreparados as $item) {
                DetalleCompra::create([
                    'id_compra' => $compra->id_compra,
                    'id_producto' => $item['producto']->id_producto,
                    'cantidad' => $item['cantidad'],
                    'precio_compra' => $item['precio_compra'],
                    'subtotal' => $item['subtotal'],
                ]);

                $item['producto']->increment('stock', $item['cantidad']);
                $item['producto']->update([
                    'precio_compra' => $item['precio_compra'],
                ]);
            }

            return $compra;
        });

        return response()->json([
            'mensaje' => 'Compra registrada y stock actualizado correctamente.',
            'compra' => $compra->load(['proveedor', 'usuario', 'detalles.producto']),
        ], 201);
    }

    public function anular(string $id)
    {
        $compra = DB::transaction(function () use ($id) {
            $compra = Compra::with('detalles')->lockForUpdate()->findOrFail($id);

            if ($compra->estado === 'Anulado') {
                return $compra;
            }

            foreach ($compra->detalles as $detalle) {
                $producto = Producto::where('id_producto', $detalle->id_producto)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ((int) $producto->stock < (int) $detalle->cantidad) {
                    throw ValidationException::withMessages([
                        'compra' => [
                            "No se puede anular la compra porque el stock actual de {$producto->nombre_producto} ya fue utilizado."
                        ],
                    ]);
                }

                $producto->decrement('stock', (int) $detalle->cantidad);
            }

            $compra->update(['estado' => 'Anulado']);

            return $compra;
        });

        return response()->json([
            'mensaje' => 'Compra anulada y stock revertido correctamente.',
            'compra' => $compra->load(['proveedor', 'usuario', 'detalles.producto']),
        ]);
    }
}
