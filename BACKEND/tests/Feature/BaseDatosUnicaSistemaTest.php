<?php

namespace Tests\Feature;

use Tests\TestCase;

class BaseDatosUnicaSistemaTest extends TestCase
{
    public function test_interfaz_conserva_sus_datos_y_tiene_espejo_en_gym_system(): void
    {
        $adminApi = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-api.service.ts'));
        $mirror = (string) file_get_contents(app_path('Services/GymSystemDataMirror.php'));
        $middleware = (string) file_get_contents(app_path('Http/Middleware/SyncGymSystemMirror.php'));
        $command = (string) file_get_contents(app_path('Console/Commands/SincronizarTodoGymSystem.php'));

        $this->assertStringContainsString("'/api/clientes'", $adminApi);
        $this->assertStringContainsString("'/api/membresias'", $adminApi);
        $this->assertStringContainsString("'/api/asistencias'", $adminApi);
        $this->assertStringContainsString("'/api/productos'", $adminApi);
        $this->assertStringContainsString("'/api/ventas'", $adminApi);

        $this->assertStringContainsString("env('GYM_DB_DATABASE', 'gym_system')", $mirror);
        $this->assertStringContainsString("'app_'.\$tabla", $mirror);
        $this->assertStringContainsString('sincronizarSilencioso', $middleware);
        $this->assertStringContainsString('gym:sincronizar-todo', $command);
    }

    public function test_clientes_siguen_reflejandose_en_socios(): void
    {
        $clienteController = (string) file_get_contents(app_path('Http/Controllers/ClienteController.php'));
        $clienteMirror = (string) file_get_contents(app_path('Services/GymSystemClienteMirror.php'));

        $this->assertStringContainsString('GymSystemClienteMirror', $clienteController);
        $this->assertStringContainsString("table('socios')", $clienteMirror);
    }
}
