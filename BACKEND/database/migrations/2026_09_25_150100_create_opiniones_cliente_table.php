<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opiniones_cliente', function (Blueprint $table) {
            $table->bigIncrements('id_opinion');
            $table->unsignedBigInteger('id_cliente')->index();
            $table->string('categoria', 40)->default('Servicio');
            $table->unsignedTinyInteger('calificacion');
            $table->text('comentario');
            $table->string('estado', 30)->default('Enviada')->index();
            $table->dateTime('fecha')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opiniones_cliente');
    }
};
