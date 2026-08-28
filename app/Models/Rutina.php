<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rutina extends Model
{
    protected $table = 'rutinas';
    protected $primaryKey = 'id_rutina';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente', 'id_entrenador', 'nombre_rutina', 'objetivo', 'descripcion',
        'fecha_inicio', 'fecha_fin', 'estado'
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'id_entrenador', 'id_entrenador');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleRutina::class, 'id_rutina', 'id_rutina');
    }
}
