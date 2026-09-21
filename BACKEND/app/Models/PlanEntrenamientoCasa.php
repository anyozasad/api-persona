<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanEntrenamientoCasa extends Model
{
    protected $table = 'planes_entrenamiento_casa';
    protected $primaryKey = 'id_plan_casa';

    protected $fillable = [
        'id_cliente',
        'dias',
        'zonas',
        'activo',
    ];

    protected $casts = [
        'dias' => 'array',
        'zonas' => 'array',
        'activo' => 'boolean',
    ];
}
