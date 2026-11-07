<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class PrepararMallquiSistema extends Command
{
    protected $signature = 'sistema:preparar';

    protected $description = 'Prepara Mallqui Gym: limpia cache, sincroniza esquema, carga datos base y verifica requisitos';

    public function handle(): int
    {
        $this->info('Preparando Mallqui Gym...');

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

        $this->info('Cargando datos base sin eliminar registros existentes...');
        $codigoSeed = Artisan::call('db:seed', ['--force' => true]);
        $salidaSeed = trim(Artisan::output());
        if ($salidaSeed !== '') {
            $this->line($salidaSeed);
        }
        if ($codigoSeed !== 0) {
            $this->error('No se pudieron cargar los datos base.');
            return self::FAILURE;
        }

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
