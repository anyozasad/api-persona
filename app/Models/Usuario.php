<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;
    protected $guarded = [];
    protected $hidden = ['contrasena'];

    public function compras() { return $this->hasMany(Compra::class, 'id_usuario', 'id_usuario'); }
    public function ventas() { return $this->hasMany(Venta::class, 'id_usuario', 'id_usuario'); }
}
