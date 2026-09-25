<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones_cliente', function (Blueprint $table) {
            $table->bigIncrements('id_notificacion');
            $table->unsignedBigInteger('id_cliente')->index();
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->string('tipo', 30)->default('Informacion');
            $table->boolean('leida')->default(false)->index();
            $table->dateTime('fecha')->useCurrent()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones_cliente');
    }
};
