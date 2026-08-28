<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    protected $table = 'compras';
    protected $primaryKey = 'id_compra';
    public $timestamps = false;
    protected $guarded = [];

    public function proveedor() { return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor'); }
    public function usuario() { return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario'); }
    public function detalles() { return $this->hasMany(DetalleCompra::class, 'id_compra', 'id_compra'); }
}
