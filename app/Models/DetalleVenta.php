<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleVenta extends Model
{
    protected $table = 'detalle_venta';
    protected $primaryKey = 'id_detalle_venta';
    public $timestamps = false;
    protected $guarded = [];

    public function venta() { return $this->belongsTo(Venta::class, 'id_venta', 'id_venta'); }
    public function producto() { return $this->belongsTo(Producto::class, 'id_producto', 'id_producto'); }
}
