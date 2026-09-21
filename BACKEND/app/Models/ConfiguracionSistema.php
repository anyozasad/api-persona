<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionSistema extends Model
{
    protected $table = 'configuracion_sistema';

    protected $fillable = [
        'nombre_gimnasio',
        'ruc',
        'telefono',
        'correo',
        'direccion',
        'hora_apertura',
        'hora_cierre',
        'dias_atencion',
        'dias_aviso_vencimiento',
        'minutos_cancelacion_reserva',
        'dias_anticipacion_reserva',
        'stock_minimo_default',
        'notificar_vencimientos',
        'notificar_stock_bajo',
        'notificar_pagos_pendientes',
    ];

    protected $casts = [
        'dias_atencion' => 'array',
        'notificar_vencimientos' => 'boolean',
        'notificar_stock_bajo' => 'boolean',
        'notificar_pagos_pendientes' => 'boolean',
    ];
}
