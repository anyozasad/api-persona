<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Caja extends Model
{
    protected $table = 'cajas';
    protected $primaryKey = 'id_caja';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario_apertura', 'fecha_apertura', 'monto_inicial', 'fecha_cierre',
        'monto_esperado', 'monto_real', 'diferencia', 'estado', 'observacion',
    ];

    protected $casts = [
        'fecha_apertura' => 'datetime',
        'fecha_cierre' => 'datetime',
        'monto_inicial' => 'decimal:2',
        'monto_esperado' => 'decimal:2',
        'monto_real' => 'decimal:2',
        'diferencia' => 'decimal:2',
    ];

    public function usuarioApertura()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario_apertura', 'id_usuario');
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoCaja::class, 'id_caja', 'id_caja');
    }
}
