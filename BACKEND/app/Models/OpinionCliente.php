<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpinionCliente extends Model
{
    protected $table = 'opiniones_cliente';
    protected $primaryKey = 'id_opinion';

    protected $fillable = [
        'id_cliente', 'categoria', 'calificacion', 'comentario', 'estado', 'fecha',
    ];

    protected $casts = [
        'calificacion' => 'integer',
        'fecha' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}
