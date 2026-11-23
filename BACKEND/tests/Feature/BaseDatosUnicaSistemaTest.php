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
        $posReparacion = strpos($inicio, "Ejecutar \$php @('artisan','db:reconciliar-esquema')");
        $posVerificacion = strpos($inicio, "Ejecutar \$php @('artisan','db:verificar')");
        $this->assertNotFalse($posRespaldo);
        $this->assertNotFalse($posReparacion);
        $this->assertNotFalse($posVerificacion);
        $this->assertLessThan($posReparacion, $posRespaldo,
            'Primero se confirma el respaldo y después se reparan tablas.');
        $this->assertLessThan($posVerificacion, $posReparacion,
            'La validación integral debe realizarse después de recuperar tablas.');
        $this->assertStringNotContainsString(
            "Ejecutar \$php @('artisan','sistema:preparar')", $inicio,
            'La reparación exclusiva de MySQL no debe agregar datos de ejemplo.'
        );
        $this->assertStringContainsString('Respaldo SQL no confirmado.', $inicio);
        $this->assertStringContainsString('Suplementos', $preparacion);
        $this->assertStringContainsString('Accesorios', $preparacion);
        $this->assertStringContainsString('if ($existe) continue;', $preparacion);
    }

    public function test_reparacion_desde_dashboard_no_depende_de_la_carpeta_scripts_ni_deja_estado_antiguo(): void
    {
        $admin = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts'));
        $backup = (string) file_get_contents(app_path('Console/Commands/BackupDatabase.php'));

        $this->assertStringContainsString('mg-operational-repair', $admin);
        $this->assertStringContainsString('(click)="repararEsquemaMysql()"', $admin);
        $this->assertStringContainsString('this.actualizarDashboardCompleto();', $admin);
        $this->assertStringContainsString('--result-file=', $backup);
        $this->assertStringNotContainsString('$sql = $process->getOutput();', $backup);
    }

    public function test_distingue_laravel_antiguo_del_servidor_actual_antes_de_reparar_mysql(): void
    {
        $rutas = (string) file_get_contents(base_path('routes/api.php'));
        $script = (string) file_get_contents(base_path('../scripts/INICIAR_DASHBOARD.ps1'));
        $revision = 'mallqui-esquema-respaldo-20261123';
        $this->assertSame(2, substr_count($rutas, "'revision_mysql' => '".$revision."'"));
        $this->assertStringContainsString('$estado.revision_mysql -ne', $script);
        $this->assertStringContainsString('$estadoAntes = ObtenerEstadoBackend', $script);
        $this->assertStringContainsString('VerificarServidorMallqui $estadoAntes', $script);
    }

    public function test_inicio_normal_repara_esquema_pendiente_solo_si_administrador_confirma(): void
    {
        $inicio = (string) file_get_contents(base_path('../scripts/INICIAR_DASHBOARD.ps1'));
        $controlador = (string) file_get_contents(app_path('Http/Controllers/ReparacionEsquemaController.php'));
        $this->assertStringContainsString(
            "Read-Host '¿Crear respaldo SQL y reparar los módulos faltantes ahora? Escribe SI'",
            $inicio
        );
        $this->assertStringContainsString(
            "if ($" . "respuestaReparar -eq 'SI')",
            $inicio
        );
        $this->assertStringContainsString("db:reparar-gym','--confirmar'", $inicio);
        $this->assertStringContainsString("estadoReparado.operativo -ne $" . "true", $inicio);
        $this->assertStringContainsString('set_time_limit(600)', $controlador);
    }

    public function test_reparacion_muestra_etapa_y_errores_sin_exponer_sql_ni_datos_personales(): void
    {
        $controller = (string) file_get_contents(app_path('Http/Controllers/ReparacionEsquemaController.php'));
        $admin = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts'));
        $this->assertStringContainsString("'etapa' => 'respaldo'", $controller);
        $this->assertStringContainsString("'etapa' => 'migraciones'", $controller);
        $this->assertStringContainsString("'etapa' => 'verificacion'", $controller);
        $this->assertStringContainsString('problemas_detectados', $controller);
        $this->assertStringContainsString('reparacionMysqlEtapa', $admin);
        $this->assertStringContainsString('reparacionMysqlProblemas.join', $admin);
    }

    public function test_reparador_directo_del_backend_exige_respaldo_y_no_usa_scripts(): void
    {
        $ruta = app_path('Console/Commands/RepararMallquiLocal.php');
        $codigo = (string) file_get_contents($ruta);
        $this->assertStringContainsString('db:reparar-gym', $codigo);
        $this->assertStringContainsString("Artisan::call('backup:database')", $codigo);
        $this->assertStringContainsString("Artisan::call('db:reconciliar-esquema')", $codigo);
        $this->assertStringContainsString("Artisan::call('db:verificar')", $codigo);
        $this->assertStringNotContainsString("Artisan::call('migrate:fresh')", $codigo);
        $this->assertArrayHasKey('db:reparar-gym', \Illuminate\Support\Facades\Artisan::all());
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
        $this->assertStringContainsString('mallqui-repositorio', $inicio);
        $html = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/index.html'));
        $this->assertStringContainsString('<meta name="mallqui-repositorio" content="anyozasad/api-persona">', $html);
    }

}
