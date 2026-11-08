<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('usuarios')) {
            return;
        }

        // La base gym_system puede conservar una tabla usuarios de otro
        // esquema. Agregar solo lo faltante; nunca borrar o recrear filas.
        $texto = [
            'nombre_usuario' => 80,
            'contrasena' => 255,
            'correo' => 150,
            'nombres' => 100,
            'apellidos' => 100,
            'dni' => 15,
            'telefono' => 25,
        ];

        foreach ($texto as $nombre => $longitud) {
            if (Schema::hasColumn('usuarios', $nombre)) {
                continue;
            }

            Schema::table('usuarios', function (Blueprint $tabla) use ($nombre, $longitud) {
                // Nullable preserva filas antiguas sin datos de estos campos.
                $tabla->string($nombre, $longitud)->nullable();
            });
        }

        if (!Schema::hasColumn('usuarios', 'rol')) {
            Schema::table('usuarios', function (Blueprint $tabla) {
                $tabla->string('rol', 30)->default('Cliente');
            });
        }

        if (!Schema::hasColumn('usuarios', 'estado')) {
            Schema::table('usuarios', function (Blueprint $tabla) {
                $tabla->string('estado', 20)->default('Activo');
            });
        }

        if (!Schema::hasColumn('usuarios', 'fecha_registro')) {
            Schema::table('usuarios', function (Blueprint $tabla) {
                $tabla->dateTime('fecha_registro')->nullable();
            });
        }

        foreach (['id_cliente', 'id_entrenador'] as $nombre) {
            if (Schema::hasColumn('usuarios', $nombre)) {
                continue;
            }
            Schema::table('usuarios', function (Blueprint $tabla) use ($nombre) {
                $tabla->unsignedBigInteger($nombre)->nullable();
            });
        }
    }

    public function down(): void
    {
        // No eliminar campos ni contraseñas en rollback para no perder datos.
    }
};
