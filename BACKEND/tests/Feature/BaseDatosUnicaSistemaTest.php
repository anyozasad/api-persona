<?php

namespace Tests\Feature;

use Tests\TestCase;

class BaseDatosUnicaSistemaTest extends TestCase
{
    public function test_estado_del_sistema_reporta_la_misma_base_principal(): void
    {
        $this->getJson('/api/estado-sistema')
            ->assertOk()
            ->assertJson([
                'api' => true,
                'database' => true,
                'base_datos' => config('database.connections.'.config('database.default').'.database'),
            ]);
    }

    public function test_no_existe_una_segunda_variable_de_base_para_el_sistema(): void
    {
        $archivos = [
            base_path('.env.example'),
            base_path('.env.testing'),
            base_path('routes/api.php'),
            app_path('Http/Controllers/PortalClienteController.php'),
            app_path('Http/Controllers/GymSystemAdminController.php'),
        ];

        foreach ($archivos as $archivo) {
            $contenido = (string) file_get_contents($archivo);
            $this->assertStringNotContainsString('GYM_DB_DATABASE', $contenido, $archivo);
            $this->assertStringNotContainsString('gym_system_actions', $contenido, $archivo);
        }
    }

    public function test_inventario_del_frontend_usa_las_rutas_de_la_base_principal(): void
    {
        $producto = base_path('../FRONTEND/suma-angular/src/app/core/services/producto.service.ts');
        $categoria = base_path('../FRONTEND/suma-angular/src/app/core/services/categoria.service.ts');

        $productoSource = (string) file_get_contents($producto);
        $categoriaSource = (string) file_get_contents($categoria);

        $this->assertStringContainsString("'/api/productos'", $productoSource);
        $this->assertStringNotContainsString("'/api/gym-admin/productos'", $productoSource);

        $this->assertStringContainsString("'/api/categorias'", $categoriaSource);
        $this->assertStringNotContainsString("'/api/gym-admin/categorias'", $categoriaSource);
    }
}
