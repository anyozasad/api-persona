<?php

namespace Tests\Feature;

use App\Services\SprintVerifier;
use Tests\TestCase;

class Sprint100AcceptanceTest extends TestCase
{
    public function test_hay_exactamente_cien_sprints_definidos(): void
    {
        $sprints = config('mallqui_sprints', []);

        $this->assertCount(100, $sprints);
        $this->assertSame(range(1, 100), array_column($sprints, 'id'));
    }

    public function test_los_cien_sprints_tienen_evidencia_funcional(): void
    {
        $resultado = app(SprintVerifier::class)->verifyAll();

        $fallos = collect($resultado['results'])
            ->where('passed', false)
            ->map(fn ($sprint) => [
                'id' => $sprint['id'],
                'name' => $sprint['name'],
                'fallos' => collect($sprint['checks'])
                    ->where('passed', false)
                    ->pluck('label')
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

        $this->assertSame(100, $resultado['total']);
        $this->assertSame(0, $resultado['failed'], json_encode($fallos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->assertSame(100, $resultado['passed']);
    }
}
