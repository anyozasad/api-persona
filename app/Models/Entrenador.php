<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entrenador extends Model
{
    protected $table = 'entrenadores';
    protected $primaryKey = 'id_entrenador';
    public $timestamps = false;
    protected $guarded = [];

    public function rutinas() { return $this->hasMany(Rutina::class, 'id_entrenador', 'id_entrenador'); }
}
