<?php

namespace Tests\Feature;

use Tests\TestCase;

class DashboardAdmin20FuncionesTest extends TestCase
{
    public function test_el_dashboard_integra_veinte_mejoras_funcionales_reales(): void
    {
        $path = base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-dashboard-tools.component.ts');
        $portal = base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-integrado.component.ts');
        $spec = base_path('../FRONTEND/suma-angular/src/app/component/pages/admin/admin-dashboard-tools.component.spec.ts');

        $this->assertFileExists($path);
        $this->assertFileExists($spec);

        $source = (string) file_get_contents($path);
        $funciones = [
            'ventaPromedioHoy(',
            'margenUtilidad(',
            'variacionIngresos(',
            'etiquetaVariacionIngresos(',
            'porcentajeIngresoMembresias(',
            'porcentajeIngresoProductos(',
            'promedioAsistenciasSemana(',
            'diaPicoAsistencia(',
            'prioridadesFiltradas(',
            'limpiarFiltroPrioridades(',
            'actividadFiltrada(',
            'limpiarFiltroActividad(',
            'totalPendientesCalculado(',
            'datosConsistentes(',
            'nivelRiesgoOperativo(',
            'puntajeOperativo(',
            'copiarResumenEjecutivo(',
            'exportarPrioridadesCsv(',
            'exportarActividadCsv(',
            'abrirDestinoActividad(',
        ];

        $this->assertCount(20, $funciones);
        foreach ($funciones as $funcion) {
            $this->assertStringContainsString($funcion, $source, 'Falta la función: '.$funcion);
        }

        $portalSource = (string) file_get_contents($portal);
        $this->assertStringContainsString('<app-admin-dashboard-tools', $portalSource);
        $this->assertStringContainsString('[dashboard]="dashboard"', $portalSource);
        $this->assertStringContainsString('(irSeccion)="cambiarSeccion($event)"', $portalSource);

        $specSource = (string) file_get_contents($spec);
        $this->assertStringContainsString("describe('AdminDashboardToolsComponent'", $specSource);
        $this->assertStringContainsString("tolera dashboard vacio sin romper la interfaz", $specSource);
    }
}
