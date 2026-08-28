<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'nombre_usuario', 'contrasena', 'nombres', 'apellidos', 'dni',
        'telefono', 'correo', 'rol', 'estado', 'fecha_registro'
    ];

    protected $hidden = ['contrasena'];

    protected $casts = [
        'fecha_registro' => 'datetime',
    ];

    public function compras()
    {
        return $this->hasMany(Compra::class, 'id_usuario', 'id_usuario');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'id_usuario', 'id_usuario');
    }
}
