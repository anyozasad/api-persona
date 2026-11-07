<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Membresia;
use App\Models\Categoria;
use App\Models\ConfiguracionSistema;
use Throwable;

class PrepararMallquiSistema extends Command
{
    protected $signature = 'sistema:preparar';

    protected $description = 'Prepara Mallqui Gym: limpia cache, sincroniza esquema, carga datos base y verifica requisitos';

    public function handle(): int
    {
        $this->info('Preparando Mallqui Gym...');

        // Evita que una configuración cacheada antigua vuelva a aplicar "app_"
        // a las tablas durante esta misma ejecución.
        config([
            'database.connections.mysql.prefix' => '',
            'database.connections.mariadb.prefix' => '',
        ]);
        DB::purge(config('database.default'));

        foreach (['optimize:clear', 'db:sincronizar'] as $comando) {
            $codigo = Artisan::call($comando);
            $salida = trim(Artisan::output());
            if ($salida !== '') {
                $this->line($salida);
            }

            if ($codigo !== 0) {
                $this->error("Falló {$comando}. Corrige el error mostrado antes de iniciar el sistema.");
                return self::FAILURE;
            }
        }

        $this->prepararDatosMinimos();

        $codigoVerificar = Artisan::call('db:verificar');
        $salidaVerificar = trim(Artisan::output());
        if ($salidaVerificar !== '') {
            $this->line($salidaVerificar);
        }
        if ($codigoVerificar !== 0) {
            $this->error('El esquema todavía tiene problemas. Revisa los mensajes FALTA mostrados arriba.');
            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Comprobando datos mínimos para una demostración funcional...');

        $this->dato('Membresías activas', 'membresias', 'estado', 'Activo');
        $this->dato('Categorías activas', 'categorias', 'estado', 'Activo');
        $this->dato('Socios registrados', 'clientes');
        $this->dato('Productos registrados', 'productos');
        $this->dato('Entrenadores registrados', 'entrenadores');

        $admin = false;
        try {
            $admin = Schema::hasTable('usuarios')
                && DB::table('usuarios')
                    ->whereRaw('LOWER(rol) = ?', ['administrador'])
                    ->whereRaw('LOWER(estado) = ?', ['activo'])
                    ->exists();
        } catch (Throwable $e) {
            $admin = false;
        }

        if ($admin) {
            $this->info('OK: existe un administrador activo.');
        } else {
            $this->warn('FALTA ADMINISTRADOR: ejecuta php artisan admin:crear');
        }

        $this->newLine();
        $this->info('PREPARACIÓN TERMINADA.');
        $this->line('1. Inicia Laravel: php artisan serve');
        $this->line('2. Inicia Angular desde FRONTEND/suma-angular: ng serve');
        $this->line('3. Revisa /api/estado-sistema y luego entra al dashboard.');
        if (!$admin) {
            $this->line('4. Antes de iniciar sesión crea el administrador con: php artisan admin:crear');
        }

        return self::SUCCESS;
    }

    private function prepararDatosMinimos(): void
    {
        try {
            if (Schema::hasTable('membresias') && DB::table('membresias')->count() === 0) {
                Membresia::create([
                    'nombre' => 'Mensualidad 1 mes',
                    'duracion_meses' => 1,
                    'precio' => 80.00,
                    'descripcion' => 'Mensualidad individual de Mallqui Gym.',
                    'beneficios' => ['Acceso al gimnasio', 'Rutina y control de asistencias'],
                    'permite_reservas' => true,
                    'estado' => 'Activo',
                ]);
                $this->info('OK: se creó una membresía inicial porque no existía ninguna.');
            }

            if (Schema::hasTable('categorias') && DB::table('categorias')->count() === 0) {
                Categoria::create([
                    'nombre_categoria' => 'Bebidas',
                    'descripcion' => 'Productos disponibles en recepción.',
                    'estado' => 'Activo',
                ]);
                $this->info('OK: se creó una categoría inicial porque no existía ninguna.');
            }

            if (Schema::hasTable('configuracion_sistema') && DB::table('configuracion_sistema')->count() === 0) {
                ConfiguracionSistema::create([
                    'nombre_gimnasio' => 'Mallqui Gym',
                    'telefono' => '939398148',
                    'direccion' => 'Jr. Los Laureles Mz 17 Lt 18',
                    'hora_apertura' => '06:00:00',
                    'hora_cierre' => '21:30:00',
                    'dias_atencion' => ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
                    'dias_aviso_vencimiento' => 7,
                    'minutos_cancelacion_reserva' => 120,
                    'dias_anticipacion_reserva' => 7,
                    'stock_minimo_default' => 5,
                    'notificar_vencimientos' => true,
                    'notificar_stock_bajo' => true,
                    'notificar_pagos_pendientes' => true,
                ]);
                $this->info('OK: se creó configuración inicial porque no existía ninguna.');
            }
        } catch (Throwable $e) {
            $this->warn('No se pudieron preparar algunos datos mínimos: '.$e->getMessage());
        }
    }

    private function dato(string $nombre, string $tabla, ?string $columna = null, ?string $valor = null): void
    {
        try {
            if (!Schema::hasTable($tabla)) {
                $this->warn("FALTA: {$nombre} (tabla {$tabla})");
                return;
            }

            $q = DB::table($tabla);
            if ($columna && $valor !== null && Schema::hasColumn($tabla, $columna)) {
                $q->whereRaw('LOWER('.$columna.') = ?', [mb_strtolower($valor)]);
            }

            $cantidad = (int) $q->count();
            $mensaje = "{$nombre}: {$cantidad}";

            if ($cantidad > 0) {
                $this->info('OK: '.$mensaje);
            } else {
                $this->warn('AVISO: '.$mensaje);
            }
        } catch (Throwable $e) {
            $this->warn("No se pudo revisar {$nombre}: ".$e->getMessage());
        }
    }
}
