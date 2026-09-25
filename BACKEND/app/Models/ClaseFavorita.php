<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClaseFavorita extends Model
{
    protected $table = 'clases_favoritas';
    protected $primaryKey = 'id_favorito';

    protected $fillable = ['id_cliente', 'id_clase'];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase', 'id_clase');
    }
}
