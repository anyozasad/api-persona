<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleSesionEntrenamiento extends Model
{
    protected $table = 'detalle_sesion_entrenamiento';
    protected $primaryKey = 'id_detalle_sesion';

    protected $fillable = [
        'id_sesion_casa',
        'id_detalle_rutina',
        'series_realizadas',
        'repeticiones_realizadas',
        'peso_utilizado',
        'completado',
    ];

    protected $casts = [
        'series_realizadas' => 'integer',
        'repeticiones_realizadas' => 'integer',
        'peso_utilizado' => 'decimal:2',
        'completado' => 'boolean',
    ];

    public function sesion()
    {
        return $this->belongsTo(SesionEntrenamientoCasa::class, 'id_sesion_casa', 'id_sesion_casa');
    }

    public function detalleRutina()
    {
        return $this->belongsTo(DetalleRutina::class, 'id_detalle_rutina', 'id_detalle_rutina');
    }
}
