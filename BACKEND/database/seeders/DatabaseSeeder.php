<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\ConfiguracionSistema;
use App\Models\Membresia;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Membresia::whereIn('nombre', ['Básico', 'Premium', 'Pro'])
            ->update(['estado' => 'Inactivo']);

        foreach ([
            [
                'nombre' => 'Mensualidad 1 mes',
                'duracion_meses' => 1,
                'precio' => 80.00,
                'descripcion' => 'Mensualidad individual de Mallqui Gym.',
                'beneficios' => ['Acceso al gimnasio durante 1 mes', 'Guía e instrucciones a cargo del personal del gym', 'Credencial digital', 'Rutina y control de asistencias'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
            [
                'nombre' => 'Promoción 2 meses',
                'duracion_meses' => 2,
                'precio' => 120.00,
                'descripcion' => 'Promoción por dos meses de entrenamiento en Mallqui Gym.',
                'beneficios' => ['Acceso al gimnasio durante 2 meses', 'Guía e instrucciones a cargo del personal del gym', 'Credencial digital', 'Rutina y control de asistencias'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
            [
                'nombre' => 'Promoción 3 meses',
                'duracion_meses' => 3,
                'precio' => 150.00,
                'descripcion' => 'Promoción por tres meses de entrenamiento en Mallqui Gym.',
                'beneficios' => ['Acceso al gimnasio durante 3 meses', 'Guía e instrucciones a cargo del personal del gym', 'Credencial digital', 'Rutina y control de asistencias'],
                'permite_reservas' => true,
                'estado' => 'Activo',
            ],
        ] as $membresia) {
            Membresia::updateOrCreate(['nombre' => $membresia['nombre']], $membresia);
        }

        ConfiguracionSistema::updateOrCreate(
            ['id' => 1],
            [
                'nombre_gimnasio' => 'Mallqui Gym',
                'telefono' => '939398148',
                'direccion' => 'Jr. Los Laureles Mz 17 Lt 18',
                'referencia' => 'Referencia: Plaza de Laura Bosso',
                'frase_publicitaria' => 'Ven, entrena con Mallqui Gym con el propósito de tener una vida saludable.',
                'horario_detalle' => 'Lunes a viernes: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 9:30 p. m. | Sábado: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 8:30 p. m. | Domingo: atención hasta el mediodía.',
                'tarifa_diaria' => 6.00,
                'mensaje_productos' => 'Bebidas y productos para consumo disponibles en recepción.',
                'hora_apertura' => '06:00:00',
                'hora_cierre' => '21:30:00',
                'dias_atencion' => ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
            ]
        );

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
