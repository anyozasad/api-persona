<?php

namespace Tests\Feature;

use App\Services\PortalClienteFunctionVerifier;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PortalCliente150FuncionesTest extends TestCase
{
    /**
     * Un caso por capacidad, identificable por su número en el resultado
     * PHPUnit. Alcance: contrato estructural; no es un sprint de aceptación.
     */
    public static function capacidadesDeclaradas(): iterable
    {
        $catalogo = require dirname(__DIR__, 2).'/config/portal_cliente_funciones.php';
        foreach ($catalogo as $item) {
            yield sprintf('%03d - %s', $item['id'], $item['name']) => [$item];
        }
    }

    #[DataProvider('capacidadesDeclaradas')]
    public function test_cada_una_de_las_150_capacidades_tiene_evidencia_estructural_individual(array $item): void
    {
        $this->assertIsInt($item['id']);
        $this->assertNotEmpty(trim((string) $item['name']));
        $this->assertNotEmpty(trim((string) $item['area']));
        $this->assertNotEmpty($item['checks']);
        $resultado = app(PortalClienteFunctionVerifier::class)->verifyOne($item);
        $fallos = array_filter($resultado['checks'], fn ($check) => !$check['passed']);
        $this->assertTrue(
            $resultado['passed'],
            'Capacidad '.sprintf('%03d', $item['id']).' - '.$item['name'].': '.json_encode($fallos)
        );
    }

    public function test_el_catalogo_distingue_las_52_rutas_de_las_98_referencias_de_interfaz(): void
    {
        $reporte = app(PortalClienteFunctionVerifier::class)->verifyAll();
        $this->assertSame(150, $reporte['total']);
        $this->assertSame(52, $reporte['route_checks']);
        $this->assertSame(98, $reporte['file_checks']);

        $invalida = app(PortalClienteFunctionVerifier::class)->verifyOne([
            'id' => 151, 'name' => 'Ruta inválida', 'area' => 'Prueba',
            'checks' => [['type' => 'route', 'method' => 'GET', 'uri' => 'auth/login']],
        ]);
        $this->assertFalse($invalida['passed'], 'Una ruta POST no debe contarse como GET.');
    }

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
