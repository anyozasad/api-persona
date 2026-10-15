<?php

namespace Tests\Feature;

use Tests\TestCase;

class BaseDatosUnicaSistemaTest extends TestCase
{
    public function test_dashboard_administrativo_usa_la_base_gym_system_configurada(): void
    {
        $dashboard = (string) file_get_contents(app_path('Http/Controllers/DashboardController.php'));
        $legacy = (string) file_get_contents(app_path('Http/Controllers/GymSystemAdminController.php'));

        $this->assertStringContainsString("env('GYM_DB_DATABASE', 'gym_system')", $dashboard);
        $this->assertStringContainsString("env('GYM_DB_DATABASE', 'gym_system')", $legacy);
        $this->assertStringContainsString("DB::connection('dashboard_gym_system')", $dashboard);
        $this->assertStringContainsString("DB::connection('gym_system_actions')", $legacy);
    }

    public function test_clientes_e_inventario_del_dashboard_usan_rutas_gym_admin(): void
    {
        $adminApi = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-api.service.ts'));
        $producto = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/core/services/producto.service.ts'));
        $categoria = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/core/services/categoria.service.ts'));

        $this->assertStringContainsString("'/api/gym-admin/socios'", $adminApi);
        $this->assertStringContainsString("'/api/gym-admin/planes'", $adminApi);
        $this->assertStringContainsString("'/api/gym-admin/asistencias'", $adminApi);
        $this->assertStringContainsString("'/api/gym-admin/productos'", $adminApi);
        $this->assertStringContainsString("'/api/gym-admin/ventas'", $adminApi);
        $this->assertStringContainsString("'/api/gym-admin/caja/actual'", $adminApi);

        $this->assertStringContainsString("'/api/gym-admin/productos'", $producto);
        $this->assertStringContainsString("'/api/gym-admin/categorias'", $categoria);
    }
}
