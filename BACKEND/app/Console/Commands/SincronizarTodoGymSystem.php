<?php

namespace App\Console\Commands;

use App\Services\GymSystemDataMirror;
use Illuminate\Console\Command;
use Throwable;

class SincronizarTodoGymSystem extends Command
{
    protected $signature = 'gym:sincronizar-todo';

    protected $description = 'Sincroniza todos los datos actuales del sistema dentro de la base gym_system';

    public function handle(GymSystemDataMirror $mirror): int
    {
        try {
            $resultado = $mirror->sincronizarTodo();

            if (!empty($resultado['omitido'])) {
                $this->warn($resultado['motivo'] ?? 'Sincronización omitida.');
                return self::SUCCESS;
            }

            $this->info('Sincronización completa con gym_system finalizada.');
            $this->line('Origen: '.($resultado['origen'] ?? '-'));
            $this->line('Destino: '.($resultado['destino'] ?? '-'));

            foreach (($resultado['tablas'] ?? []) as $origen => $dato) {
                $this->line(sprintf(
                    '%s -> %s: %d registro(s)',
                    $origen,
                    $dato['tabla'] ?? '-',
                    (int) ($dato['registros'] ?? 0)
                ));
            }

            if (isset($resultado['socios']['total'])) {
                $this->line('Clientes reflejados en socios: '.$resultado['socios']['total']);
            }

            $this->info('Los datos originales no fueron eliminados.');
            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No se pudo completar la sincronización: '.$e->getMessage());
            return self::FAILURE;
        }
    }
}
