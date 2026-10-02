<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Membresia;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            [
                'nombre' => 'Básico',
                'duracion_meses' => 1,
                'precio' => 79.00,
                'descripcion' => 'Acceso al gimnasio con credencial digital, rutina asignada, clases y control de asistencias.',
                'beneficios' => ['Acceso al gimnasio', 'Credencial digital con código de barras', 'Rutina asignada por entrenador', 'Clases y reservas', 'Historial de asistencias'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
            [
                'nombre' => 'Premium',
                'duracion_meses' => 1,
                'precio' => 129.00,
                'descripcion' => 'Incluye el acceso completo al gimnasio, reservas, rutina personalizada y seguimiento desde el portal.',
                'beneficios' => ['Todo lo incluido en Básico', 'Rutina personalizada', 'Reservas de clases', 'Progreso de entrenamientos', 'Calendario de actividades'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
            [
                'nombre' => 'Pro',
                'duracion_meses' => 1,
                'precio' => 179.00,
                'descripcion' => 'Experiencia completa del portal Mallqui Gym con historial, avisos, soporte y seguimiento de actividad.',
                'beneficios' => ['Todo lo incluido en Premium', 'Historial completo de actividad', 'Avisos de membresía y clases', 'Soporte desde la cuenta', 'Seguimiento de entrenador y rutina'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
        ] as $plan) {
            Membresia::updateOrCreate(['nombre' => $plan['nombre']], $plan);
        }

        foreach ([
            ['nombre_categoria' => 'Bebidas', 'descripcion' => 'Agua y bebidas para entrenamiento', 'estado' => 'Activo'],
            ['nombre_categoria' => 'Accesorios', 'descripcion' => 'Accesorios deportivos', 'estado' => 'Activo'],
            ['nombre_categoria' => 'Nutrición', 'descripcion' => 'Productos de nutrición deportiva', 'estado' => 'Activo'],
        ] as $categoria) {
            Categoria::updateOrCreate(['nombre_categoria' => $categoria['nombre_categoria']], $categoria);
        }

        $this->command?->info('Datos base de Mallqui Gym preparados. El administrador se crea con: php artisan admin:crear');
    }
}
