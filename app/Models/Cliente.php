<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';
    public $timestamps = false;
    protected $guarded = [];

    public function clienteMembresias() { return $this->hasMany(ClienteMembresia::class, 'id_cliente', 'id_cliente'); }
    public function asistencias() { return $this->hasMany(Asistencia::class, 'id_cliente', 'id_cliente'); }
    public function rutinas() { return $this->hasMany(Rutina::class, 'id_cliente', 'id_cliente'); }
    public function ventas() { return $this->hasMany(Venta::class, 'id_cliente', 'id_cliente'); }
}
