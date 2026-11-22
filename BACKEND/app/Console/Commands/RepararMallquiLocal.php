<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Reparación local desde BACKEND, sin depender de la carpeta /scripts.
 * Siempre respalda MySQL antes de modificar columnas o reconstruir vistas.
 * No ejecuta migrate:fresh, reset, down ni crea datos de demostración.
 */
class RepararMallquiLocal extends Command
{
    protected $signature = 'db:reparar-gym {--confirmar : Autoriza respaldar y reparar el esquema}';

    protected $description = 'Respalda MySQL y completa tablas, columnas y vistas sin borrar registros';

    public function handle(): int
    {
        try {
            $conexion = DB::connection();
            $conexion->getPdo();
            $motor = $conexion->getDriverName();
            if (!in_array($motor, ['mysql', 'mariadb'], true)) {
                $this->error('Esta reparación requiere MySQL o MariaDB, no '.$motor.'.');
                return self::FAILURE;
            }
        } catch (Throwable $e) {
            $this->error('No se puede conectar a MySQL. Comprueba que XAMPP esté encendido y revisa BACKEND/.env.');
            return self::FAILURE;
        }

        if (Artisan::call('db:verificar') === 0) {
            $this->info('MySQL ya tiene todas las tablas, columnas y vistas requeridas. No se modificó.');
            return self::SUCCESS;
        }

        $base = (string) DB::connection()->getDatabaseName();
        $this->warn('Base con pendientes: '.$base.'. No se borrarán socios, productos, ventas ni pagos.');
        if (!$this->option('confirmar') &&
            !$this->confirm('¿Autorizar respaldo SQL y reparación aditiva del esquema?', false)) {
            $this->warn('Operación cancelada. MySQL no fue modificado.');
            return self::FAILURE;
        }

        // Exclusión compartida con el botón web del administrador.
        $archivoCandado = storage_path('app/mallqui_esquema_reparacion.lock');
        $candado = @fopen($archivoCandado, 'c');
        if (!$candado || !flock($candado, LOCK_EX | LOCK_NB)) {
            if ($candado) fclose($candado);
            $this->error('Ya existe una reparación en curso. No ejecutar cambios simultáneos.');
            return self::FAILURE;
        }

        try {
            $this->info('Creando primero el respaldo SQL completo...');
            if (Artisan::call('backup:database') !== 0) {
                $this->error('Falló el respaldo SQL; no se cambió ninguna tabla.');
                $this->line(trim(Artisan::output()));
                return self::FAILURE;
            }

            // Comprobar la ruta exacta informada por el respaldo, no aceptar
            // una copia antigua como si se acabara de generar.
            $salidaBackup = trim(Artisan::output());
            if (!preg_match('/Respaldo creado correctamente:\s*(.+)$/m', $salidaBackup, $coincidencias)) {
                $this->error('No se pudo confirmar la ubicación del respaldo. Cancelado.');
                return self::FAILURE;
            }
            $rutaSql = trim($coincidencias[1]);
            if (!is_file($rutaSql) || filesize($rutaSql) < 200) {
                $this->error('No existe un respaldo SQL nuevo y verificable. Cancelado.');
                return self::FAILURE;
            }
            $this->info('Respaldo conservado: '.$rutaSql);

            $this->info('Completando tablas y columnas faltantes...');
            $reconciliacion = Artisan::call('db:reconciliar-esquema');
            $this->line(trim(Artisan::output()));
            if ($reconciliacion !== 0) {
                $this->error('Algunos componentes siguen pendientes. Se conservó el respaldo SQL.');
                return self::FAILURE;
            }

            $this->info('Verificando la base de datos después de repararla...');
            $verificacion = Artisan::call('db:verificar');
            $this->line(trim(Artisan::output()));
            if ($verificacion !== 0) {
                $this->error('La validación no fue completa. Se conservó el respaldo SQL.');
                return self::FAILURE;
            }

            $this->info('MySQL verificado. El administrador y el portal usan la misma base: '.$base);
            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No fue posible completar la reparación: '.$e->getMessage());
            return self::FAILURE;
        } finally {
            flock($candado, LOCK_UN);
            fclose($candado);
        }
    }
}
