<?php

namespace App\Console\Commands;

use App\Services\SprintVerifier;
use Illuminate\Console\Command;

class VerificarSprintsMallqui extends Command
{
    protected $signature = 'mallqui:sprints {--fallos : Mostrar solamente los sprints que fallan}';

    protected $description = 'Verifica los 100 sprints funcionales de Mallqui Gym contra rutas, archivos y pruebas reales.';

    public function handle(SprintVerifier $verifier): int
    {
        $resultado = $verifier->verifyAll();
        $soloFallos = (bool) $this->option('fallos');

        $this->newLine();
        $this->info('MALLQUI GYM · VERIFICACIÓN DE SPRINTS');
        $this->line('Total definidos: '.$resultado['total']);
        $this->line('Aprobados: '.$resultado['passed']);
        $this->line('Fallidos: '.$resultado['failed']);
        $this->newLine();

        foreach ($resultado['results'] as $sprint) {
            if ($soloFallos && $sprint['passed']) {
                continue;
            }

            $estado = $sprint['passed'] ? '<fg=green>OK</>' : '<fg=red>FALLO</>';
            $this->line(sprintf(
                '%s Sprint %03d · %s [%s]',
                $estado,
                $sprint['id'],
                $sprint['name'],
                $sprint['module']
            ));

            if (!$sprint['passed']) {
                foreach ($sprint['checks'] as $check) {
                    if (!$check['passed']) {
                        $this->line('   - '.$check['label']);
                    }
                }
            }
        }

        $this->newLine();

        if ($resultado['total'] !== 100) {
            $this->error('La definición debe contener exactamente 100 sprints.');
            return self::FAILURE;
        }

        if ($resultado['failed'] > 0) {
            $this->error('Todavía existen sprints sin evidencia funcional.');
            return self::FAILURE;
        }

        $this->info('100/100 SPRINTS VERIFICADOS CORRECTAMENTE.');
        return self::SUCCESS;
    }
}
