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
                'descripcion' => 'Acceso a sala de pesas, clases grupales y rutinas básicas.',
                'beneficios' => ['Acceso a sala de pesas', 'Clases grupales', 'Rutinas básicas'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
            [
                'nombre' => 'Premium',
                'duracion_meses' => 1,
                'precio' => 129.00,
                'descripcion' => 'Acceso total, clases ilimitadas, rutinas personalizadas y evaluación mensual.',
                'beneficios' => ['Acceso total al gimnasio', 'Clases ilimitadas', 'Rutinas personalizadas', 'Evaluación mensual'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
            [
                'nombre' => 'Pro',
                'duracion_meses' => 1,
                'precio' => 179.00,
                'descripcion' => 'Todo Premium, asesoría 1 a 1 y plan nutricional.',
                'beneficios' => ['Todo lo incluido en Premium', 'Asesoría personalizada 1 a 1', 'Plan nutricional'],
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
