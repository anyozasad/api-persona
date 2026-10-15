<?php

namespace Tests\Feature;

use Tests\TestCase;

class BaseDatosUnicaSistemaTest extends TestCase
{
    public function test_clientes_registrados_se_mantienen_en_la_interfaz_y_se_sincronizan_a_gym_system(): void
    {
        $adminApi = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-api.service.ts'));
        $clienteController = (string) file_get_contents(app_path('Http/Controllers/ClienteController.php'));
        $mirror = (string) file_get_contents(app_path('Services/GymSystemClienteMirror.php'));
        $command = (string) file_get_contents(app_path('Console/Commands/SincronizarClientesGymSystem.php'));

        $this->assertStringContainsString("'/api/clientes'", $adminApi);
        $this->assertStringContainsString('GymSystemClienteMirror', $clienteController);
        $this->assertStringContainsString("env('GYM_DB_DATABASE', 'gym_system')", $mirror);
        $this->assertStringContainsString("table('socios')", $mirror);
        $this->assertStringContainsString('gym:sincronizar-clientes', $command);
    }

    public function test_inventario_sigue_apuntando_a_gym_system_real(): void
    {
        $producto = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/core/services/producto.service.ts'));
        $categoria = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/core/services/categoria.service.ts'));

        $this->assertStringContainsString("'/api/gym-admin/productos'", $producto);
        $this->assertStringContainsString("'/api/gym-admin/categorias'", $categoria);
    }
}
