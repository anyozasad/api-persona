<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Process\Process;
use Throwable;

class VerificarProduccion extends Command
{
    protected $signature = 'sistema:verificar-produccion';

    protected $description = 'Audita configuracion minima antes de desplegar el sistema en una empresa';

    public function handle(): int
    {
        $errores = 0;
        $avisos = 0;

        $this->info('Verificando preparacion para produccion...');
        $this->newLine();

        $this->check(config('app.env') === 'production', 'APP_ENV=production', 'APP_ENV no esta en production', $errores);
        $this->check(config('app.debug') === false, 'APP_DEBUG=false', 'APP_DEBUG debe estar desactivado', $errores);
        $this->check(config('database.default') === 'mysql', 'Base de datos MySQL', 'La conexion predeterminada debe ser MySQL', $errores);
        $this->check(str_starts_with((string) config('app.url'), 'https://'), 'APP_URL usa HTTPS', 'APP_URL debe usar HTTPS en produccion', $errores);
        $this->check((int) config('sanctum.expiration') > 0, 'Tokens Sanctum con expiracion', 'Configura SANCTUM_EXPIRATION', $errores);

        $mailer = (string) config('mail.default');
        if ($mailer === 'log' || $mailer === 'array') {
            $this->warn('AVISO: El correo sigue en modo '.$mailer.'. Recuperacion de contraseña no enviara correo real.');
            $avisos++;
        } else {
            $this->info('OK: Correo configurado con mailer '.$mailer);
        }

        foreach (['usuarios', 'clientes', 'pagos_membresia', 'ventas', 'cajas', 'movimientos_caja', 'movimientos_inventario', 'auditorias', 'personal_access_tokens'] as $tabla) {
            try {
                if (Schema::hasTable($tabla)) {
                    $this->info('OK tabla critica: '.$tabla);
                } else {
                    $this->error('FALTA tabla critica: '.$tabla);
                    $errores++;
                }
            } catch (Throwable $e) {
                $this->error('No se pudo comprobar la tabla '.$tabla);
                $errores++;
            }
        }

        try {
            DB::select('SELECT 1');
            $this->info('OK: Conexion a base de datos');
        } catch (Throwable $e) {
            $this->error('FALLA: No hay conexion a base de datos');
            $errores++;
        }

        $dump = (string) env('MYSQLDUMP_PATH', 'mysqldump');
        try {
            $process = new Process([$dump, '--version']);
            $process->setTimeout(15);
            $process->run();
            if ($process->isSuccessful()) {
                $this->info('OK: mysqldump disponible para respaldos');
            } else {
                $this->warn('AVISO: mysqldump no esta disponible. Configura MYSQLDUMP_PATH.');
                $avisos++;
            }
        } catch (Throwable $e) {
            $this->warn('AVISO: No se pudo ejecutar mysqldump. Configura MYSQLDUMP_PATH.');
            $avisos++;
        }

        try {
            Artisan::call('schedule:list');
            $salida = Artisan::output();
            foreach (['membresias:actualizar-estados', 'backup:database', 'sanctum:prune-expired'] as $tarea) {
                if (str_contains($salida, $tarea)) {
                    $this->info('OK tarea programada: '.$tarea);
                } else {
                    $this->warn('AVISO: No aparece la tarea programada '.$tarea);
                    $avisos++;
                }
            }
        } catch (Throwable $e) {
            $this->warn('AVISO: No se pudo validar el scheduler.');
            $avisos++;
        }

        $this->newLine();
        if ($errores > 0) {
            $this->error("NO LISTO PARA PRODUCCION: {$errores} error(es) y {$avisos} aviso(s).");
            return self::FAILURE;
        }

        if ($avisos > 0) {
            $this->warn("CASI LISTO: no hay errores criticos, pero quedan {$avisos} aviso(s) por resolver.");
            return self::SUCCESS;
        }

        $this->info('LISTO A NIVEL DE CONFIGURACION: controles minimos de produccion superados.');
        return self::SUCCESS;
    }

    private function check(bool $condicion, string $ok, string $error, int &$errores): void
    {
        if ($condicion) {
            $this->info('OK: '.$ok);
        } else {
            $this->error('FALLA: '.$error);
            $errores++;
        }
    }
}
