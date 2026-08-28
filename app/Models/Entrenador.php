<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entrenador extends Model
{
    protected $table = 'entrenadores';
    protected $primaryKey = 'id_entrenador';
    public $timestamps = false;

    protected $fillable = [
        'dni', 'nombres', 'apellidos', 'telefono', 'correo', 'especialidad',
        'fecha_contratacion', 'salario', 'estado'
    ];

    protected $casts = [
        'fecha_contratacion' => 'date',
        'salario' => 'decimal:2',
    ];

    public function rutinas()
    {
        return $this->hasMany(Rutina::class, 'id_entrenador', 'id_entrenador');
    }
}
