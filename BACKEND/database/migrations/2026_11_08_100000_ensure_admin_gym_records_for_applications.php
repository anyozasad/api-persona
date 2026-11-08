<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Crear solo cuando el esquema anterior no haya instalado el registro.
        // Esta tabla guarda las tareas y los módulos complementarios existentes.
        if (Schema::hasTable('admin_gym_records')) {
            return;
        }

        Schema::create('admin_gym_records', function (Blueprint $table) {
            $table->id();
            $table->string('modulo', 40)->index();
            $table->string('titulo', 180);
            $table->string('subtitulo', 255)->nullable();
            $table->string('estado', 50)->default('Activo')->index();
            $table->date('fecha')->nullable();
            $table->decimal('monto', 12, 2)->nullable();
            $table->string('imagen_url', 500)->nullable();
            $table->json('datos')->nullable();
            $table->timestamps();
            $table->index(['modulo', 'fecha']);
        });
    }

    public function down(): void
    {
        // No eliminar datos de las tareas ni los registros existentes.
    }
};
