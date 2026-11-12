<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // La base local puede traer una tabla reservas anterior a Laravel.
        // El esquema base la omite si ya existe: este archivo completa los
        // campos nuevos SIN borrar ni renombrar la tabla ni sus registros.
        if (!Schema::hasTable('reservas')) {
            Schema::create('reservas', function (Blueprint $tabla): void {
                $tabla->bigIncrements('id_reserva');
                $tabla->unsignedBigInteger('id_cliente')->index();
                $tabla->unsignedBigInteger('id_clase')->index();
                $tabla->date('fecha_clase')->index();
                $tabla->dateTime('fecha_reserva')->nullable();
                $tabla->string('estado', 30)->default('Reservada')->index();
                $tabla->index(['id_cliente', 'id_clase', 'fecha_clase']);
            });
            return;
        }

        if (!Schema::hasColumn('reservas', 'id_reserva')) {
            $driver = DB::connection()->getDriverName();
            if (in_array($driver, ['mysql', 'mariadb'], true)) {
                $autoAnterior = null;
                foreach (DB::select('SHOW COLUMNS FROM `reservas`') as $campo) {
                    if (str_contains(strtolower((string) ($campo->Extra ?? '')), 'auto_increment')) {
                        $autoAnterior = (string) $campo->Field;
                        break;
                    }
                }

                if ($autoAnterior === null) {
                    // Si NO habia AUTO_INCREMENT, Laravel puede tener el suyo.
                    DB::statement('ALTER TABLE `reservas` ADD COLUMN `id_reserva` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ADD UNIQUE KEY `reservas_id_reserva_unique` (`id_reserva`)');
                } else {
                    // MySQL solo permite UN AUTO_INCREMENT por tabla. No tocar
                    // el identificador anterior: agregar una clave unica normal,
                    // copiar IDs y sincronizar futuros inserts desde el modelo.
                    if (!preg_match('/^[a-zA-Z0-9_]+$/', $autoAnterior)) {
                        throw new \RuntimeException('Identificador antiguo de reservas incompatible; revisar manualmente.');
                    }
                    Schema::table('reservas', function (Blueprint $tabla): void {
                        $tabla->unsignedBigInteger('id_reserva')->nullable()
                            ->unique('reservas_id_reserva_unique');
                    });
                    DB::table('reservas')->whereNull('id_reserva')
                        ->update(['id_reserva' => DB::raw('`'.$autoAnterior.'`')]);
                }
            } elseif ($driver === 'sqlite') {
                // Compatibilidad con pruebas que crean una reserva antigua.
                Schema::table('reservas', function (Blueprint $tabla): void {
                    $tabla->unsignedBigInteger('id_reserva')->nullable()
                        ->unique('reservas_id_reserva_unique');
                });
                if (Schema::hasColumn('reservas', 'id')) {
                    DB::table('reservas')->whereNull('id_reserva')
                        ->update(['id_reserva' => DB::raw('"id"')]);
                }
            } else {
                throw new \RuntimeException('La reparacion de reservas requiere MySQL, MariaDB o SQLite.');
            }
        }

        // Los campos nuevos son nulos en filas anteriores para no inventar
        // socios, clases, fechas ni estados historicos.
        if (!Schema::hasColumn('reservas', 'id_cliente')) {
            Schema::table('reservas', fn (Blueprint $tabla) =>
                $tabla->unsignedBigInteger('id_cliente')->nullable()->index('reservas_mq_cliente_idx'));
        }
        if (!Schema::hasColumn('reservas', 'id_clase')) {
            Schema::table('reservas', fn (Blueprint $tabla) =>
                $tabla->unsignedBigInteger('id_clase')->nullable()->index('reservas_mq_clase_idx'));
        }
        if (!Schema::hasColumn('reservas', 'fecha_clase')) {
            Schema::table('reservas', fn (Blueprint $tabla) =>
                $tabla->date('fecha_clase')->nullable()->index('reservas_mq_fecha_idx'));
        }
        if (!Schema::hasColumn('reservas', 'fecha_reserva')) {
            Schema::table('reservas', fn (Blueprint $tabla) =>
                $tabla->dateTime('fecha_reserva')->nullable());
        }
        if (!Schema::hasColumn('reservas', 'estado')) {
            Schema::table('reservas', fn (Blueprint $tabla) =>
                $tabla->string('estado', 30)->nullable());
        }
    }

    public function down(): void
    {
        // NO revertir columnas en una instalacion con reservas reales.
    }
};
