<?php

namespace App\Console\Commands;

use App\Services\PortalClienteFunctionVerifier;
use Illuminate\Console\Command;

class VerificarFuncionesPortalCliente extends Command
{
    protected $signature = 'mallqui:cliente-funciones {--fallos : Mostrar solamente las funciones que fallan}';
    protected $description = 'Comprueba las 150 capacidades funcionales del portal del cliente';

    public function handle(PortalClienteFunctionVerifier $verifier): int
    {
        $report = $verifier->verifyAll();

        $this->info('Portal del cliente');
        $this->line('Total definidas: '.$report['total']);
        $this->line('Aprobadas: '.$report['passed']);
        $this->line('Fallidas: '.$report['failed']);

        foreach ($report['results'] as $item) {
            if ($this->option('fallos') && $item['passed']) {
                continue;
            }

            $status = $item['passed'] ? 'OK' : 'FALLO';
            $this->line(sprintf('%03d [%s] %s - %s', $item['id'], $status, $item['area'], $item['name']));
        }

        if ($report['total'] !== 150) {
            $this->error('El portal debe tener exactamente 150 capacidades definidas.');
            return self::FAILURE;
        }

        if ($report['failed'] > 0) {
            $this->error('Hay capacidades que necesitan corrección.');
            return self::FAILURE;
        }

        $this->info('150/150 FUNCIONES DEL PORTAL DEL CLIENTE VERIFICADAS CORRECTAMENTE.');
        return self::SUCCESS;
    }
}
