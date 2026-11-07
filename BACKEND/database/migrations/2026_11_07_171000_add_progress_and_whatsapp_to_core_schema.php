<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clientes') && !Schema::hasColumn('clientes', 'whatsapp_api_key')) {
            Schema::table('clientes', function (Blueprint $table) {
                $table->string('whatsapp_api_key', 120)->nullable();
            });
        }

        if (!Schema::hasTable('progreso_medidas')) {
            Schema::create('progreso_medidas', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('id_cliente')->index();
                $table->decimal('peso', 7, 2)->nullable();
                $table->decimal('grasa', 6, 2)->nullable();
                $table->decimal('cintura', 7, 2)->nullable();
                $table->decimal('brazo', 7, 2)->nullable();
                $table->date('fecha')->index();
                $table->dateTime('created_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        // No se elimina información de progreso ni configuración de WhatsApp
        // para evitar pérdida accidental de datos del gimnasio.
    }
};
