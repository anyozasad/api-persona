<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class GenerarJwtSecret extends Command
{
    protected $signature = 'jwt:secret {--force : Reemplaza JWT_SECRET si ya existe}';

    protected $description = 'Genera una clave segura para firmar los JWT del modulo academico';

    public function handle(): int
    {
        $env = base_path('.env');

        if (!is_file($env)) {
            $this->error('No se encontró el archivo .env.');
            return self::FAILURE;
        }

        $contenido = file_get_contents($env);
        if ($contenido === false) {
            $this->error('No se pudo leer el archivo .env.');
            return self::FAILURE;
        }

        $existe = preg_match('/^JWT_SECRET=.*$/m', $contenido) === 1;

        if ($existe && !$this->option('force')) {
            $this->warn('JWT_SECRET ya existe. Usa --force solo si deseas reemplazarlo.');
            return self::SUCCESS;
        }

        // Hexadecimal evita problemas de escape en dotenv y aporta 512 bits aleatorios.
        $secret = bin2hex(random_bytes(64));
        $linea = 'JWT_SECRET='.$secret;

        if ($existe) {
            $contenido = preg_replace('/^JWT_SECRET=.*$/m', $linea, $contenido, 1);
        } else {
            $contenido = rtrim($contenido).PHP_EOL.$linea.PHP_EOL;
        }

        if (file_put_contents($env, $contenido) === false) {
            $this->error('No se pudo actualizar el archivo .env.');
            return self::FAILURE;
        }

        Artisan::call('config:clear');

        $this->info('JWT_SECRET generado correctamente.');
        $this->comment('No compartas ni subas el valor de JWT_SECRET al repositorio.');

        return self::SUCCESS;
    }
}
