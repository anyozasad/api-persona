<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clases_favoritas', function (Blueprint $table) {
            $table->bigIncrements('id_favorito');
            $table->unsignedBigInteger('id_cliente')->index();
            $table->unsignedBigInteger('id_clase')->index();
            $table->timestamps();

            $table->unique(['id_cliente', 'id_clase']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clases_favoritas');
    }
};
