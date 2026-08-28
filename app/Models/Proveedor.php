<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    protected $table = 'proveedores';
    protected $primaryKey = 'id_proveedor';
    public $timestamps = false;
    protected $guarded = [];

    public function compras() { return $this->hasMany(Compra::class, 'id_proveedor', 'id_proveedor'); }
}
