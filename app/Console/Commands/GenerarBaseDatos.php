<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class GenerarBaseDatos extends Command
{
    protected $signature = 'db:generar {--force : Sobrescribe migraciones existentes del esquema del proyecto}';

    protected $description = 'Genera con Artisan todas las migraciones necesarias para la base de datos del proyecto';

    public function handle(): int
    {
        $force = (bool) $this->option('force');

        $codigoBase = Artisan::call('db:generar-interno', [
            '--force' => $force,
        ]);
        $salidaBase = trim(Artisan::output());
        if ($salidaBase !== '') {
            $this->line($salidaBase);
        }

        if ($codigoBase !== 0) {
            return self::FAILURE;
        }

        $codigoOperacion = Artisan::call('db:operacion-interno', [
            '--force' => $force,
        ]);
        $salidaOperacion = trim(Artisan::output());
        if ($salidaOperacion !== '') {
            $this->line($salidaOperacion);
        }

        if ($codigoOperacion !== 0) {
            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Todas las migraciones del sistema están preparadas.');
        $this->comment('Siguiente paso: php artisan migrate');

        return self::SUCCESS;
    }
}
