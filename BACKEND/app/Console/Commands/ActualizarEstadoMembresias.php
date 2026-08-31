<?php

namespace App\Console\Commands;

use App\Models\ClienteMembresia;
use Illuminate\Console\Command;

class ActualizarEstadoMembresias extends Command
{
    protected $signature = 'membresias:actualizar-estados';

    protected $description = 'Marca como vencidas las membresias cuya fecha final ya paso';

    public function handle(): int
    {
        $cantidad = ClienteMembresia::query()
            ->where('estado', 'Activo')
            ->whereDate('fecha_fin', '<', today())
            ->update(['estado' => 'Vencido']);

        $this->info("Membresías actualizadas: {$cantidad}");

        return self::SUCCESS;
    }
}
