<?php

namespace App\Http\Controllers;

use App\Console\Commands\ReconciliarEsquemaRealMallqui;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Reparación explícita del MySQL del administrador. NUNCA se activa en
 * consultas GET ni en el inicio de sesión, ni ejecuta fresh, down o seed.
 */
class ReparacionEsquemaController extends Controller
{
    private function diagnostico(): array
    {
        $faltantes = [];
        $requisitos = ReconciliarEsquemaRealMallqui::requisitos();
        foreach ($requisitos as $tabla => $columnas) {
            if (!Schema::hasTable($tabla)) {
                $faltantes[] = 'tabla:'.$tabla;
                continue;
            }
            // Leer las columnas existentes una vez por tabla para que el
            // diagnóstico no ejecute cientos de consultas sobre XAMPP.
            $campos = array_fill_keys(Schema::getColumnListing($tabla), true);
            foreach ($columnas as $columna) {
                if (!isset($campos[$columna])) {
                    $faltantes[] = $tabla.'.'.$columna;
                }
            }
        }
        $faltantes = array_merge(
            $faltantes,
            ReconciliarEsquemaRealMallqui::integridadCatalogoPendiente()
        );
        // Mismo criterio que /api/estado-sistema y db:verificar. Si las
        // vistas faltan, el botón de reparación debe poder reconstruirlas.
        foreach (['vista_clientes_membresias', 'vista_stock', 'vista_ventas'] as $vista) {
            try {
                DB::table($vista)->limit(1)->get();
            } catch (Throwable $e) {
                $faltantes[] = 'vista:'.$vista;
            }
        }

        return [
            'base_datos' => (string) DB::connection()->getDatabaseName(),
            'total_tablas' => count($requisitos),
            'faltantes' => $faltantes,
            'operativo' => count($faltantes) === 0,
        ];
    }

    public function estado()
    {
        try {
            DB::connection()->getPdo();
            return response()->json($this->diagnostico());
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'codigo' => 'MYSQL_SIN_CONEXION',
                'mensaje' => 'No se puede comprobar MySQL. Enciende MySQL en XAMPP y verifica la configuración de Laravel.',
            ], 503);
        }
    }

    public function reparar(Request $request)
    {
        $request->validate(['confirmacion' => 'required|in:RESPALDAR_Y_REPARAR']);

        // Impedir dos reparaciones concurrentes, incluso en Windows/XAMPP.
        $lockPath = storage_path('app/mallqui_esquema_reparacion.lock');
        $lock = @fopen($lockPath, 'c');
        if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
            if ($lock) fclose($lock);
            return response()->json([
                'codigo' => 'REPARACION_EN_CURSO',
                'mensaje' => 'Ya hay una reparación ejecutándose. Vuelve a consultar el estado.',
            ], 409);
        }

        try {
            $connection = DB::connection();
            $connection->getPdo();
            if (!in_array($connection->getDriverName(), ['mysql', 'mariadb'], true)) {
                return response()->json([
                    'codigo' => 'MOTOR_NO_ADMITIDO',
                    'mensaje' => 'La reparación solo está disponible para MySQL o MariaDB.',
                ], 422);
            }

            $inicial = $this->diagnostico();
            if ($inicial['operativo']) {
                return response()->json(array_merge($inicial, [
                    'codigo' => 'ESQUEMA_COMPLETO',
                    'mensaje' => 'Las tablas y columnas obligatorias ya existen. No se modificó MySQL.',
                    'respaldo' => null,
                ]));
            }

            $inicio = time();
            $resultadoBackup = Artisan::call('backup:database', ['--keep' => 30]);
            if ($resultadoBackup !== 0) {
                Log::error('Reparación de MySQL cancelada: falló el respaldo.', [
                    'base' => $inicial['base_datos'], 'salida' => substr(Artisan::output(), 0, 2500),
                ]);
                return response()->json([
                    'codigo' => 'RESPALDO_SQL_FALLIDO',
                    'mensaje' => 'No se pudo generar un respaldo SQL válido. No se modificó ninguna tabla.',
                ], 503);
            }

            $carpeta = storage_path('app/backups');
            $copias = glob($carpeta.DIRECTORY_SEPARATOR.$inicial['base_datos'].'_*.sql') ?: [];
            $copias = array_values(array_filter($copias, static function (string $archivo) use ($inicio): bool {
                return is_file($archivo) && filesize($archivo) > 200
                    && filemtime($archivo) >= $inicio - 2;
            }));
            if ($copias === []) {
                return response()->json([
                    'codigo' => 'RESPALDO_NO_VERIFICADO',
                    'mensaje' => 'No se verificó una copia SQL nueva. La reparación no se ejecutó.',
                ], 503);
            }
            usort($copias, static fn (string $a, string $b): int => filemtime($b) <=> filemtime($a));
            $backup = basename($copias[0]);

            $codigo = Artisan::call('db:reconciliar-esquema');
            $salida = Artisan::output();
            $final = $this->diagnostico();

            if ($codigo !== 0 || !$final['operativo']) {
                $final['operativo'] = false;
                Log::warning('La recuperación de MySQL dejó módulos pendientes.', [
                    'base' => $inicial['base_datos'], 'salida' => substr($salida, 0, 5000),
                    'faltantes' => $final['faltantes'],
                ]);
                return response()->json(array_merge($final, [
                    'codigo' => 'REPARACION_PARCIAL',
                    'mensaje' => 'Se conservó el respaldo SQL. Hay tablas o columnas que todavía requieren revisión.',
                    'respaldo' => $backup,
                ]), 503);
            }

            $verificado = Artisan::call('db:verificar');
            if ($verificado !== 0) {
                return response()->json(array_merge($final, [
                    'codigo' => 'VERIFICACION_BD_PENDIENTE',
                    'mensaje' => 'Las tablas principales están disponibles, pero la validación completa detectó pendientes.',
                    'respaldo' => $backup,
                ]), 503);
            }

            return response()->json(array_merge($final, [
                'codigo' => 'REPARACION_COMPLETA',
                'mensaje' => 'MySQL reparado y verificado. No se borraron datos existentes.',
                'respaldo' => $backup,
            ]));
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'codigo' => 'REPARACION_ERROR',
                'mensaje' => 'No se completó la recuperación. Revisa el registro de Laravel antes de repetir.',
            ], 503);
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }
}
