<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleCompra extends Model
{
    protected $table = 'detalle_compra';
    protected $primaryKey = 'id_detalle_compra';
    public $timestamps = false;
    protected $guarded = [];

    public function compra() { return $this->belongsTo(Compra::class, 'id_compra', 'id_compra'); }
    public function producto() { return $this->belongsTo(Producto::class, 'id_producto', 'id_producto'); }
}
