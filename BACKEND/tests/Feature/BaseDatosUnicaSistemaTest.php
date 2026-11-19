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

        $this->assertStringContainsString("'prefix' => ''", $database);
        $this->assertStringContainsString('DB_DATABASE=gym_system', $env);
        $this->assertStringContainsString('DB_TABLE_PREFIX=', $env);
        $this->assertStringNotContainsString('DB_TABLE_PREFIX=app_', $env);

        $this->assertStringContainsString("'prefix' => ''", $mirror);
        $this->assertStringContainsString("'modo' => 'gym_system_principal'", $mirror);
        $this->assertStringContainsString('gym:usar-gym-system', $switch);
        $this->assertStringContainsString('app_clientes', $switch);
        $this->assertStringContainsString('app_usuarios', $switch);
        $this->assertStringContainsString('NO fueron eliminadas', $switch);
    }

    public function test_preparacion_de_mysql_exige_respaldo_previo_y_conserva_categorias_reales(): void
    {
        $inicio = (string) file_get_contents(base_path('../scripts/INICIAR_DASHBOARD.ps1'));
        $preparacion = (string) file_get_contents(app_path('Console/Commands/PrepararMallquiSistema.php'));

        $posRespaldo = strpos($inicio, "Ejecutar \$php @('artisan','backup:database')");
        $posPreparacion = strpos($inicio, "Ejecutar \$php @('artisan','sistema:preparar')");
        $this->assertNotFalse($posRespaldo);
        $this->assertNotFalse($posPreparacion);
        $this->assertLessThan($posPreparacion, $posRespaldo,
            'Primero se confirma el respaldo, después se preparan tablas.');
        $this->assertStringContainsString('Respaldo SQL no confirmado.', $inicio);
        $this->assertStringContainsString('Suplementos', $preparacion);
        $this->assertStringContainsString('Accesorios', $preparacion);
        $this->assertStringContainsString('if ($existe) continue;', $preparacion);
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
    public function test_el_iniciador_verifica_el_proyecto_y_no_acepta_otro_dashboard_en_los_puertos(): void
    {
        $response = $this->getJson('/api/estado-sistema');
        $this->assertContains($response->status(), [200, 503]);
        $response->assertJsonPath('sistema', 'Mallqui Gym');

        $inicio = (string) file_get_contents(base_path('../scripts/INICIAR_DASHBOARD.ps1'));
        $this->assertStringContainsString('function VerificarServidorMallqui', $inicio);
        $this->assertStringContainsString('function VerificarFrontendMallqui', $inicio);
        $this->assertStringContainsString("VerificarServidorMallqui \$estadoServidor", $inicio);
        $this->assertStringContainsString("VerificarFrontendMallqui \$paginaYaAbierta", $inicio);
        $this->assertStringContainsString('PHP_VERSION_ID', $inicio);
    }

}
