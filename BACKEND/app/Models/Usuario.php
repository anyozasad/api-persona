<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    /**
     * Mantiene id_usuario al crear cuentas en tablas antiguas que ya
     * tienen otro identificador AUTO_INCREMENT (por ejemplo id).
     */
    protected static function booted(): void
    {
        static::created(function (self $usuario): void {
            if (!Schema::hasTable('usuarios') || !Schema::hasColumn('usuarios', 'id_usuario')) return;
            if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) return;

            foreach (DB::select('SHOW COLUMNS FROM usuarios') as $campo) {
                $nombre = (string) $campo->Field;
                if ($nombre === 'id_usuario' || !str_contains(strtolower((string) ($campo->Extra ?? '')), 'auto_increment')) continue;
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $nombre)) return;
                $id = (int) $usuario->getKey();
                if ($id > 0) {
                    DB::table('usuarios')->where($nombre, $id)->whereNull('id_usuario')
                        ->update(['id_usuario' => $id]);
                }
                return;
            }
        });
    }

    protected $fillable = [
        'nombre_usuario', 'contrasena', 'nombres', 'apellidos', 'dni',
        'telefono', 'correo', 'rol', 'estado', 'fecha_registro',
        'id_cliente', 'id_entrenador',
    ];

    protected $hidden = [
        'contrasena',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'contrasena' => 'hashed',
    ];

    public function getAuthPassword(): string
    {
        return (string) $this->contrasena;
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function entrenador()
    {
        return $this->belongsTo(Entrenador::class, 'id_entrenador', 'id_entrenador');
    }

    public function compras()
    {
        return $this->hasMany(Compra::class, 'id_usuario', 'id_usuario');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'id_usuario', 'id_usuario');
    }
}
