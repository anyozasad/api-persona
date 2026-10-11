<?php

namespace App\Services;

use Illuminate\Support\Facades\Route;

class SprintVerifier
{
    public function verifyAll(): array
    {
        $sprints = config('mallqui_sprints', []);
        $results = [];

        foreach ($sprints as $sprint) {
            $checks = $sprint['checks'] ?? [];
            $checkResults = [];

            foreach ($checks as $check) {
                $checkResults[] = $this->verifyCheck($check);
            }

            $passed = count($checkResults) > 0
                && collect($checkResults)->every(fn ($r) => $r['passed'] === true);

            $results[] = [
                'id' => (int) ($sprint['id'] ?? 0),
                'name' => (string) ($sprint['name'] ?? 'Sprint'),
                'module' => (string) ($sprint['module'] ?? ''),
                'passed' => $passed,
                'checks' => $checkResults,
            ];
        }

        return [
            'total' => count($results),
            'passed' => collect($results)->where('passed', true)->count(),
            'failed' => collect($results)->where('passed', false)->count(),
            'results' => $results,
        ];
    }

    private function verifyCheck(array $check): array
    {
        $type = $check['type'] ?? '';

        if ($type === 'route') {
            $method = strtoupper((string) ($check['method'] ?? 'GET'));
            $expectedUri = ltrim((string) ($check['uri'] ?? ''), '/');

            $matched = collect(Route::getRoutes()->getRoutes())->contains(function ($route) use ($method, $expectedUri) {
                $uri = ltrim($route->uri(), '/');
                $uriMatches = $uri === $expectedUri || str_ends_with($uri, '/'.$expectedUri);
                return $uriMatches && in_array($method, $route->methods(), true);
            });

            return [
                'passed' => $matched,
                'label' => $method.' '.$expectedUri,
            ];
        }

        if ($type === 'file_contains') {
            $path = base_path((string) ($check['path'] ?? ''));
            $needle = (string) ($check['needle'] ?? '');
            $exists = is_file($path);
            $matched = $exists && $needle !== '' && str_contains((string) file_get_contents($path), $needle);

            return [
                'passed' => $matched,
                'label' => ($check['path'] ?? '').' contiene '.$needle,
            ];
        }

        if ($type === 'file_exists') {
            $path = base_path((string) ($check['path'] ?? ''));
            return [
                'passed' => is_file($path),
                'label' => (string) ($check['path'] ?? ''),
            ];
        }

        return [
            'passed' => false,
            'label' => 'Check desconocido',
        ];
    }
}
