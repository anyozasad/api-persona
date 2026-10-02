<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('configuracion_sistema', function (Blueprint $table) {
            if (!Schema::hasColumn('configuracion_sistema', 'referencia')) {
                $table->string('referencia', 255)->nullable()->after('direccion');
            }
            if (!Schema::hasColumn('configuracion_sistema', 'frase_publicitaria')) {
                $table->string('frase_publicitaria', 255)->nullable()->after('referencia');
            }
            if (!Schema::hasColumn('configuracion_sistema', 'horario_detalle')) {
                $table->text('horario_detalle')->nullable()->after('frase_publicitaria');
            }
            if (!Schema::hasColumn('configuracion_sistema', 'tarifa_diaria')) {
                $table->decimal('tarifa_diaria', 8, 2)->nullable()->after('horario_detalle');
            }
            if (!Schema::hasColumn('configuracion_sistema', 'mensaje_productos')) {
                $table->text('mensaje_productos')->nullable()->after('tarifa_diaria');
            }
        });
    }

    public function down(): void
    {
        Schema::table('configuracion_sistema', function (Blueprint $table) {
            foreach (['mensaje_productos','tarifa_diaria','horario_detalle','frase_publicitaria','referencia'] as $columna) {
                if (Schema::hasColumn('configuracion_sistema', $columna)) {
                    $table->dropColumn($columna);
                }
            }
        });
    }
};
