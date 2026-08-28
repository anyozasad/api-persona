<?php

namespace App\Http\Controllers;

use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VentaController extends Controller
{
    public function index()
    {
        return response()->json(
            Venta::with(['cliente', 'usuario', 'detalles.producto'])
                ->orderByDesc('fecha_venta')
                ->get()
        );
    }

    public function show(string $id)
    {
        return response()->json(
            Venta::with(['cliente', 'usuario', 'detalles.producto'])
                ->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'fecha_venta' => 'nullable|date',
            'tipo_comprobante' => 'required|string|max:50',
            'numero_comprobante' => 'required|string|max:80',
            'igv_porcentaje' => 'nullable|numeric|min:0|max:100',
            'items' => 'required|array|min:1',
            'items.*.id_producto' => 'required|integer|exists:productos,id_producto',
            'items.*.cantidad' => 'required|integer|min:1',
        ]);

        if (Venta::where('numero_comprobante', $datos['numero_comprobante'])->exists()) {
            throw ValidationException::withMessages([
                'numero_comprobante' => ['Ese comprobante de venta ya fue registrado.'],
            ]);
        }

        $venta = DB::transaction(function () use ($datos, $request) {
            $itemsPreparados = [];
            $subtotal = 0;

            foreach ($datos['items'] as $item) {
                $producto = Producto::where('id_producto', $item['id_producto'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if (mb_strtolower((string) $producto->estado) !== 'activo') {
                    throw ValidationException::withMessages([
                        'items' => ["El producto {$producto->nombre_producto} no se encuentra activo."],
                    ]);
                }

                if ((int) $producto->stock < (int) $item['cantidad']) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Stock insuficiente para {$producto->nombre_producto}. Disponible: {$producto->stock}."
                        ],
                    ]);
                }

                $precio = (float) $producto->precio_venta;
                $subtotalItem = round((float) $item['cantidad'] * $precio, 2);
                $subtotal += $subtotalItem;

                $itemsPreparados[] = [
                    'producto' => $producto,
                    'cantidad' => (int) $item['cantidad'],
                    'precio_unitario' => $precio,
                    'subtotal' => $subtotalItem,
                ];
            }

            $porcentajeIgv = array_key_exists('igv_porcentaje', $datos)
                ? (float) $datos['igv_porcentaje']
                : 18.0;

            $subtotal = round($subtotal, 2);
            $igv = round($subtotal * ($porcentajeIgv / 100), 2);
            $total = round($subtotal + $igv, 2);

            $venta = Venta::create([
                'id_cliente' => $datos['id_cliente'],
                'id_usuario' => $request->user()->id_usuario,
                'fecha_venta' => $datos['fecha_venta'] ?? now(),
                'tipo_comprobante' => $datos['tipo_comprobante'],
                'numero_comprobante' => $datos['numero_comprobante'],
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
            ]);

            foreach ($itemsPreparados as $item) {
                DetalleVenta::create([
                    'id_venta' => $venta->id_venta,
                    'id_producto' => $item['producto']->id_producto,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $item['precio_unitario'],
                    'subtotal' => $item['subtotal'],
                ]);

                $item['producto']->decrement('stock', $item['cantidad']);
            }

            return $venta;
        });

        return response()->json([
            'mensaje' => 'Venta registrada y stock descontado correctamente.',
            'venta' => $venta->load(['cliente', 'usuario', 'detalles.producto']),
        ], 201);
    }
}
