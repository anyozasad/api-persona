<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class Cliente extends Model
{
    protected $table = 'clientes';
    protected $primaryKey = 'id_cliente';
    public $timestamps = false;

    /**
     * Algunas instalaciones antiguas guardan la PK autoincremental como id
     * y no como id_cliente. Mantener la correspondencia tras un alta nueva.
     */
    protected static function booted(): void
    {
        // Tablas antiguas conservan nombre/apellido/email como NOT NULL.
        // Cumplir esos campos además de los modernos sin cambiar el esquema viejo.
        static::creating(function (self $cliente): void {
            if (!Schema::hasTable('clientes')) {
                return;
            }
            foreach ([
                'nombre' => 'nombres',
                'apellido' => 'apellidos',
                'email' => 'correo',
            ] as $anterior => $actual) {
                if (Schema::hasColumn('clientes', $anterior)) {
                    $cliente->setAttribute($anterior, $cliente->getAttribute($actual));
                }
            }
        });

        static::created(function (self $cliente): void {
            if (!Schema::hasTable('clientes') || !Schema::hasColumn('clientes', 'id_cliente')) {
                return;
            }
            if (!in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
                return;
            }
            foreach (DB::select('SHOW COLUMNS FROM clientes') as $campo) {
                $nombre = (string) $campo->Field;
                if ($nombre === 'id_cliente'
                    || !str_contains(strtolower((string) ($campo->Extra ?? '')), 'auto_increment')) {
                    continue;
                }
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $nombre)) {
                    return;
                }
                $id = (int) $cliente->getKey();
                if ($id > 0) {
                    DB::table('clientes')->where($nombre, $id)->whereNull('id_cliente')
                        ->update(['id_cliente' => $id]);
                }
                return;
            }
        });
    }

    protected $fillable = [
        'dni', 'nombres', 'apellidos', 'sexo', 'telefono', 'correo',
        'direccion', 'fecha_nacimiento', 'fecha_registro', 'estado',
        'foto_perfil', 'enfoque_entrenamiento', 'nivel_entrenamiento'
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_registro' => 'datetime',
    ];

    public function clienteMembresias()
    {
        return $this->hasMany(ClienteMembresia::class, 'id_cliente', 'id_cliente');
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_cliente', 'id_cliente');
    }

    public function rutinas()
    {
        return $this->hasMany(Rutina::class, 'id_cliente', 'id_cliente');
    }

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'id_cliente', 'id_cliente');
    }
}
