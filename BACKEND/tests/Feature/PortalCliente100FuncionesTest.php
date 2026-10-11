<?php

namespace Tests\Feature;

use App\Services\PortalClienteFunctionVerifier;
use Tests\TestCase;

class PortalCliente100FuncionesTest extends TestCase
{
    public function test_el_portal_cliente_tiene_exactamente_cien_funciones_definidas(): void
    {
        $items = config('portal_cliente_funciones', []);

        $this->assertCount(100, $items);
        $this->assertSame(range(1, 100), array_column($items, 'id'));
    }

    public function test_las_cien_funciones_tienen_evidencia_funcional(): void
    {
        $report = app(PortalClienteFunctionVerifier::class)->verifyAll();

        $failed = collect($report['results'])
            ->where('passed', false)
            ->map(fn ($item) => $item['id'].' '.$item['name'])
            ->values()
            ->all();

        $this->assertSame(100, $report['total']);
        $this->assertSame(0, $report['failed'], 'Fallaron: '.implode(', ', $failed));
        $this->assertSame(100, $report['passed']);
    }

    public function test_la_navegacion_del_cliente_no_depende_de_un_boton_mas(): void
    {
        $path = base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts');
        $source = (string) file_get_contents($path);

        $this->assertStringNotContainsString('>Más</button>', $source);
        $this->assertStringNotContainsString('<span>Más</span>', $source);
        $this->assertStringContainsString('<span>Cuenta</span>', $source);
        $this->assertStringContainsString("abrirModulo('progreso')", $source);
        $this->assertStringContainsString("abrirModulo('calendario')", $source);
        $this->assertStringContainsString("abrirModulo('reservas')", $source);
        $this->assertStringContainsString("abrirModulo('asistencias')", $source);
        $this->assertStringContainsString("abrirModulo('club')", $source);
        $this->assertStringContainsString("abrirModulo('avisos')", $source);
        $this->assertStringContainsString("abrirModulo('soporte')", $source);
        $this->assertStringContainsString("abrirModulo('perfil')", $source);
    }
}
