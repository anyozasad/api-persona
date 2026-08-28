<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'id_producto';
    public $timestamps = false;
    protected $guarded = [];

    public function categoria() { return $this->belongsTo(Categoria::class, 'id_categoria', 'id_categoria'); }
    public function detallesCompra() { return $this->hasMany(DetalleCompra::class, 'id_producto', 'id_producto'); }
    public function detallesVenta() { return $this->hasMany(DetalleVenta::class, 'id_producto', 'id_producto'); }
}
