<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schedule;
use Symfony\Component\Process\Process;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('frontend:build', function () {
    // Estructura real del repositorio:
    // api-persona/
    // ├── BACKEND
    // └── FRONTEND/suma-angular
    $frontend = realpath(base_path('../FRONTEND/suma-angular'))
        ?: base_path('../FRONTEND/suma-angular');

    if (! is_dir($frontend)) {
        $this->error('No se encontró el frontend en: '.$frontend);
        return self::FAILURE;
    }

    $this->info('Compilando Angular desde: '.$frontend);

    if (! is_dir($frontend.DIRECTORY_SEPARATOR.'node_modules')) {
        $this->comment('Instalando dependencias de Angular...');
        $npm = PHP_OS_FAMILY === 'Windows' ? 'npm.cmd' : 'npm';
        $install = new Process([$npm, 'install'], $frontend);
        $install->setTimeout(null);
        $install->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if (! $install->isSuccessful()) {
            $this->error('No se pudieron instalar las dependencias de Angular.');
            return self::FAILURE;
        }
    }

    $npm = $npm ?? (PHP_OS_FAMILY === 'Windows' ? 'npm.cmd' : 'npm');
    $build = new Process([$npm, 'run', 'build'], $frontend);
    $build->setTimeout(null);
    $build->run(function ($type, $buffer) {
        $this->output->write($buffer);
    });

    if (! $build->isSuccessful()) {
        $this->error('Falló la compilación del frontend Angular.');
        return self::FAILURE;
    }

    $distBase = $frontend.DIRECTORY_SEPARATOR.'dist'.DIRECTORY_SEPARATOR.'mallqui-gym-frontend';
    $distBrowser = $distBase.DIRECTORY_SEPARATOR.'browser';
    $dist = is_dir($distBrowser) ? $distBrowser : $distBase;

    if (! is_file($dist.DIRECTORY_SEPARATOR.'index.html')) {
        $this->error('Angular compiló, pero no se encontró index.html en: '.$dist);
        return self::FAILURE;
    }

    $public = public_path();

    // Limpia artefactos anteriores de Angular para evitar servir bundles viejos.
    File::delete($public.DIRECTORY_SEPARATOR.'index.html');

    foreach ([
        'main*.js',
        'polyfills*.js',
        'styles*.css',
        'chunk*.js',
        'runtime*.js',
    ] as $patron) {
        foreach (glob($public.DIRECTORY_SEPARATOR.$patron) ?: [] as $archivo) {
            File::delete($archivo);
        }
    }

    foreach (File::directories($dist) as $directorio) {
        $destino = $public.DIRECTORY_SEPARATOR.basename($directorio);
        File::deleteDirectory($destino);
        File::copyDirectory($directorio, $destino);
    }

    foreach (File::files($dist) as $archivo) {
        File::copy($archivo->getPathname(), $public.DIRECTORY_SEPARATOR.$archivo->getFilename());
    }

    if (! is_file(public_path('index.html'))) {
        $this->error('No se pudo copiar el index.html compilado a Laravel/public.');
        return self::FAILURE;
    }

    $this->newLine();
    $this->info('Frontend Angular compilado e integrado correctamente en Laravel/public.');
    $this->comment('Ahora ejecuta: php artisan serve');
    return self::SUCCESS;
})->purpose('Compila Angular e integra su dist en Laravel/public');

// Automatizaciones operativas para producción.
Schedule::command('membresias:actualizar-estados')->dailyAt('00:05')->withoutOverlapping();
Schedule::command('backup:database --keep=30')->dailyAt('02:00')->withoutOverlapping();
Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('03:00')->withoutOverlapping();
