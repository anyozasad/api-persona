<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('planes_entrenamiento_casa')) {
            return;
        }

        if (!Schema::hasColumn('planes_entrenamiento_casa', 'objetivo')) {
            Schema::table('planes_entrenamiento_casa', function (Blueprint $table) {
                $table->string('objetivo', 30)->default('fuerza')->after('zonas');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('planes_entrenamiento_casa') && Schema::hasColumn('planes_entrenamiento_casa', 'objetivo')) {
            Schema::table('planes_entrenamiento_casa', function (Blueprint $table) {
                $table->dropColumn('objetivo');
            });
        }
    }
};
