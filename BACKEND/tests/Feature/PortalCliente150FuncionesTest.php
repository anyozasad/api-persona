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

    public function test_las_cincuenta_mejoras_nuevas_tienen_pruebas_frontend(): void
    {
        $quality = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/portal-cliente-quality.ts');
        $spec = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/portal-cliente-quality.spec.ts');

        $this->assertFileExists($quality);
        $this->assertFileExists($spec);
        $source = (string) file_get_contents($quality);
        preg_match_all('/export function\\s+[A-Za-z0-9_]+/', $source, $matches);
        $this->assertCount(50, $matches[0]);
        $this->assertStringContainsString("describe('calidad funcional del portal cliente'", (string) file_get_contents($spec));
    }
}
