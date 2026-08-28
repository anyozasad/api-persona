<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoMembresia extends Model
{
    protected $table = 'pagos_membresia';
    protected $primaryKey = 'id_pago';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente_membresia', 'fecha_pago', 'monto', 'metodo_pago',
        'numero_operacion', 'observacion', 'estado_pago'
    ];

    protected $casts = [
        'fecha_pago' => 'datetime',
        'monto' => 'decimal:2',
    ];

    public function clienteMembresia()
    {
        return $this->belongsTo(ClienteMembresia::class, 'id_cliente_membresia', 'id_cliente_membresia');
    }
}
