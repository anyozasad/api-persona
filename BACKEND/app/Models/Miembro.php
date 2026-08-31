<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Miembro extends Model
{
    protected $table = 'miembros';

    protected $fillable = [
        'nombre', 'apellido', 'dni', 'telefono', 'email',
        'fecha_nacimiento', 'fecha_ingreso', 'estado', 'membresia_id'
    ];

    public function membresia()
    {
        return $this->belongsTo(Membresia::class);
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class);
    }
}
