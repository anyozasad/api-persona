<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Membresia extends Model
{
    protected $table = 'membresias';

    protected $fillable = [
        'nombre', 'precio', 'duracion_dias', 'descripcion', 'estado'
    ];

    public function miembros()
    {
        return $this->hasMany(Miembro::class);
    }
}
