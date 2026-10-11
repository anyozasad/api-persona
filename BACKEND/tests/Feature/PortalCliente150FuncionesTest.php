<?php

namespace Tests\Feature;

use App\Services\PortalClienteFunctionVerifier;
use Tests\TestCase;

class PortalCliente150FuncionesTest extends TestCase
{
    public function test_el_portal_cliente_tiene_exactamente_ciento_cincuenta_funciones_definidas(): void
    {
        $items = config('portal_cliente_funciones', []);

        $this->assertCount(150, $items);
        $this->assertSame(range(1, 150), array_column($items, 'id'));
    }

    public function test_las_ciento_cincuenta_funciones_tienen_evidencia_funcional(): void
    {
        $report = app(PortalClienteFunctionVerifier::class)->verifyAll();

        $failed = collect($report['results'])
            ->where('passed', false)
            ->map(fn ($item) => $item['id'].' '.$item['name'])
            ->values()
            ->all();

        $this->assertSame(150, $report['total']);
        $this->assertSame(0, $report['failed'], 'Fallaron: '.implode(', ', $failed));
        $this->assertSame(150, $report['passed']);
    }

    public function test_la_navegacion_del_cliente_no_depende_de_un_boton_mas(): void
    {
        $path = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts');
        $source = (string) file_get_contents($path);

        $this->assertStringNotContainsString('>Más</button>', $source);
        $this->assertStringNotContainsString('<span>Más</span>', $source);
        $this->assertStringContainsString('<span>Cuenta</span>', $source);
        foreach (['progreso','calendario','reservas','asistencias','club','avisos','soporte','perfil'] as $modulo) {
            $this->assertStringContainsString("abrirModulo('".$modulo."')", $source);
        }
    }

    public function test_las_cincuenta_funciones_nuevas_son_visibles_y_tienen_pruebas_frontend(): void
    {
        $tools = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/cliente-herramientas.component.ts');
        $spec = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/cliente-herramientas.component.spec.ts');
        $portal = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts');

        $this->assertFileExists($tools);
        $this->assertFileExists($spec);

        $source = (string) file_get_contents($tools);
        foreach (['101-110','111-120','121-130','131-140','141-150'] as $grupo) {
            $this->assertStringContainsString('data-capability-group="'.$grupo.'"', $source);
        }

        $portalSource = (string) file_get_contents($portal);
        $this->assertStringContainsString('<app-cliente-herramientas', $portalSource);
        $this->assertStringContainsString('[clases]="clases"', $portalSource);
        $this->assertStringContainsString('[reservas]="reservas"', $portalSource);
        $this->assertStringContainsString('[asistencias]="asistencias"', $portalSource);
        $this->assertStringContainsString('[pagos]="pagos"', $portalSource);
        $this->assertStringContainsString('[perfil]="perfil"', $portalSource);

        $specSource = (string) file_get_contents($spec);
        $this->assertStringContainsString("describe('ClienteHerramientasComponent'", $specSource);
        $this->assertStringContainsString("c.copiarDni()", $specSource);
        $this->assertStringContainsString("c.exportarReservasCsv()", $specSource);
        $this->assertStringContainsString("c.exportarAsistenciasCsv()", $specSource);
        $this->assertStringContainsString("c.exportarPagosCsv()", $specSource);
        $this->assertStringContainsString("c.exportarResumenCuenta()", $specSource);
    }
}
