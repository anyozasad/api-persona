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
            ['nombre' => 'Básico', 'duracion_meses' => 1, 'precio' => 79.00, 'descripcion' => 'Acceso general al gimnasio.', 'estado' => 'Activo'],
            ['nombre' => 'Premium', 'duracion_meses' => 1, 'precio' => 129.00, 'descripcion' => 'Acceso general y clases grupales.', 'estado' => 'Activo'],
            ['nombre' => 'Pro', 'duracion_meses' => 1, 'precio' => 179.00, 'descripcion' => 'Plan completo con seguimiento personalizado.', 'estado' => 'Activo'],
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
