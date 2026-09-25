<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudSoporte extends Model
{
    protected $table = 'solicitudes_soporte';
    protected $primaryKey = 'id_soporte';

    protected $fillable = [
        'id_cliente', 'asunto', 'mensaje', 'respuesta', 'estado',
        'fecha', 'fecha_respuesta',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'fecha_respuesta' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}
