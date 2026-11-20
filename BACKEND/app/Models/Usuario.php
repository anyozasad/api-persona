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
        // Cuentas de instalaciones anteriores suelen requerir username,
        // password y email, además de los nombres modernos de Laravel.
        static::creating(function (self $usuario): void {
            if (!Schema::hasTable('usuarios')) {
                return;
            }
            foreach ([
                'username' => 'nombre_usuario',
                'password' => 'contrasena',
                'email' => 'correo',
            ] as $anterior => $actual) {
                if (Schema::hasColumn('usuarios', $anterior)) {
                    $usuario->setAttribute($anterior, $usuario->getAttribute($actual));
                }
            }
            if (Schema::hasColumn('usuarios', 'name')) {
                $usuario->setAttribute('name', trim(
                    (string) $usuario->getAttribute('nombres').' '.
                    (string) $usuario->getAttribute('apellidos')
                ));
            }
        });

        static::created(function (self $usuario): void {
            if (!Schema::hasTable('usuarios') || !Schema::hasColumn('usuarios', 'id_usuario')) return;
            if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) return;

            $columnas = DB::select('SHOW COLUMNS FROM usuarios');
            foreach ($columnas as $campo) {
                if ((string) $campo->Field === 'id_usuario'
                    && str_contains(strtolower((string) ($campo->Extra ?? '')), 'generated')) {
                    // El ID se calcula en MySQL. No se puede asignar manualmente.
                    return;
                }
            }
            foreach ($columnas as $campo) {
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
