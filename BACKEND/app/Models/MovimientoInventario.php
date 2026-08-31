<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoInventario extends Model
{
    protected $table = 'movimientos_inventario';
    protected $primaryKey = 'id_movimiento_inventario';
    public $timestamps = false;

    protected $fillable = [
        'id_producto', 'id_usuario', 'tipo', 'origen', 'referencia_tipo', 'referencia_id',
        'cantidad', 'stock_anterior', 'stock_nuevo', 'observacion', 'fecha_movimiento',
    ];

    protected $casts = [
        'fecha_movimiento' => 'datetime',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
