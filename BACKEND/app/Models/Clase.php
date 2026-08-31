<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clase extends Model
{
    protected $table = 'clases';
    protected $primaryKey = 'id_clase';
    public $timestamps = false;

    protected $fillable = [
        'id_entrenador', 'nombre', 'descripcion', 'dia_semana',
        'hora_inicio', 'hora_fin', 'cupo_maximo', 'estado'
    ];

    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'id_entrenador', 'id_entrenador');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_clase', 'id_clase');
    }
}
