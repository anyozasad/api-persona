<?php

namespace App\Services;

use App\Models\MovimientoInventario;
use App\Models\Producto;

class InventarioService
{
    public function registrar(
        Producto $producto,
        ?int $idUsuario,
        string $tipo,
        string $origen,
        int $cantidad,
        int $stockAnterior,
        int $stockNuevo,
        ?string $referenciaTipo = null,
        ?int $referenciaId = null,
        ?string $observacion = null
    ): MovimientoInventario {
        return MovimientoInventario::create([
            'id_producto' => $producto->id_producto,
            'id_usuario' => $idUsuario,
            'tipo' => $tipo,
            'origen' => $origen,
            'referencia_tipo' => $referenciaTipo,
            'referencia_id' => $referenciaId,
            'cantidad' => $cantidad,
            'stock_anterior' => $stockAnterior,
            'stock_nuevo' => $stockNuevo,
            'observacion' => $observacion,
            'fecha_movimiento' => now(),
        ]);
    }
}
