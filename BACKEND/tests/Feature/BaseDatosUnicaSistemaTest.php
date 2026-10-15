<?php

namespace Tests\Feature;

use Tests\TestCase;

class BaseDatosUnicaSistemaTest extends TestCase
{
    public function test_gym_system_puede_ser_la_base_principal_sin_borrar_tablas_legacy(): void
    {
        $database = (string) file_get_contents(config_path('database.php'));
        $env = (string) file_get_contents(base_path('.env.example'));
        $mirror = (string) file_get_contents(app_path('Services/GymSystemDataMirror.php'));
        $switch = (string) file_get_contents(app_path('Console/Commands/UsarGymSystemComoPrincipal.php'));

        $this->assertStringContainsString("env('DB_TABLE_PREFIX', '')", $database);
        $this->assertStringContainsString('DB_DATABASE=gym_system', $env);
        $this->assertStringContainsString('DB_TABLE_PREFIX=app_', $env);
        $this->assertStringContainsString('GYM_DB_DATABASE=gym_system', $env);

        $this->assertStringContainsString("'prefix' => ''", $mirror);
        $this->assertStringContainsString("'modo' => 'gym_system_principal'", $mirror);
        $this->assertStringContainsString('gym:usar-gym-system', $switch);
        $this->assertStringContainsString('app_clientes', $switch);
        $this->assertStringContainsString('app_usuarios', $switch);
        $this->assertStringContainsString('NO fueron eliminadas', $switch);
    }

    public function test_interfaz_conserva_rutas_normales_y_refleja_socios_legacy(): void
    {
        $adminApi = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-api.service.ts'));
        $clienteController = (string) file_get_contents(app_path('Http/Controllers/ClienteController.php'));
        $clienteMirror = (string) file_get_contents(app_path('Services/GymSystemClienteMirror.php'));

        $this->assertStringContainsString("'/api/clientes'", $adminApi);
        $this->assertStringContainsString("'/api/membresias'", $adminApi);
        $this->assertStringContainsString("'/api/asistencias'", $adminApi);
        $this->assertStringContainsString("'/api/productos'", $adminApi);
        $this->assertStringContainsString("'/api/ventas'", $adminApi);

        $this->assertStringContainsString('GymSystemClienteMirror', $clienteController);
        $this->assertStringContainsString("table('socios')", $clienteMirror);
        $this->assertStringContainsString("'prefix' => ''", $clienteMirror);
    }
}
