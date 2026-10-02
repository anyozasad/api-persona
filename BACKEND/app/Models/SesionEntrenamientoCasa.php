<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SesionEntrenamientoCasa extends Model
{
    protected $table = 'sesiones_entrenamiento_casa';
    protected $primaryKey = 'id_sesion_casa';

    protected $fillable = [
        'id_cliente',
        'id_rutina',
        'zona',
        'fecha',
        'duracion_segundos',
        'ejercicios_total',
        'ejercicios_completados',
        'estado',
    ];

    protected $casts = [
        'id_rutina' => 'integer',
        'fecha' => 'datetime',
        'duracion_segundos' => 'integer',
        'ejercicios_total' => 'integer',
        'ejercicios_completados' => 'integer',
    ];

    public function rutina()
    {
        return $this->belongsTo(Rutina::class, 'id_rutina', 'id_rutina');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleSesionEntrenamiento::class, 'id_sesion_casa', 'id_sesion_casa');
    }
}
