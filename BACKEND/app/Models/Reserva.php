<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reservas';
    protected $primaryKey = 'id_reserva';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente', 'id_clase', 'fecha_clase', 'fecha_reserva', 'estado'
    ];

    protected $casts = [
        'fecha_clase' => 'date',
        'fecha_reserva' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase', 'id_clase');
    }
}
