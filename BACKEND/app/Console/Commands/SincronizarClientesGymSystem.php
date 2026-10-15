<?php

namespace App\Console\Commands;

use App\Services\GymSystemClienteMirror;
use Illuminate\Console\Command;
use Throwable;

class SincronizarClientesGymSystem extends Command
{
    protected $signature = 'gym:sincronizar-clientes';

    protected $description = 'Copia o actualiza en gym_system.socios los clientes que ya están registrados en el sistema';

    public function handle(GymSystemClienteMirror $mirror): int
    {
        try {
            $resultado = $mirror->sincronizarTodos();

            $this->info('Clientes sincronizados con gym_system correctamente.');
            $this->line('Nuevos en gym_system: '.$resultado['creados']);
            $this->line('Actualizados en gym_system: '.$resultado['actualizados']);
            $this->line('Total procesados: '.$resultado['total']);

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No se pudo sincronizar con gym_system: '.$e->getMessage());
            return self::FAILURE;
        }
    }
}
