<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SesionEntrenamientoCasa extends Model
{
    protected $table = 'sesiones_entrenamiento_casa';
    protected $primaryKey = 'id_sesion_casa';

    protected $fillable = [
        'id_cliente',
        'zona',
        'fecha',
        'duracion_segundos',
        'ejercicios_total',
        'ejercicios_completados',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'duracion_segundos' => 'integer',
        'ejercicios_total' => 'integer',
        'ejercicios_completados' => 'integer',
    ];
}
