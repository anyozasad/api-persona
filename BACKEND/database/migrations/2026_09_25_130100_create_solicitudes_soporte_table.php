<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_soporte', function (Blueprint $table) {
            $table->bigIncrements('id_soporte');
            $table->unsignedBigInteger('id_cliente')->index();
            $table->string('asunto', 150);
            $table->text('mensaje');
            $table->text('respuesta')->nullable();
            $table->string('estado', 30)->default('Pendiente')->index();
            $table->dateTime('fecha')->useCurrent()->index();
            $table->dateTime('fecha_respuesta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_soporte');
    }
};
