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

/**
 * Recuperación no destructiva de membresías, contratación y pagos.
 * No crea tarifas ficticias ni borra registros. Requiere un respaldo SQL nuevo.
 */
Artisan::command('db:asegurar-membresias', function () {
    try {
        $db = \Illuminate\Support\Facades\DB::connection();
        $db->getPdo();
        $base = (string) $db->getDatabaseName();
        $this->info('Base de datos activa: '.$base);

        if (!in_array($db->getDriverName(), ['mysql', 'mariadb'], true)) {
            $this->error('Esta reparación requiere MySQL/MariaDB.');
            return 1;
        }
        $schema = $db->getSchemaBuilder();
        if (!$schema->hasTable('clientes')) {
            $this->error('Primero debes recuperar la tabla clientes. No se harán cambios.');
            return 1;
        }

        // Campos reales utilizados por Planes, Membresías y Pagos.
        $estructuras = [
            'membresias' => [
                'id_membresia'=>'pk', 'nombre'=>'nombre', 'duracion_meses'=>'duracion',
                'precio'=>'precio', 'descripcion'=>'descripcion', 'beneficios'=>'json',
                'permite_reservas'=>'booleano', 'estado'=>'estado_plan',
            ],
            'cliente_membresia' => [
                'id_cliente_membresia'=>'pk', 'id_cliente'=>'relacion',
                'id_membresia'=>'relacion', 'fecha_inicio'=>'fecha',
                'fecha_fin'=>'fecha', 'estado'=>'estado_contrato',
            ],
            'pagos_membresia' => [
                'id_pago'=>'pk', 'id_cliente_membresia'=>'relacion',
                'fecha_pago'=>'fecha_hora', 'monto'=>'monto', 'metodo_pago'=>'metodo',
                'numero_operacion'=>'numero', 'observacion'=>'observacion',
                'estado_pago'=>'estado_pago',
            ],
            // Necesarias para cobrar membresías en efectivo sin SQL 500.
            'cajas' => [
                'id_caja'=>'pk', 'id_usuario_apertura'=>'relacion',
                'fecha_apertura'=>'fecha_hora', 'monto_inicial'=>'monto_inicial',
                'fecha_cierre'=>'fecha_hora_opcional', 'monto_esperado'=>'monto_opcional',
                'monto_real'=>'monto_opcional', 'diferencia'=>'monto_opcional',
                'estado'=>'estado_caja', 'observacion'=>'observacion_texto',
            ],
            'movimientos_caja' => [
                'id_movimiento'=>'pk', 'id_caja'=>'relacion', 'id_usuario'=>'relacion',
                'tipo'=>'tipo_movimiento', 'origen'=>'origen_movimiento',
                'referencia_tipo'=>'referencia_tipo', 'referencia_id'=>'relacion_opcional',
                'descripcion'=>'descripcion_movimiento', 'monto'=>'monto',
                'fecha_movimiento'=>'fecha_hora', 'estado'=>'estado_movimiento',
            ],
        ];

        $pendientes = [];
        foreach ($estructuras as $tabla => $columnas) {
            if (!$schema->hasTable($tabla)) {
                $pendientes[] = 'tabla:'.$tabla;
                continue;
            }
            foreach ($columnas as $campo => $tipo) {
                if (!$schema->hasColumn($tabla, $campo)) {
                    $pendientes[] = $tabla.'.'.$campo;
                    if ($tipo === 'pk') {
                        $this->error('La tabla existente '.$tabla.' carece de '.$campo.'. Se requiere revisar su ID anterior para preservar los registros.');
                        return 1;
                    }
                }
            }
        }

        if ($pendientes === []) {
            $this->info('Las tablas y columnas de membresías y caja ya existen. No se modificó MySQL.');
            return 0;
        }
        $this->warn('Pendientes: '.implode(', ', $pendientes));
        if (!$this->confirm('¿Crear un respaldo SQL nuevo y recuperar únicamente el esquema pendiente de membresías?', false)) {
            $this->warn('Operación cancelada. MySQL no se modificó.');
            return 1;
        }

        $inicio = time();
        $resultado = Artisan::call('backup:database');
        $this->line(Artisan::output());
        if ($resultado !== 0) {
            $this->error('El respaldo SQL falló. No se modificarán tablas.');
            return 1;
        }
        $respaldos = glob(storage_path('app/backups').DIRECTORY_SEPARATOR.$base.'_*.sql') ?: [];
        $comprobado = false;
        foreach ($respaldos as $archivo) {
            if (is_file($archivo) && filesize($archivo) > 200 && filemtime($archivo) >= $inicio - 2) {
                $comprobado = true;
                break;
            }
        }
        if (!$comprobado) {
            $this->error('No se encontró un respaldo SQL nuevo, legible y no vacío. Sin cambios.');
            return 1;
        }

        // Los campos nuevos en tablas existentes son nullable cuando hace falta,
        // para no dañar las filas anteriores. En tablas nuevas se usa el esquema real.
        $definirColumna = static function (\Illuminate\Database\Schema\Blueprint $t, string $campo, string $tipo, bool $nueva): void {
            switch ($tipo) {
                case 'pk':
                    $t->bigIncrements($campo);
                    break;
                case 'nombre':
                    $col = $t->string($campo, 100);
                    $nueva ? $col->unique() : $col->nullable();
                    break;
                case 'relacion':
                    $col = $t->unsignedBigInteger($campo);
                    $nueva ? $col->index() : $col->nullable();
                    break;
                case 'duracion':
                    $t->unsignedInteger($campo)->default(1);
                    break;
                case 'precio':
                    $t->decimal($campo, 12, 2)->default(0);
                    break;
                case 'monto':
                    $col = $t->decimal($campo, 12, 2);
                    if (!$nueva) $col->nullable();
                    break;
                case 'monto_inicial':
                    $t->decimal($campo, 12, 2)->default(0);
                    break;
                case 'monto_opcional':
                    $t->decimal($campo, 12, 2)->nullable();
                    break;
                case 'relacion_opcional':
                    $t->unsignedBigInteger($campo)->nullable();
                    break;
                case 'observacion_texto':
                    $t->text($campo)->nullable();
                    break;
                case 'tipo_movimiento':
                    $col = $t->string($campo, 20);
                    if (!$nueva) $col->nullable();
                    break;
                case 'origen_movimiento':
                    $col = $t->string($campo, 50);
                    if (!$nueva) $col->nullable();
                    break;
                case 'referencia_tipo':
                    $t->string($campo, 80)->nullable();
                    break;
                case 'descripcion_movimiento':
                    $col = $t->string($campo, 255);
                    if (!$nueva) $col->nullable();
                    break;
                case 'descripcion':
                    $t->string($campo, 500)->nullable();
                    break;
                case 'observacion':
                    $t->string($campo, 500)->nullable();
                    break;
                case 'json':
                    $t->json($campo)->nullable();
                    break;
                case 'booleano':
                    $t->boolean($campo)->default(true);
                    break;
                case 'estado_plan':
                    $t->string($campo, 20)->default('Activo');
                    break;
                case 'estado_contrato':
                    $t->string($campo, 30)->default('Activo');
                    break;
                case 'estado_pago':
                    $t->string($campo, 30)->default('Pendiente');
                    break;
                case 'estado_caja':
                    $t->string($campo, 20)->default('Abierta');
                    break;
                case 'estado_movimiento':
                    $t->string($campo, 30)->default('Registrado');
                    break;
                case 'fecha':
                    $col = $t->date($campo);
                    if (!$nueva) $col->nullable();
                    break;
                case 'fecha_hora':
                    $col = $t->dateTime($campo);
                    if (!$nueva) $col->nullable();
                    break;
                case 'fecha_hora_opcional':
                    $t->dateTime($campo)->nullable();
                    break;
                case 'metodo':
                    $col = $t->string($campo, 50);
                    if (!$nueva) $col->nullable();
                    break;
                case 'numero':
                    $t->string($campo, 100)->nullable();
                    break;
                default:
                    throw new \RuntimeException('Campo desconocido: '.$campo);
            }
        };

        foreach ($estructuras as $tabla => $columnas) {
            if (!$schema->hasTable($tabla)) {
                $schema->create($tabla, static function (\Illuminate\Database\Schema\Blueprint $t) use ($columnas, $definirColumna): void {
                    foreach ($columnas as $campo => $tipo) {
                        $definirColumna($t, $campo, $tipo, true);
                    }
                });
                $this->info('Tabla creada: '.$tabla);
                continue;
            }
            foreach ($columnas as $campo => $tipo) {
                if ($schema->hasColumn($tabla, $campo)) continue;
                $schema->table($tabla, static function (\Illuminate\Database\Schema\Blueprint $t) use ($campo, $tipo, $definirColumna): void {
                    $definirColumna($t, $campo, $tipo, false);
                });
                $this->info('Columna añadida: '.$tabla.'.'.$campo);
            }
        }

        $faltantes = [];
        foreach ($estructuras as $tabla => $columnas) {
            if (!$schema->hasTable($tabla)) {
                $faltantes[] = 'tabla:'.$tabla;
                continue;
            }
            foreach (array_keys($columnas) as $campo) {
                if (!$schema->hasColumn($tabla, $campo)) {
                    $faltantes[] = $tabla.'.'.$campo;
                }
            }
        }
        if ($faltantes !== []) {
            $this->error('Quedan componentes sin reparar: '.implode(', ', $faltantes));
            return 1;
        }

        $this->info('Tablas de membresías, asignaciones, pagos y caja verificadas en '.$base.'.');
        $this->info('No se borraron filas ni se agregaron tarifas ficticias.');
        return 0;
    } catch (\Throwable $e) {
        $this->error('No se pudo reparar membresías: '.$e->getMessage());
        return 1;
    }
})->purpose('Repara esquema de membresías, asignaciones y pagos tras respaldar la base activa');

// Automatizaciones operativas para producción.
Schedule::command('membresias:actualizar-estados')->dailyAt('00:05')->withoutOverlapping();
Schedule::command('backup:database --keep=30')->dailyAt('02:00')->withoutOverlapping();
Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('03:00')->withoutOverlapping();
