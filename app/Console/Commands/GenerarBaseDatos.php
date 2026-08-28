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

        foreach (['db:generar-interno', 'db:operacion-interno', 'db:produccion-interno'] as $comando) {
            $codigo = Artisan::call($comando, ['--force' => $force]);
            $salida = trim(Artisan::output());

            if ($salida !== '') {
                $this->line($salida);
            }

            if ($codigo !== 0) {
                $this->error("No se pudo ejecutar {$comando}.");
                return self::FAILURE;
            }
        }

        $this->newLine();
        $this->info('Todas las migraciones del sistema están preparadas.');
        $this->comment('En una base ya existente usa: php artisan db:sincronizar');

        return self::SUCCESS;
    }
}
