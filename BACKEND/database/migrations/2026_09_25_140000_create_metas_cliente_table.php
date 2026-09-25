<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metas_cliente', function (Blueprint $table) {
            $table->bigIncrements('id_meta_cliente');
            $table->unsignedBigInteger('id_cliente')->unique();
            $table->unsignedTinyInteger('sesiones_semanales')->default(3);
            $table->boolean('recordatorios')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metas_cliente');
    }
};
