<?php

namespace App\Console\Commands;

use App\Services\PortableMysqlBackup;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Throwable;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database {--keep=30 : Dias que se conservaran los respaldos}';

    protected $description = 'Genera un respaldo SQL de MySQL y elimina copias antiguas';

    public function handle(): int
    {
        if (!in_array(config('database.default'), ['mysql', 'mariadb'], true)) {
            $this->error('El respaldo empresarial esta preparado para MySQL.');
            return self::FAILURE;
        }

        $conexion = config('database.connections.'.config('database.default'));
        $database = (string) ($conexion['database'] ?? '');
        $username = (string) ($conexion['username'] ?? '');
        $password = (string) ($conexion['password'] ?? '');
        $host = (string) ($conexion['host'] ?? '127.0.0.1');
        $port = (string) ($conexion['port'] ?? '3306');

        if ($database === '') {
            $this->error('DB_DATABASE no esta configurado.');
            return self::FAILURE;
        }

        $directorio = storage_path('app/backups');
        File::ensureDirectoryExists($directorio);
        // Microsegundos: evitar sobrescribir copias si se pulsa dos veces.
        $archivo = $directorio.DIRECTORY_SEPARATOR.$database.'_'.now()->format('Ymd_His_u').'.sql';

        $binario = (string) env('MYSQLDUMP_PATH', '');
        $nombreGenerico = in_array(strtolower(trim($binario)), ['', 'mysqldump', 'mysqldump.exe'], true);
        if ($nombreGenerico && PHP_OS_FAMILY === 'Windows') {
            // XAMPP también puede estar en D: o definido por XAMPP_HOME.
            // No omitir el respaldo solo porque mysqldump no esté en PATH.
            $xamppHome = trim((string) getenv('XAMPP_HOME'));
            $raizPhp = dirname(dirname(PHP_BINARY));
            $raices = array_values(array_filter([
                $xamppHome, $raizPhp, dirname($raizPhp),
                'C:\\xampp', 'D:\\xampp',
            ]));
            $candidatos = [];
            foreach ($raices as $raiz) {
                foreach (['mysqldump.exe', 'mariadb-dump.exe'] as $nombre) {
                    $candidatos[] = rtrim($raiz, '\\/').DIRECTORY_SEPARATOR
                        .'mysql'.DIRECTORY_SEPARATOR.'bin'.DIRECTORY_SEPARATOR.$nombre;
                }
            }
            foreach ($candidatos as $candidato) {
                if (File::exists($candidato)) {
                    $binario = $candidato;
                    break;
                }
            }
        }
        if (trim($binario) === '') {
            $binario = 'mysqldump';
        }

        // Cuando una migración antigua figura aplicada pero faltan las
        // tablas referenciadas, las vistas de reportes quedan INVÁLIDAS.
        // mysqldump intenta SHOW FIELDS sobre ellas y ABORTA (error 1356),
        // impidiendo hacer respaldo y reparar las propias tablas faltantes.
        // Solo omitir del dump las vistas derivadas de Mallqui Gym que estén
        // dañadas. Los datos reales viven en tablas y nunca se excluyen.
        // Las vistas omitidas se reconstruyen con la migración de reportes
        // al concluir db:reconciliar-esquema.
        $vistasDerivadas = [
            'vista_clientes_membresias',
            'vista_stock',
            'vista_ventas',
        ];
        $vistasOmitidas = [];
        try {
            $vistasReales = DB::select(
                'SELECT TABLE_NAME AS nombre FROM INFORMATION_SCHEMA.VIEWS
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (?, ?, ?)',
                array_merge([$database], $vistasDerivadas)
            );
            foreach ($vistasReales as $vista) {
                $nombreVista = (string) ($vista->nombre ?? '');
                if (!in_array($nombreVista, $vistasDerivadas, true)) {
                    continue;
                }
                try {
                    DB::select('SELECT 1 FROM `'.$nombreVista.'` LIMIT 0');
                } catch (Throwable $e) {
                    $vistasOmitidas[] = $nombreVista;
                    $this->warn('La vista derivada '.$nombreVista.' no es válida. Se omitirá solo del respaldo; se reconstruirá tras reparar tablas.');
                }
            }
        } catch (Throwable $e) {
            // No crear una copia aparentemente válida si no se pudieron
            // identificar las vistas. Detenerse antes de ALTER TABLE.
            $this->error('No se pudo inspeccionar las vistas SQL. Se canceló el respaldo para proteger los datos.');
            return self::FAILURE;
        }

        // mysqldump escribe directamente al disco; nunca acumular toda
        // la base SQL en memoria PHP (un gimnasio puede tener fotos grandes).
        $argumentos = [
            $binario,
            '--host='.$host,
            '--port='.$port,
            '--user='.$username,
            '--single-transaction',
            '--routines',
            '--triggers',
            '--events',
            '--default-character-set=utf8mb4',
            '--result-file='.$archivo,
        ];
        foreach ($vistasOmitidas as $vista) {
            $argumentos[] = '--ignore-table='.$database.'.'.$vista;
        }
        $argumentos[] = $database;
        $process = new Process($argumentos);
        $process->setEnv(array_merge($_ENV, ['MYSQL_PWD' => $password]));
        $process->setTimeout(300);

        $nativoCorrecto = false;
        try {
            $process->run();
            $nativoCorrecto = $process->isSuccessful();
        } catch (Throwable $e) {
            // proc_open deshabilitado, ruta fuera del PATH o permisos Windows.
            // El respaldo con PDO lee la misma conexión que ya usa Laravel.
        }

        if (!$nativoCorrecto) {
            @unlink($archivo); // mysqldump puede dejar un dump incompleto.
            $this->warn('mysqldump no completó el respaldo. Intentando copia SQL portable con la conexión MySQL de Laravel...');
            try {
                // La alternativa guarda tablas, datos y vistas válidas. Si la
                // base tiene rutinas/triggers/eventos no respaldables, falla
                // antes de modificar datos, en vez de crear una copia falsa.
                (new PortableMysqlBackup())->export($archivo, $database, $vistasOmitidas);
                $this->info('Respaldo SQL portable completado sin mysqldump.');
            } catch (Throwable $e) {
                @unlink($archivo);
                $this->error('El respaldo portable tampoco pudo completarse: '.$e->getMessage());
                $this->error('No se modificó la base. Revisa permisos de MySQL y espacio en storage/app/backups.');
                return self::FAILURE;
            }
        }

        if (!File::exists($archivo) || File::size($archivo) < 200) {
            $this->error('El respaldo SQL está vacío o incompleto. La base NO se modificará.');
            @unlink($archivo);
            return self::FAILURE;
        }

        // Validar estructura SQL leyendo por bloques pequeños, sin File::get().
        $validado = false;
        $lector = @fopen($archivo, 'rb');
        if ($lector !== false) {
            try {
                $resto = '';
                while (!feof($lector)) {
                    $fragmento = $resto.fread($lector, 8192);
                    if (str_contains($fragmento, 'CREATE TABLE')) {
                        $validado = true;
                        break;
                    }
                    $resto = substr($fragmento, -32);
                }
            } finally {
                fclose($lector);
            }
        }
        if (!$validado) {
            $this->error('El respaldo no contiene CREATE TABLE verificable. No se reparará MySQL.');
            @unlink($archivo);
            return self::FAILURE;
        }

        $keep = max(1, (int) $this->option('keep'));
        $limite = now()->subDays($keep)->getTimestamp();
        foreach (File::files($directorio) as $file) {
            if ($file->getExtension() === 'sql' && $file->getMTime() < $limite) {
                File::delete($file->getPathname());
            }
        }

        $this->info('Respaldo creado correctamente: '.$archivo);
        return self::SUCCESS;
    }
}
