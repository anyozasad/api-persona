<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sesiones_entrenamiento_casa') && !Schema::hasColumn('sesiones_entrenamiento_casa', 'id_rutina')) {
            Schema::table('sesiones_entrenamiento_casa', function (Blueprint $table) {
                $table->unsignedBigInteger('id_rutina')->nullable()->after('id_cliente')->index();
            });
        }

        if (!Schema::hasTable('detalle_sesion_entrenamiento')) {
            Schema::create('detalle_sesion_entrenamiento', function (Blueprint $table) {
                $table->bigIncrements('id_detalle_sesion');
                $table->unsignedBigInteger('id_sesion_casa')->index();
                $table->unsignedBigInteger('id_detalle_rutina')->index();
                $table->unsignedInteger('series_realizadas')->default(0);
                $table->unsignedInteger('repeticiones_realizadas')->default(0);
                $table->decimal('peso_utilizado', 8, 2)->nullable();
                $table->boolean('completado')->default(true);
                $table->timestamps();

                $table->unique(
                    ['id_sesion_casa', 'id_detalle_rutina'],
                    'detalle_sesion_rutina_unique'
                );
            });
        }

        if (Schema::hasTable('membresias')) {
            Schema::table('membresias', function (Blueprint $table) {
                if (!Schema::hasColumn('membresias', 'beneficios')) {
                    $table->json('beneficios')->nullable()->after('descripcion');
                }
                if (!Schema::hasColumn('membresias', 'permite_reservas')) {
                    $table->boolean('permite_reservas')->default(true)->after('beneficios');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('detalle_sesion_entrenamiento')) {
            Schema::dropIfExists('detalle_sesion_entrenamiento');
        }

        if (Schema::hasTable('sesiones_entrenamiento_casa') && Schema::hasColumn('sesiones_entrenamiento_casa', 'id_rutina')) {
            Schema::table('sesiones_entrenamiento_casa', function (Blueprint $table) {
                $table->dropColumn('id_rutina');
            });
        }

        if (Schema::hasTable('membresias')) {
            Schema::table('membresias', function (Blueprint $table) {
                if (Schema::hasColumn('membresias', 'permite_reservas')) {
                    $table->dropColumn('permite_reservas');
                }
                if (Schema::hasColumn('membresias', 'beneficios')) {
                    $table->dropColumn('beneficios');
                }
            });
        }
    }
};
