<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleRutina extends Model
{
    protected $table = 'detalle_rutina';
    protected $primaryKey = 'id_detalle_rutina';
    public $timestamps = false;

    protected $fillable = [
        'id_rutina', 'ejercicio', 'series', 'repeticiones', 'peso_recomendado',
        'descanso_segundos', 'observaciones'
    ];

    protected $casts = [
        'series' => 'integer',
        'repeticiones' => 'integer',
        'peso_recomendado' => 'decimal:2',
        'descanso_segundos' => 'integer',
    ];

    public function rutina()
    {
        return $this->belongsTo(Rutina::class, 'id_rutina', 'id_rutina');
    }
}
