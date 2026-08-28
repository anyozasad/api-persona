<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class GenerarBaseDatos extends Command
{
    protected $signature = 'db:generar {--force : Sobrescribe migraciones existentes del esquema del proyecto}';

    protected $description = 'Genera con Artisan las migraciones necesarias para la base de datos del proyecto';

    public function handle(): int
    {
        $codigo = Artisan::call('mallqui:generar-migraciones', [
            '--force' => (bool) $this->option('force'),
        ]);

        $salida = trim(Artisan::output());

        if ($salida !== '') {
            $this->line($salida);
        }

        return $codigo === 0 ? self::SUCCESS : self::FAILURE;
    }
}
