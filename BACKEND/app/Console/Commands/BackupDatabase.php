<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
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
        $archivo = $directorio.DIRECTORY_SEPARATOR.$database.'_'.now()->format('Ymd_His').'.sql';

        $binario = (string) env('MYSQLDUMP_PATH', '');
        $nombreGenerico = in_array(strtolower(trim($binario)), ['', 'mysqldump', 'mysqldump.exe'], true);
        $xampp = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        if ($nombreGenerico && PHP_OS_FAMILY === 'Windows' && File::exists($xampp)) {
            // XAMPP instala mysqldump fuera del PATH de PowerShell en muchos equipos.
            $binario = $xampp;
        } elseif ($binario === '') {
            $binario = 'mysqldump';
        }

        // mysqldump escribe directamente al disco; nunca acumular toda
        // la base SQL en memoria PHP (un gimnasio puede tener fotos grandes).
        $process = new Process([
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
            $database,
        ]);
        $process->setEnv(array_merge($_ENV, ['MYSQL_PWD' => $password]));
        $process->setTimeout(300);

        try {
            $process->run();
        } catch (Throwable $e) {
            $this->error('No se pudo iniciar mysqldump. Revisa MYSQLDUMP_PATH o C:\xampp\mysql\bin\mysqldump.exe.');
            @unlink($archivo);
            return self::FAILURE;
        }

        if (!$process->isSuccessful()) {
            $this->error('Falló el respaldo SQL: '.trim($process->getErrorOutput()));
            @unlink($archivo);
            return self::FAILURE;
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
