<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('usuarios') || Schema::hasColumn('usuarios', 'id_usuario')) {
            return;
        }

        $driver = DB::connection()->getDriverName();
        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            throw new RuntimeException('La reparacion de usuarios legacy requiere MySQL o MariaDB.');
        }

        // No borrar, reemplazar ni recrear usuarios: conservar todas sus cuentas.
        $campos = DB::select('SHOW COLUMNS FROM usuarios');
        $columnaAuto = null;
        foreach ($campos as $campo) {
            if (str_contains(strtolower((string) ($campo->Extra ?? '')), 'auto_increment')) {
                $columnaAuto = (string) $campo->Field;
                break;
            }
        }

        if ($columnaAuto !== null) {
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $columnaAuto)) {
                throw new RuntimeException('El identificador actual tiene un nombre incompatible.');
            }

            // MySQL admite un solo AUTO_INCREMENT por tabla. Preservar el que ya
            // existe y copiar sus IDs a la columna esperada por Laravel.
            Schema::table('usuarios', function (Blueprint $tabla) {
                $tabla->unsignedBigInteger('id_usuario')->nullable()
                    ->unique('usuarios_id_usuario_unique');
            });

            DB::table('usuarios')->whereNull('id_usuario')
                ->update(['id_usuario' => DB::raw($columnaAuto)]);
        } else {
            // Sin autoincremento previo, MySQL asigna IDs a filas existentes
            // sin afectar los registros ni las contrasenas.
            DB::statement('ALTER TABLE usuarios ADD COLUMN id_usuario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ADD UNIQUE KEY usuarios_id_usuario_unique (id_usuario)');
        }
    }

    public function down(): void
    {
        // No eliminar IDs en rollback: los tokens y relaciones pueden depender de ellos.
    }
};
