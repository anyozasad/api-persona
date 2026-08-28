<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Auditoria extends Model
{
    protected $table = 'auditorias';
    protected $primaryKey = 'id_auditoria';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario', 'usuario', 'rol', 'metodo', 'ruta', 'ip', 'status', 'fecha',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];
}
