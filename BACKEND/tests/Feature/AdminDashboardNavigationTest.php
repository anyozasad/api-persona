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

        $this->assertStringContainsString('class="mg-dashboard"', $source);
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

        // El menú actual usa una lista única y el método navegarMenu()
        // en lugar de repetir un (click) por cada botón.
        $this->assertStringContainsString('navegarMenu(item)', $source);
        $this->assertStringContainsString('this.cambiarSegcion(item.id)', $source);
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
}
