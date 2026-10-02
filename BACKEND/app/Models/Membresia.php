<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Membresia extends Model
{
    protected $table = 'membresias';
    protected $primaryKey = 'id_membresia';
    public $timestamps = false;

    protected $fillable = [
        'nombre', 'duracion_meses', 'precio', 'descripcion', 'beneficios', 'permite_reservas', 'estado'
    ];

    protected $casts = [
        'duracion_meses' => 'integer',
        'precio' => 'decimal:2',
        'beneficios' => 'array',
        'permite_reservas' => 'boolean',
    ];

    public function clienteMembresias()
    {
        return $this->hasMany(ClienteMembresia::class, 'id_membresia', 'id_membresia');
    }
}
