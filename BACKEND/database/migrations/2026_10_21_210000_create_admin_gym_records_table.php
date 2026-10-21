<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
        Schema::dropIfExists('admin_gym_records');
    }
};
