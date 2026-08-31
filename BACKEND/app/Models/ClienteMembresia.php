<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClienteMembresia extends Model
{
    protected $table = 'cliente_membresia';
    protected $primaryKey = 'id_cliente_membresia';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente', 'id_membresia', 'fecha_inicio', 'fecha_fin', 'estado'
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function membresia()
    {
        return $this->belongsTo(Membresia::class, 'id_membresia', 'id_membresia');
    }

    public function pagos()
    {
        return $this->hasMany(PagoMembresia::class, 'id_cliente_membresia', 'id_cliente_membresia');
    }
}
