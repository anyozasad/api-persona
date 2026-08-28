<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Symfony\Component\Process\Process;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('frontend:build', function () {
    $frontend = base_path('frontend-angular');

    if (! is_dir($frontend)) {
        $this->error('No se encontró la carpeta frontend-angular.');
        return 1;
    }

    $this->info('Compilando la interfaz Angular...');

    if (! is_dir($frontend.DIRECTORY_SEPARATOR.'node_modules')) {
        $this->comment('Instalando dependencias de Angular...');
        $install = Process::fromShellCommandline('npm install', $frontend);
        $install->setTimeout(null);
        $install->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if (! $install->isSuccessful()) {
            $this->error('No se pudieron instalar las dependencias de Angular.');
            return 1;
        }
    }

    $build = Process::fromShellCommandline('npm run build:laravel', $frontend);
    $build->setTimeout(null);
    $build->run(function ($type, $buffer) {
        $this->output->write($buffer);
    });

    if (! $build->isSuccessful()) {
        $this->error('Falló la compilación del frontend Angular.');
        return 1;
    }

    $this->newLine();
    $this->info('Frontend listo. Ahora ejecuta: php artisan serve');
    return 0;
})->purpose('Compila Angular y lo integra directamente en Laravel/public');

// Mantiene los vencimientos de membresías sincronizados todos los días.
Schedule::command('membresias:actualizar-estados')->dailyAt('00:05');
