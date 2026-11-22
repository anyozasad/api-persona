<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Restauración aditiva para Progreso Físico en MySQL/XAMPP.
 * No modifica los valores de mediciones previas ni elimina tablas.
 */
class AsegurarProgresoGym extends Command
{
    protected $signature = 'db:asegurar-progreso';
    protected $description = 'Respaldar MySQL y completar las tablas de mediciones y rutinas sin borrar datos';

    private const NECESARIAS = [
        'progreso_medidas' => ['id','id_cliente','peso','grasa','cintura','brazo','fecha'],
        'rutinas' => ['id_rutina','id_cliente','nombre_rutina','estado','fecha_inicio','objetivo','descripcion'],
    ];

    public function handle(): int
    {
        try {
            $db = DB::connection();
            $db->getPdo();
            $database = (string) $db->getDatabaseName();
            $this->info('MySQL activo: '.$database);
            $motor = $db->getDriverName();
            if (!in_array($motor, ['mysql','mariadb'], true)) {
                $this->error('Este comando solo se permite en MySQL/MariaDB.');
                return self::FAILURE;
            }
            if (!Schema::hasTable('clientes') || !Schema::hasColumn('clientes','id_cliente')) {
                $this->error('Primero debes recuperar la tabla clientes. No se modificarán datos.');
                return self::FAILURE;
            }

            $faltantes = [];
            foreach (self::NECESARIAS as $tabla => $columnas) {
                if (!Schema::hasTable($tabla)) {
                    $faltantes[] = 'tabla:'.$tabla;
                    continue;
                }
                foreach ($columnas as $columna) {
                    if (!Schema::hasColumn($tabla, $columna)) {
                        $faltantes[] = $tabla.'.'.$columna;
                    }
                }
            }
            if ($faltantes === []) {
                $this->info('Progreso físico ya dispone de sus tablas y columnas.');
                return self::SUCCESS;
            }
            $this->warn('Objetos pendientes: '.implode(', ', $faltantes));

            // Las PK legacy existentes pueden contener otros IDs: no adivinar
            // sus relaciones ni generar un nuevo autoincremento sin revisión.
            foreach (self::NECESARIAS as $tabla => $columnas) {
                if (Schema::hasTable($tabla) && !Schema::hasColumn($tabla, $columnas[0])) {
                    $this->error('La tabla '.$tabla.' tiene una clave antigua. No se alterará automáticamente su ID.');
                    return self::FAILURE;
                }
            }
            if (!$this->confirm('¿Guardar respaldo SQL completo antes de recuperar Progreso Físico?', false)) {
                $this->warn('Cancelado; no se modificó la base.');
                return self::FAILURE;
            }
            $inicio = time();
            $resultado = Artisan::call('backup:database', ['--keep'=>30]);
            $this->line(Artisan::output());
            if ($resultado !== 0) {
                $this->error('El respaldo falló. Reparación detenida.');
                return self::FAILURE;
            }
            $backups = glob(storage_path('app/backups').DIRECTORY_SEPARATOR.$database.'_*.sql') ?: [];
            $comprobado = false;
            foreach ($backups as $ruta) {
                if (is_file($ruta) && filesize($ruta)>200 && filemtime($ruta)>=$inicio-2) {
                    $comprobado = true;
                    break;
                }
            }
            if (!$comprobado) {
                $this->error('No se confirmó un respaldo nuevo y válido. No se modificarán tablas.');
                return self::FAILURE;
            }

            if (!Schema::hasTable('progreso_medidas')) {
                Schema::create('progreso_medidas', function (Blueprint $t) {
                    $t->bigIncrements('id');
                    $t->unsignedBigInteger('id_cliente')->index();
                    $t->decimal('peso',7,2)->nullable();
                    $t->decimal('grasa',6,2)->nullable();
                    $t->decimal('cintura',7,2)->nullable();
                    $t->decimal('brazo',7,2)->nullable();
                    $t->date('fecha')->index();
                    $t->dateTime('created_at')->nullable();
                });
                $this->info('Tabla progreso_medidas creada.');
            }
            if (!Schema::hasTable('rutinas')) {
                Schema::create('rutinas', function (Blueprint $t) {
                    $t->bigIncrements('id_rutina');
                    $t->unsignedBigInteger('id_cliente')->index();
                    $t->unsignedBigInteger('id_entrenador')->nullable()->index();
                    $t->string('nombre_rutina',150);
                    $t->string('objetivo',150)->nullable();
                    $t->text('descripcion')->nullable();
                    $t->date('fecha_inicio')->nullable();
                    $t->date('fecha_fin')->nullable();
                    $t->string('estado',30)->default('Activo');
                });
                $this->info('Tabla rutinas creada.');
            }

            $campos = [
                'progreso_medidas' => [
                    'id_cliente'=>'unsignedBigInteger','peso'=>'decimal',
                    'grasa'=>'decimal','cintura'=>'decimal','brazo'=>'decimal',
                    'fecha'=>'date','created_at'=>'dateTime',
                ],
                'rutinas' => [
                    'id_cliente'=>'unsignedBigInteger','id_entrenador'=>'unsignedBigInteger',
                    'nombre_rutina'=>'string','estado'=>'string','fecha_inicio'=>'date',
                    'objetivo'=>'string','descripcion'=>'text','fecha_fin'=>'date',
                ],
            ];
            foreach ($campos as $tabla => $columnas) {
                foreach ($columnas as $campo => $tipo) {
                    if (Schema::hasColumn($tabla,$campo)) continue;
                    Schema::table($tabla, function (Blueprint $t) use ($campo,$tipo) {
                        switch ($tipo) {
                            case 'unsignedBigInteger':
                                $t->unsignedBigInteger($campo)->nullable(); break;
                            case 'decimal':
                                $t->decimal($campo,12,2)->nullable(); break;
                            case 'date':
                                $t->date($campo)->nullable(); break;
                            case 'dateTime':
                                $t->dateTime($campo)->nullable(); break;
                            case 'text':
                                $t->text($campo)->nullable(); break;
                            default:
                                $t->string($campo,255)->nullable();
                        }
                    });
                    $this->info('Columna recuperada: '.$tabla.'.'.$campo);
                }
            }

            $pendientes=[];
            foreach (self::NECESARIAS as $tabla=>$columnas) {
                foreach ($columnas as $campo) {
                    if (!Schema::hasTable($tabla) || !Schema::hasColumn($tabla,$campo)) {
                        $pendientes[]=$tabla.'.'.$campo;
                    }
                }
            }
            if ($pendientes) {
                $this->error('Persisten elementos: '.implode(', ',$pendientes));
                return self::FAILURE;
            }
            $this->info('Progreso Físico reparado y verificado en '.$database.'. Sin borrar registros.');
            return self::SUCCESS;
        } catch (Throwable $e) {
            report($e);
            $this->error('No se completó Progreso Físico: '.$e->getMessage());
            return self::FAILURE;
        }
    }
}
