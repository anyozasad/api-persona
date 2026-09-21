<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('configuracion_sistema')) {
            return;
        }

        Schema::create('configuracion_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_gimnasio', 120)->default('Mallqui Gym');
            $table->string('ruc', 20)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('correo', 150)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->time('hora_apertura')->default('06:00:00');
            $table->time('hora_cierre')->default('22:00:00');
            $table->json('dias_atencion')->nullable();
            $table->unsignedTinyInteger('dias_aviso_vencimiento')->default(7);
            $table->unsignedSmallInteger('minutos_cancelacion_reserva')->default(120);
            $table->unsignedTinyInteger('dias_anticipacion_reserva')->default(7);
            $table->unsignedSmallInteger('stock_minimo_default')->default(5);
            $table->boolean('notificar_vencimientos')->default(true);
            $table->boolean('notificar_stock_bajo')->default(true);
            $table->boolean('notificar_pagos_pendientes')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion_sistema');
    }
};
