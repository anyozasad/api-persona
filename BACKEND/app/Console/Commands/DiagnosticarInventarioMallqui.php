<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class DiagnosticarInventarioMallqui extends Command
{
    protected $signature = 'productos:diagnosticar';

    protected $description = 'Comprueba solo en lectura la base y tablas de donde carga el inventario Mallqui Gym';

    public function handle(): int
    {
        $conexion = DB::connection();
        try {
            $conexion->getPdo();
        } catch (Throwable $e) {
            $this->error('No se pudo conectar a MySQL con la configuración actual de Laravel.');
            $this->line('Revisa MySQL en XAMPP, BACKEND/.env y config:clear (sin mostrar credenciales).');
            return self::FAILURE;
        }

        $driver = $conexion->getDriverName();
        $principal = (string) $conexion->getDatabaseName();
        $this->info('Diagnóstico del inventario (SOLO LECTURA)');
        $this->line('Motor: '.$driver);
        $this->line('Base usada por Laravel/API: '.$principal);

        $tablas = ['productos', 'app_productos'];
        $activos = [];
        foreach ($tablas as $tabla) {
            try {
                $schema = $conexion->getSchemaBuilder();
                if (!$schema->hasTable($tabla)) {
                    $this->warn('No existe: '.$principal.'.'.$tabla);
                    continue;
                }
                $cantidad = (int) $conexion->table($tabla)->count();
                $activos[$tabla] = $cantidad;
                $texto = sprintf('%s.%s: %d registros', $principal, $tabla, $cantidad);

                if ($schema->hasColumn($tabla, 'foto')) {
                    $fotos = (int) $conexion->table($tabla)->whereNotNull('foto')->where('foto', '<>', '')->count();
                    $texto .= ', '.$fotos.' con fotografía';
                }

                $this->line($texto);
            } catch (Throwable $e) {
                $this->error('No se pudo consultar la tabla '.$tabla.' ('.class_basename($e).').');
                return self::FAILURE;
            }
        }

        if (($activos['productos'] ?? -1) === 0 && ($activos['app_productos'] ?? 0) > 0) {
            $this->warn('Los registros están en app_productos pero la API usa productos. NO mezcles tablas sin revisar su esquema y claves.');
        }
        if (($activos['productos'] ?? -1) === 0 && ($activos['app_productos'] ?? 0) === 0) {
            $this->warn('No se encontraron productos en estas tablas de la base conectada.');
            $this->line('Si tu laptop tiene los registros, exporta esa base con phpMyAdmin y revisa primero el SQL, sin sobrescribir la base actual.');
        }
        if (($activos['productos'] ?? -1) > 0) {
            $this->info('La tabla productos contiene registros. Si el navegador muestra 0, revisa que Laravel use este mismo .env y que GET /api/productos responda 200.');
        }

        $otra = trim((string) env('GYM_DB_DATABASE', ''));
        if ($otra !== '' && $otra !== $principal) {
            $this->warn('GYM_DB_DATABASE apunta a otra base: '.$otra.'. El endpoint /api/productos normalmente usa DB_DATABASE.');
        }

        $this->line('Este diagnóstico no ha creado, eliminado ni cambiado productos.');
        return self::SUCCESS;
    }
}
