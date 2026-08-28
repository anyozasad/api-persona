<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    protected $table = 'asistencias';
    protected $primaryKey = 'id_asistencia';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente', 'fecha_hora_entrada', 'fecha_hora_salida', 'observacion', 'estado'
    ];

    protected $casts = [
        'fecha_hora_entrada' => 'datetime',
        'fecha_hora_salida' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}
