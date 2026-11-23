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

    /**
     * Resumen útil para el administrador, sin enviar SQL, contraseñas,
     * rutas locales ni datos de socios al navegador.
     */
    private function erroresReparacion(string $salida): array
    {
        $encontrados = [];
        foreach (preg_split('/\R/u', $salida) ?: [] as $linea) {
            $linea = trim($linea);
            if (preg_match('/(?:No se pudo reparar|Migración pendiente|Falta el archivo de migración):?\\s*([a-zA-Z0-9_.-]+)/u', $linea, $m)) {
                $encontrados[] = $m[1];
            } elseif (preg_match('/SQLSTATE\\[([A-Z0-9]+)\\]/i', $linea, $m)) {
                $encontrados[] = 'SQLSTATE_'.$m[1];
            }
        }
        return array_slice(array_values(array_unique($encontrados)), 0, 12);
    }

    public function reparar(Request $request)
    {
        $request->validate(['confirmacion' => 'required|in:RESPALDAR_Y_REPARAR']);

        // XAMPP suele limitar las peticiones PHP a 30-120 s. Crear un dump
        // y recuperar decenas de columnas requiere más tiempo; de otro modo
        // se interrumpe a medias y el administrador sigue viendo el aviso.
        // Solo se habilita tras autenticación, permiso de administrador y
        // confirmación explícita. La copia SQL conserva los datos anteriores.
        if (function_exists('set_time_limit')) {
            @set_time_limit(600);
        }

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
                    'etapa' => 'respaldo',
                    'faltantes' => $inicial['faltantes'],
                    'problemas_detectados' => $this->erroresReparacion(Artisan::output()),
                    'mensaje' => 'Falló el respaldo de la base de datos activa; no se modificó MySQL. Comprueba mysqldump y el usuario de la conexión.',
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
                    'etapa' => 'respaldo',
                    'faltantes' => $inicial['faltantes'],
                    'mensaje' => 'El respaldo no apareció en BACKEND/storage/app/backups. No se ejecutaron cambios sobre MySQL.',
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
                    'etapa' => 'migraciones',
                    'problemas_detectados' => $this->erroresReparacion($salida),
                    'mensaje' => 'El respaldo existe, pero la reparación de tablas no terminó. Consulta los componentes pendientes que se muestran abajo.',
                    'respaldo' => $backup,
                ]), 503);
            }

            $verificado = Artisan::call('db:verificar');
            if ($verificado !== 0) {
                return response()->json(array_merge($final, [
                    'codigo' => 'VERIFICACION_BD_PENDIENTE',
                    'etapa' => 'verificacion',
                    'problemas_detectados' => $this->erroresReparacion(Artisan::output()),
                    'mensaje' => 'MySQL completó parte de la reparación, pero todavía fallan verificaciones. No se ha declarado terminado.',
                    'respaldo' => $backup,
                ]), 503);
            }

            return response()->json(array_merge($final, [
                'codigo' => 'REPARACION_COMPLETA',
                'etapa' => 'completo',
                'problemas_detectados' => [],
                'mensaje' => 'MySQL reparado y verificado. No se borraron datos existentes.',
                'respaldo' => $backup,
            ]));
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'codigo' => 'REPARACION_ERROR',
                'etapa' => 'excepcion',
                'problemas_detectados' => $this->erroresReparacion($e->getMessage()),
                'mensaje' => 'No se completó la recuperación. La causa técnica quedó registrada en BACKEND/storage/logs.',
            ], 503);
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }
}
