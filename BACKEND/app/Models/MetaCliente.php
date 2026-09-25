<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaCliente extends Model
{
    protected $table = 'metas_cliente';
    protected $primaryKey = 'id_meta_cliente';

    protected $fillable = [
        'id_cliente', 'sesiones_semanales', 'recordatorios',
    ];

    protected $casts = [
        'sesiones_semanales' => 'integer',
        'recordatorios' => 'boolean',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }
}
