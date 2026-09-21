<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('planes_entrenamiento_casa')) {
            return;
        }

        Schema::create('planes_entrenamiento_casa', function (Blueprint $table) {
            $table->bigIncrements('id_plan_casa');
            $table->unsignedBigInteger('id_cliente')->unique();
            $table->longText('dias');
            $table->longText('zonas');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index('id_cliente');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planes_entrenamiento_casa');
    }
};
