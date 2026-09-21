<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sesiones_entrenamiento_casa')) {
            return;
        }

        Schema::create('sesiones_entrenamiento_casa', function (Blueprint $table) {
            $table->bigIncrements('id_sesion_casa');
            $table->unsignedBigInteger('id_cliente')->index();
            $table->string('zona', 30);
            $table->dateTime('fecha');
            $table->unsignedInteger('duracion_segundos')->default(0);
            $table->unsignedTinyInteger('ejercicios_total')->default(0);
            $table->unsignedTinyInteger('ejercicios_completados')->default(0);
            $table->string('estado', 20)->default('Completada');
            $table->timestamps();

            $table->index(['id_cliente', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones_entrenamiento_casa');
    }
};
