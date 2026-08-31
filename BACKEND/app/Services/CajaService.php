<?php

namespace App\Services;

use App\Models\Caja;
use App\Models\MovimientoCaja;

class CajaService
{
    public function cajaAbierta(): ?Caja
    {
        return Caja::where('estado', 'Abierta')->orderByDesc('fecha_apertura')->first();
    }

    public function registrarMovimiento(
        int $idUsuario,
        string $tipo,
        string $origen,
        string $descripcion,
        float $monto,
        ?string $referenciaTipo = null,
        ?int $referenciaId = null
    ): ?MovimientoCaja {
        $caja = $this->cajaAbierta();
        if (!$caja) {
            return null;
        }

        return MovimientoCaja::create([
            'id_caja' => $caja->id_caja,
            'id_usuario' => $idUsuario,
            'tipo' => $tipo,
            'origen' => $origen,
            'referencia_tipo' => $referenciaTipo,
            'referencia_id' => $referenciaId,
            'descripcion' => $descripcion,
            'monto' => round($monto, 2),
            'fecha_movimiento' => now(),
            'estado' => 'Registrado',
        ]);
    }
}
