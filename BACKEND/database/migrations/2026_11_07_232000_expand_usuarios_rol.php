<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('usuarios') || !Schema::hasColumn('usuarios', 'rol')) {
            return;
        }

        $conexion = DB::connection();
        if (!in_array($conexion->getDriverName(), ['mysql', 'mariadb'], true)) {
            // Esta reparación solo se necesita en instalaciones legacy MySQL.
            return;
        }

        $tabla = $conexion->getTablePrefix().'usuarios';
        if (!preg_match('/^[A-Za-z0-9_]+$/', $tabla)) {
            throw new \RuntimeException('Nombre de tabla usuarios no permitido.');
        }

        $columnas = DB::select('SHOW COLUMNS FROM `'.$tabla.'`');
        $rol = null;
        foreach ($columnas as $columna) {
            if (($columna->Field ?? '') === 'rol') {
                $rol = $columna;
                break;
            }
        }

        if ($rol === null) {
            return;
        }

        $tipo = strtolower((string) ($rol->Type ?? ''));
        // ENUM/SET o una cadena corta no admiten necesariamente "Administrador".
        // VARCHAR suficientemente largo o TEXT ya son compatibles.
        if (preg_match('/^varchar\\((\\d+)\\)/', $tipo, $partes)
            && (int) $partes[1] >= 64) {
            return;
        }
        if (preg_match('/^(text|mediumtext|longtext)/', $tipo)) {
            return;
        }

        $permiteNulos = strtoupper((string) ($rol->Null ?? 'NO')) === 'YES';
        $nullSql = $permiteNulos ? 'NULL' : 'NOT NULL';
        $valorDefault = $rol->Default ?? null;
        $defaultSql = $valorDefault !== null
            ? ' DEFAULT '.$conexion->getPdo()->quote((string) $valorDefault)
            : ($permiteNulos ? ' DEFAULT NULL' : '');

        // ALTER conserva filas, relaciones e índices: cambia solo el tipo
        // de la columna para admitir todos los roles del sistema.
        DB::statement('ALTER TABLE `'.$tabla.'` MODIFY COLUMN `rol` VARCHAR(64) '
            .$nullSql.$defaultSql);
    }

    public function down(): void
    {
        // No volver a un ENUM restrictivo: podría invalidar los roles actuales.
    }
};
