<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

/**
 * Semana 05 EFSRT: la fotografía optimizada se guarda como data URI.
 * En instalaciones antiguas la columna `foto` podía ser VARCHAR(255)
 * y truncaba o rechazaba el archivo. La migración preserva las fotografías
 * existentes y permite almacenar nuevas sin usar servicios externos.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('productos')) {
            return;
        }

        if (!Schema::hasColumn('productos', 'foto')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->mediumText('foto')->nullable();
            });
            return;
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $columna = DB::selectOne("SHOW COLUMNS FROM `productos` LIKE 'foto'");
        $tipo = strtolower((string) ($columna->Type ?? ''));

        if (!str_starts_with($tipo, 'mediumtext') && !str_starts_with($tipo, 'longtext')) {
            DB::statement('ALTER TABLE `productos` MODIFY COLUMN `foto` MEDIUMTEXT NULL');
        }
    }

    public function down(): void
    {
        // No revertir a VARCHAR: se podrían truncar fotografías ya guardadas.
    }
};
