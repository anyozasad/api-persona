<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clase extends Model
{
    protected $table = 'clases';

    protected $fillable = [
        'nombre', 'descripcion', 'hora_inicio', 'hora_fin',
        'cupo_maximo', 'estado', 'entrenador_id'
    ];
}
