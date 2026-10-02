<?php

namespace App\Services;

use App\Models\ConfiguracionSistema;
use App\Models\PagoMembresia;
use Carbon\Carbon;

class ComprobanteMembresiaService
{
    public function formatear(PagoMembresia $pago): array
    {
        $pago->loadMissing(['clienteMembresia.cliente', 'clienteMembresia.membresia']);
        $relacion = $pago->clienteMembresia;
        $cliente = $relacion?->cliente;
        $membresia = $relacion?->membresia;
        $config = ConfiguracionSistema::first();

        $serie = 'B001';
        $correlativo = str_pad((string) $pago->id_pago, 8, '0', STR_PAD_LEFT);
        $numero = $serie.'-'.$correlativo;
        $fecha = $pago->fecha_pago ? Carbon::parse($pago->fecha_pago) : now();
        $monto = number_format((float) $pago->monto, 2, '.', '');
        $identificadorEmpresa = trim((string) ($config?->ruc ?: 'MALLQUIGYM'));

        return [
            'id_pago' => $pago->id_pago,
            'tipo_comprobante' => 'BOLETA DE MEMBRESÍA',
            'serie' => $serie,
            'correlativo' => $correlativo,
            'numero_comprobante' => $numero,
            'fecha' => $fecha->toDateTimeString(),
            'fecha_pago' => $fecha->toDateTimeString(),
            'empresa' => [
                'nombre' => $config?->nombre_gimnasio ?: 'Mallqui Gym',
                'ruc' => $config?->ruc,
                'direccion' => $config?->direccion,
                'telefono' => $config?->telefono,
                'correo' => $config?->correo,
            ],
            'cliente' => $cliente
                ? trim($cliente->nombres.' '.$cliente->apellidos)
                : null,
            'dni' => $cliente?->dni,
            'membresia' => $membresia?->nombre,
            'periodo' => [
                'inicio' => optional($relacion?->fecha_inicio)->toDateString(),
                'fin' => optional($relacion?->fecha_fin)->toDateString(),
                'fecha_inicio' => optional($relacion?->fecha_inicio)->toDateString(),
                'fecha_fin' => optional($relacion?->fecha_fin)->toDateString(),
            ],
            'monto' => $pago->monto,
            'moneda' => 'PEN',
            'metodo_pago' => $pago->metodo_pago,
            'numero_operacion' => $pago->numero_operacion,
            'estado' => $pago->estado_pago,
            'estado_pago' => $pago->estado_pago,
            'codigo_barras' => implode('|', [
                $identificadorEmpresa,
                $serie,
                $correlativo,
                $monto,
                $fecha->format('Ymd'),
                'PEN',
            ]),
            'nota_tributaria' => 'Comprobante interno generado por Mallqui Gym. Para validez tributaria como comprobante electrónico se requiere emisión autorizada por SUNAT.',
        ];
    }
}
