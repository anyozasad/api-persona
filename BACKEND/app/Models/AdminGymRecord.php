<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminGymRecord extends Model
{
    protected $table = 'admin_gym_records';

    protected $fillable = [
        'modulo',
        'titulo',
        'subtitulo',
        'estado',
        'fecha',
        'monto',
        'imagen_url',
        'datos',
    ];

    protected $casts = [
        'fecha' => 'date:Y-m-d',
        'monto' => 'decimal:2',
        'datos' => 'array',
    ];
}
