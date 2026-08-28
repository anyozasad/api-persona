<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database {--keep=30 : Dias que se conservaran los respaldos}';

    protected $description = 'Genera un respaldo SQL de MySQL y elimina copias antiguas';

    public function handle(): int
    {
        if (config('database.default') !== 'mysql') {
            $this->error('El respaldo empresarial esta preparado para MySQL.');
            return self::FAILURE;
        }

        $conexion = config('database.connections.mysql');
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

        $binario = (string) env('MYSQLDUMP_PATH', 'mysqldump');
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
            $database,
        ]);
        $process->setEnv(array_merge($_ENV, ['MYSQL_PWD' => $password]));
        $process->setTimeout(300);
        $process->run();

        if (!$process->isSuccessful()) {
            $this->error('No se pudo generar el respaldo: '.trim($process->getErrorOutput()));
            @unlink($archivo);
            return self::FAILURE;
        }

        File::put($archivo, $process->getOutput());

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
