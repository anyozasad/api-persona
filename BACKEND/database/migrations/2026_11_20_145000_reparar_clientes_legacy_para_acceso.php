<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Mantener los socios existentes; no recrear tablas ni cambiar su ID legacy.
        if (!Schema::hasTable('clientes')) {
            return;
        }

        $driver = DB::connection()->getDriverName();
        if (!Schema::hasColumn('clientes', 'id_cliente')) {
            $autoIncrement = null;
            if (in_array($driver, ['mysql', 'mariadb'], true)) {
                foreach (DB::select('SHOW COLUMNS FROM clientes') as $column) {
                    if (str_contains(strtolower((string) ($column->Extra ?? '')), 'auto_increment')) {
                        $autoIncrement = (string) $column->Field;
                        break;
                    }
                }
            }

            if ($autoIncrement !== null) {
                // MySQL no permite dos AUTO_INCREMENT en una tabla. Vinculamos
                // el id_cliente al ID existente sin tocar los números históricos.
                Schema::table('clientes', function (Blueprint $table) {
                    $table->unsignedBigInteger('id_cliente')->nullable()->unique('clientes_id_cliente_legacy_unique');
                });
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $autoIncrement)) {
                    throw new \RuntimeException('Identificador antiguo de clientes incompatible.');
                }
                DB::statement("UPDATE `clientes` SET `id_cliente` = `{$autoIncrement}` WHERE `id_cliente` IS NULL");
            } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
                DB::statement('ALTER TABLE `clientes` ADD COLUMN `id_cliente` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ADD UNIQUE KEY `clientes_id_cliente_legacy_unique` (`id_cliente`)');
            } else {
                Schema::table('clientes', function (Blueprint $table) {
                    $table->bigIncrements('id_cliente');
                });
            }
        }

        // Instalaciones antiguas de XAMPP pueden tener tabla clientes sin los
        // campos del registro actual. Agregar solo columnas ausentes.
        foreach ([
            'dni' => 15,
            'nombres' => 100,
            'apellidos' => 100,
            'sexo' => 20,
            'telefono' => 25,
            'correo' => 150,
            'direccion' => 255,
            'estado' => 20,
            'foto_perfil' => 255,
            'enfoque_entrenamiento' => 80,
            'nivel_entrenamiento' => 30,
        ] as $campo => $longitud) {
            if (!Schema::hasColumn('clientes', $campo)) {
                Schema::table('clientes', function (Blueprint $table) use ($campo, $longitud) {
                    $table->string($campo, $longitud)->nullable();
                });
            }
        }

        if (!Schema::hasColumn('clientes', 'fecha_registro')) {
            Schema::table('clientes', function (Blueprint $table) {
                $table->dateTime('fecha_registro')->nullable();
            });
        }
        if (!Schema::hasColumn('clientes', 'fecha_nacimiento')) {
            Schema::table('clientes', function (Blueprint $table) {
                $table->date('fecha_nacimiento')->nullable();
            });
        }

        // Copiar equivalencias anteriores únicamente donde el campo nuevo
        // todavía está vacío. No sobrescribir datos reales introducidos.
        foreach ([
            'email' => 'correo',
            'nombre' => 'nombres',
            'apellido' => 'apellidos',
        ] as $antiguo => $nuevo) {
            if (Schema::hasColumn('clientes', $antiguo) && Schema::hasColumn('clientes', $nuevo)) {
                DB::table('clientes')->whereNull($nuevo)->update([$nuevo => DB::raw($antiguo)]);
            }
        }
    }

    public function down(): void
    {
        // Nunca borrar columnas ni socios al revertir una reparación legacy.
    }
};
