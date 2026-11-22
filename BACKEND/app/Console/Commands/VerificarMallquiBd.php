<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class VerificarMallquiBd extends Command
{
    protected $signature = 'db:verificar';

    protected $description = 'Verifica tablas, columnas, seguridad y vistas principales de la base de datos';

    public function handle(): int
    {
        $tablas = $this->tablas();
        $errores = 0;

        $this->info('Verificando base de datos...');
        $this->newLine();

        foreach ($tablas as $tabla => $columnas) {
            if (!Schema::hasTable($tabla)) {
                $this->error("FALTA tabla: {$tabla}");
                $errores++;
                continue;
            }

            $faltantes = array_values(array_filter(
                $columnas,
                fn (string $columna) => !Schema::hasColumn($tabla, $columna)
            ));

            if ($faltantes) {
                $this->error("{$tabla}: faltan columnas -> ".implode(', ', $faltantes));
                $errores += count($faltantes);
            } else {
                $this->info("OK tabla: {$tabla}");
            }
        }

        // Los usuarios con id_usuario NULL pueden validar la contraseña,
        // pero fallan al generar su sesión con Sanctum.
        if (Schema::hasTable('usuarios') && Schema::hasColumn('usuarios', 'id_usuario')) {
            try {
                $sinIdentificador = (int) DB::table('usuarios')->whereNull('id_usuario')->count();
                if ($sinIdentificador > 0) {
                    $this->error("FALTA identificador en {$sinIdentificador} usuario(s): id_usuario es NULL");
                    $errores++;
                }
            } catch (Throwable $e) {
                $this->error('No se pudo validar los identificadores de usuarios.');
                $errores++;
            }
        }

        $this->newLine();
        $this->info('Verificando vistas...');

        foreach (['vista_clientes_membresias', 'vista_stock', 'vista_ventas'] as $vista) {
            try {
                DB::table($vista)->limit(1)->get();
                $this->info("OK vista: {$vista}");
            } catch (Throwable $e) {
                $this->error("FALTA o falla vista: {$vista}");
                $errores++;
            }
        }

        $this->newLine();

        if ($errores > 0) {
            $this->error("Verificación terminada con {$errores} problema(s).");
            return self::FAILURE;
        }

        $this->info('TODO OK: el esquema principal y los módulos empresariales están completos.');
        return self::SUCCESS;
    }

    /** Un único contrato para reparar, diagnosticar y verificar cada módulo. */
    private function tablas(): array
    {
        return ReconciliarEsquemaRealMallqui::requisitos();
    }
}
