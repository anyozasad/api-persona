<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Instalaciones antiguas de gym_system pueden tener la tabla usuarios
        // creada antes de que se incorporara el campo de correo.
        if (!Schema::hasTable('usuarios') || Schema::hasColumn('usuarios', 'correo')) {
            return;
        }

        Schema::table('usuarios', function (Blueprint $table) {
            $table->string('correo', 150)->nullable()->unique();
        });
    }

    public function down(): void
    {
        // No eliminar la columna durante un rollback: puede contener
        // correos reales de cuentas existentes que no se deben perder.
    }
};
