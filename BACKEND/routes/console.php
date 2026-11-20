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

/**
 * Reparación puntual del alta de socios en bases antiguas de XAMPP.
 * No se ejecuta desde peticiones web y no modifica la tabla legacy socios.
 * El respaldo SQL de la base activa es obligatorio.
 */
Artisan::command('db:asegurar-clientes', function () {
    try {
        $db = \Illuminate\Support\Facades\DB::connection();
        $db->getPdo();
        $base = (string) $db->getDatabaseName();
        $this->info('Base de datos activa: '.$base);

        if ($db->getDriverName() !== 'mysql') {
            $this->error('Esta reparación está destinada a MySQL/MariaDB de XAMPP.');
            return 1;
        }

        $schema = $db->getSchemaBuilder();
        if ($schema->hasTable('clientes')) {
            $this->info('La tabla clientes ya existe. No se modifica ni se duplica.');
            return 0;
        }

        $this->warn('Falta la tabla clientes en '.$base.'. Se creará sin borrar socios ni usuarios.');
        if (! $this->confirm('¿Crear primero un respaldo SQL y luego la tabla faltante?', false)) {
            $this->warn('Reparación cancelada: no se modificaron tablas.');
            return 1;
        }

        $inicio = time();
        $resultado = Artisan::call('backup:database');
        $this->line(Artisan::output());
        if ($resultado !== 0) {
            $this->error('El respaldo falló. No se creará la tabla.');
            return 1;
        }

        $carpeta = storage_path('app/backups');
        $respaldos = glob($carpeta.DIRECTORY_SEPARATOR.$base.'_*.sql') ?: [];
        $respaldoValido = false;
        foreach ($respaldos as $archivo) {
            if (is_file($archivo) && filesize($archivo) > 200 && filemtime($archivo) >= $inicio - 2) {
                $respaldoValido = true;
                break;
            }
        }
        if (! $respaldoValido) {
            $this->error('No se comprobó un respaldo SQL nuevo de '.$base.'. Sin cambios.');
            return 1;
        }

        // Igual que la tabla definida en la migración base del gimnasio.
        // Schema::create solo se ejecuta después de verificar que no existe.
        $schema->create('clientes', function (\Illuminate\Database\Schema\Blueprint $tabla) {
            $tabla->bigIncrements('id_cliente');
            $tabla->string('dni', 15)->unique();
            $tabla->string('nombres', 100);
            $tabla->string('apellidos', 100);
            $tabla->string('sexo', 20)->nullable();
            $tabla->string('telefono', 25)->nullable();
            $tabla->string('correo', 150)->nullable()->unique();
            $tabla->string('direccion', 255)->nullable();
            $tabla->date('fecha_nacimiento')->nullable();
            $tabla->dateTime('fecha_registro')->nullable();
            $tabla->string('estado', 20)->default('Activo')->index();
            $tabla->string('foto_perfil', 255)->nullable();
            $tabla->string('enfoque_entrenamiento', 80)->nullable();
            $tabla->string('nivel_entrenamiento', 30)->nullable();
            $tabla->string('whatsapp_api_key', 255)->nullable();
        });

        $obligatorios = ['id_cliente','dni','nombres','apellidos','correo','estado','fecha_registro'];
        $faltantes = array_values(array_filter($obligatorios, fn ($c) => ! $schema->hasColumn('clientes', $c)));
        if ($faltantes !== []) {
            $this->error('Tabla creada con campos pendientes: '.implode(', ', $faltantes));
            return 1;
        }

        $this->info('Tabla clientes creada y verificada en '.$base.'. No se borraron datos de socios.');
        $this->warn('Si existían registros en la tabla socios, permanecen allí y requieren conciliación por DNI antes de mover historiales.');
        return 0;
    } catch (\Throwable $e) {
        $this->error('No fue posible asegurar clientes: '.$e->getMessage());
        return 1;
    }
})->purpose('Crea solo la tabla clientes faltante después de respaldar la base MySQL activa');

// Automatizaciones operativas para producción.
Schedule::command('membresias:actualizar-estados')->dailyAt('00:05')->withoutOverlapping();
Schedule::command('backup:database --keep=30')->dailyAt('02:00')->withoutOverlapping();
Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('03:00')->withoutOverlapping();
