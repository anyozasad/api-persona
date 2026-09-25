<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificacionCliente extends Model
{
    protected $table = 'notificaciones_cliente';
    protected $primaryKey = 'id_notificacion';

    protected $fillable = [
        'id_cliente', 'titulo', 'mensaje', 'tipo', 'leida', 'fecha',
    ];

    protected $casts = [
        'leida' => 'boolean',
        'fecha' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}
