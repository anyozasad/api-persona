<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoMembresia extends Model
{
    protected $table = 'pagos_membresia';
    protected $primaryKey = 'id_pago';
    public $timestamps = false;
    protected $guarded = [];

    public function clienteMembresia() { return $this->belongsTo(ClienteMembresia::class, 'id_cliente_membresia', 'id_cliente_membresia'); }
}
