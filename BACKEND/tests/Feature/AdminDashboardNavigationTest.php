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
            'reportes','reporte-asistencias',
            'usuarios','auditoria','configuracion',
        ];

        $this->assertCount(26, $secciones);

        foreach ($secciones as $seccion) {
            $this->assertStringContainsString(
                "cambiarSeccion('".$seccion."')",
                $source,
                'Falta acceso funcional a: '.$seccion
            );
        }
    }

    public function test_prioridades_abren_el_modulo_correcto(): void
    {
        $path = base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts');
        $source = (string) file_get_contents($path);

        $this->assertStringContainsString(
            "if(tipo==='rutinas'){ this.cambiarSeccion('rutinas'); return; }",
            $source
        );
        $this->assertStringContainsString(
            "if(tipo==='soporte'){ this.cambiarSeccion('soporte'); return; }",
            $source
        );
        $this->assertStringContainsString(
            "if(tipo==='pagos'){ this.cambiarSeccion('pagos'); return; }",
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
