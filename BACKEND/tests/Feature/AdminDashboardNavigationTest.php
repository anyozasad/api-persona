<?php

namespace Tests\Feature;

use Tests\TestCase;

class AdminDashboardNavigationTest extends TestCase
{
    public function test_dashboard_profesional_conecta_todas_las_areas_administrativas(): void
    {
        $path = base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts');
        $this->assertFileExists($path);

        $source = (string) file_get_contents($path);

        $this->assertStringContainsString('class="mg-dashboard mg-efsrt-dashboard"', $source);
        $this->assertStringNotContainsString('class="wixdash-page"', $source);
        $this->assertStringContainsString('buscarEnPanel(): void', $source);
        $this->assertStringContainsString('<app-admin-dashboard-tools', $source);

        $secciones = [
            'clientes','membresias','pagos','asistencias','planes',
            'clases','reservas','rutinas','entrenador',
            'caja','ventas','historial-ventas','gastos',
            'inventario','compras','proveedores','kardex','categorias',
            'soporte','opiniones','comunicacion',
            'reportes-admin','reporte-asistencias',
            'usuarios','auditoria','configuracion',
        ];

        $this->assertCount(26, $secciones);

        // El menú muestra seis áreas claras; las tareas permanecen dentro
        // de su área sin desplegables repetidos en la barra lateral.
        $inicio = strpos($source, '<nav class="admin-main-nav mg-clear-navigation mg-focus-sidebar"');
        $this->assertNotFalse($inicio);
        $fin = strpos($source, '</nav>', $inicio);
        $this->assertNotFalse($fin);
        $menu = substr($source, $inicio, $fin - $inicio);
        $this->assertStringContainsString('*ngFor="let area of areasPanelAdmin"', $menu);
        $this->assertStringContainsString('(click)="abrirAreaPrincipalAdmin(area.id)"', $menu);
        $this->assertStringNotContainsString('mg-simple-group', $menu);
        $this->assertStringNotContainsString('Otras funciones', $menu);
        $this->assertStringContainsString('readonly areasPanelAdmin:', $source);
        $this->assertStringContainsString('class="mg-focus-task-tabs"', $source);
        $this->assertStringContainsString('(click)="cambiarSegcion(tarea.id)"', $source);
        foreach ($secciones as $seccion) {
            $this->assertStringContainsString(
                "id:'".$seccion."'",
                $source,
                'El menú no incluye el acceso funcional a: '.$seccion
            );
        }
        $this->assertStringContainsString('class="client-editor-workspace"', $source);
        $this->assertStringNotContainsString('class="client-editor-backdrop"', $source);
        $this->assertStringContainsString('admin-claridad.css', $source);
        $this->assertStringContainsString('admin-efsrt-simplificado.css', $source);
        $this->assertStringNotContainsString('Todas las funciones', $source);
        $this->assertStringNotContainsString("id:'apps'", $source);
        $this->assertStringContainsString("id:'socios',nombre:'Socios'", $source);
        $this->assertStringContainsString("id:'entrenamiento',nombre:'Clases y reservas'", $source);
        $this->assertStringContainsString("id:'inventario',nombre:'Productos'", $source);
        $this->assertStringContainsString("id:'ventas',nombre:'Ventas y caja'", $source);
        $this->assertStringContainsString("id:'atencion',nombre:'Atención al socio'", $source);
        $this->assertStringContainsString("id:'administracion',nombre:'Administración'", $source);
        $this->assertStringContainsString("id:'verificacion-efsrt'", $source);
        $this->assertStringContainsString('mostrarGraficosDashboard', $source);
        $this->assertStringNotContainsString('class="mg-module-tabs"', $source);

    }

    public function test_prioridades_abren_el_modulo_correcto(): void
    {
        $path = base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts');
        $source = (string) file_get_contents($path);

        $this->assertStringContainsString(
            "if(tipo==='rutinas'){ this.cambiarSegcion('rutinas'); return; }",
            $source
        );
        $this->assertStringContainsString(
            "if(tipo==='soporte'){ this.cambiarSegcion('soporte'); return; }",
            $source
        );
        $this->assertStringContainsString(
            "if(tipo==='pagos'){ this.cambiarSegcion('pagos'); return; }",
            $source
        );
    }

    public function test_dashboard_backend_tolera_esquemas_legacy_de_ventas(): void
    {
        $path = base_path('app/Http/Controllers/DashboardController.php');
        $source = (string) file_get_contents($path);

        $this->assertStringContainsString("'app_detalle_venta'", $source);
        $this->assertStringContainsString("'cantidad_producto'", $source);
        $this->assertStringContainsString(
            'Un esquema legacy de detalle de venta no debe bloquear todo el dashboard.',
            $source
        );
    }

    public function test_el_dashboard_conserva_la_paleta_anterior(): void
    {
        $paleta = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/styles/admin-mallqui-original-palette.css'));
        $panel = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts'));

        $this->assertStringContainsString('--mg-mantis-accent:#a6d842;', $paleta);
        $this->assertStringContainsString("acentoDashboard: 'coral'|'azul'|'verde' = 'verde';", $panel);
        $this->assertStringContainsString("this.guardarAparienciaMantis('color','verde');", $panel);
        $this->assertStringNotContainsString("'./styles/admin-paleta-portada.css'", $panel);
        $this->assertStringContainsString("mallqui_paleta_verde_restaurada_20261123", $panel);
    }

}
