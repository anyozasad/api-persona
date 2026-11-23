<?php

namespace App\Services;

use App\Models\Caja;
use App\Models\MovimientoCaja;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CajaService
{
    public function cajaAbierta(): ?Caja
    {
        return Caja::whereRaw('LOWER(estado) = ?', ['abierta'])->orderByDesc('fecha_apertura')->first();
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

        $datos = [
            'id_caja' => $caja->id_caja ?: $caja->getAttribute('id'),
            'id_usuario' => $idUsuario,
            'tipo' => $tipo,
            'origen' => $origen,
            'referencia_tipo' => $referenciaTipo,
            'referencia_id' => $referenciaId,
            'descripcion' => $descripcion,
            'monto' => round($monto, 2),
            'fecha_movimiento' => now(),
            'estado' => 'Registrado',
        ];

        // En la antigua gym_system, movimientos_caja.caja_id sigue siendo
        // obligatorio, y movimientos_caja.id es el AUTO_INCREMENT auténtico.
        // Una venta en efectivo fallaba por no enviar caja_id aunque el
        // sistema ya hubiera creado ventas y descontado el stock.
        if (Schema::hasColumn('movimientos_caja', 'id')
            && Schema::hasColumn('movimientos_caja', 'caja_id')) {
            $columnas = array_fill_keys(Schema::getColumnListing('movimientos_caja'), true);
            $datos['caja_id'] = (int) ($caja->getAttribute('id') ?: $caja->id_caja);
            $idLegacy = (int) DB::table('movimientos_caja')->insertGetId($datos, 'id');
            if (isset($columnas['id_movimiento'])) {
                DB::table('movimientos_caja')->where('id', $idLegacy)
                    ->update(['id_movimiento' => $idLegacy]);
            }
            return MovimientoCaja::findOrFail($idLegacy);
        }

        return MovimientoCaja::create($datos);
    }
}
