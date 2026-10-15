<?php

namespace App\Console\Commands;

use App\Services\GymSystemDataMirror;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;
use Throwable;

class UsarGymSystemComoPrincipal extends Command
{
    protected $signature = 'gym:usar-gym-system';

    protected $description = 'Migra de forma segura los datos actuales a gym_system/app_* y configura gym_system como base principal sin borrar las tablas legacy';

    public function handle(GymSystemDataMirror $mirror): int
    {
        try {
            $conexion = (string) config('database.default');
            $config = (array) config('database.connections.'.$conexion, []);

            if (!in_array($config['driver'] ?? '', ['mysql', 'mariadb'], true)) {
                throw new RuntimeException('Este cambio seguro requiere MySQL o MariaDB.');
            }

            $destino = (string) env('GYM_DB_DATABASE', 'gym_system');
            $actual = (string) ($config['database'] ?? '');
            $prefijoActual = (string) ($config['prefix'] ?? '');

            if ($actual === $destino && $prefijoActual === 'app_') {
                $this->info('gym_system ya es la base principal del sistema.');
                return self::SUCCESS;
            }

            $this->info('1/4 Aplicando migraciones pendientes en la base actual...');
            $codigoMigracion = Artisan::call('migrate', ['--force' => true]);
            if ($codigoMigracion !== 0) {
                throw new RuntimeException('No se pudieron aplicar las migraciones antes de copiar los datos.');
            }

            $this->info('2/4 Copiando datos actuales a tablas app_* dentro de '.$destino.'...');
            $resultado = $mirror->sincronizarTodo();
            if (!empty($resultado['omitido']) && $actual !== $destino) {
                throw new RuntimeException($resultado['motivo'] ?? 'No se pudo preparar gym_system.');
            }

            config([
                'database.connections.gym_system_switch_check' => array_merge($config, [
                    'database' => $destino,
                    'prefix' => '',
                ]),
            ]);
            DB::purge('gym_system_switch_check');
            $schema = DB::connection('gym_system_switch_check')->getSchemaBuilder();

            foreach ([
                'app_clientes',
                'app_usuarios',
                'app_membresias',
                'app_productos',
                'app_rutinas',
                'app_personal_access_tokens',
                'app_migrations',
            ] as $tabla) {
                if (!$schema->hasTable($tabla)) {
                    throw new RuntimeException('Falta la tabla requerida '.$tabla.' en '.$destino.'. No se modificó el archivo .env.');
                }
            }

            $this->info('3/4 Guardando respaldo del archivo .env...');
            $envPath = base_path('.env');
            if (!File::exists($envPath)) {
                throw new RuntimeException('No existe el archivo .env del backend.');
            }

            $directorio = storage_path('app/backups');
            if (!File::isDirectory($directorio)) {
                File::makeDirectory($directorio, 0755, true);
            }
            File::copy($envPath, $directorio.'/env_antes_gym_system_'.now()->format('Ymd_His').'.bak');

            $contenido = File::get($envPath);
            $contenido = $this->ponerVariable($contenido, 'DB_DATABASE', $destino);
            $contenido = $this->ponerVariable($contenido, 'DB_TABLE_PREFIX', 'app_');
            $contenido = $this->ponerVariable($contenido, 'GYM_DB_DATABASE', $destino);
            File::put($envPath, $contenido);

            $this->info('4/4 Limpiando caché de configuración...');
            Artisan::call('optimize:clear');

            $this->newLine();
            $this->info('LISTO: '.$destino.' quedó configurada como base principal.');
            $this->line('Las tablas modernas se usan como app_* y las tablas legacy originales NO fueron eliminadas.');
            $this->line('Reinicia php artisan serve para aplicar la nueva conexión.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No se realizó el cambio: '.$e->getMessage());
            $this->line('No se eliminaron tablas ni se reemplazó la base existente.');
            return self::FAILURE;
        }
    }

    private function ponerVariable(string $contenido, string $clave, string $valor): string
    {
        $patron = '/^'.preg_quote($clave, '/').'=.*$/m';
        $linea = $clave.'='.$valor;

        if (preg_match($patron, $contenido)) {
            return preg_replace($patron, $linea, $contenido) ?? $contenido;
        }

        return rtrim($contenido)."\n".$linea."\n";
    }
}
