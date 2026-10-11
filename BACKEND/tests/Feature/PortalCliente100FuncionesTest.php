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
}
