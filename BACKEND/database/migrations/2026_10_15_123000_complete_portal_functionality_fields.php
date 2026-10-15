<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clientes')) {
            Schema::table('clientes', function (Blueprint $table) {
                if (!Schema::hasColumn('clientes', 'foto_perfil')) {
                    $table->string('foto_perfil', 255)->nullable();
                }
                if (!Schema::hasColumn('clientes', 'enfoque_entrenamiento')) {
                    $table->string('enfoque_entrenamiento', 80)->nullable();
                }
                if (!Schema::hasColumn('clientes', 'nivel_entrenamiento')) {
                    $table->string('nivel_entrenamiento', 30)->nullable();
                }
            });
        }

        if (Schema::hasTable('detalle_rutina')) {
            Schema::table('detalle_rutina', function (Blueprint $table) {
                if (!Schema::hasColumn('detalle_rutina', 'zona')) {
                    $table->string('zona', 30)->nullable();
                }
                if (!Schema::hasColumn('detalle_rutina', 'equipo')) {
                    $table->string('equipo', 120)->nullable();
                }
            });
        }

        if (Schema::hasTable('sesiones_entrenamiento_casa') && !Schema::hasColumn('sesiones_entrenamiento_casa', 'id_rutina')) {
            Schema::table('sesiones_entrenamiento_casa', function (Blueprint $table) {
                $table->unsignedBigInteger('id_rutina')->nullable()->index()->after('id_cliente');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('clientes')) {
            Schema::table('clientes', function (Blueprint $table) {
                foreach (['foto_perfil', 'enfoque_entrenamiento', 'nivel_entrenamiento'] as $columna) {
                    if (Schema::hasColumn('clientes', $columna)) $table->dropColumn($columna);
                }
            });
        }

        if (Schema::hasTable('detalle_rutina')) {
            Schema::table('detalle_rutina', function (Blueprint $table) {
                foreach (['zona', 'equipo'] as $columna) {
                    if (Schema::hasColumn('detalle_rutina', $columna)) $table->dropColumn($columna);
                }
            });
        }
    }
};
