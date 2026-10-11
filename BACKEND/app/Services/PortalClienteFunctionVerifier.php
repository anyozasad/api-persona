<?php

namespace App\Services;

use Illuminate\Support\Facades\Route;

class PortalClienteFunctionVerifier
{
    public function verifyAll(): array
    {
        $items = config('portal_cliente_funciones', []);
        $results = [];

        foreach ($items as $item) {
            $checks = [];
            foreach ($item['checks'] ?? [] as $check) {
                $checks[] = $this->verifyCheck($check);
            }

            $passed = count($checks) > 0 && collect($checks)->every(fn ($check) => $check['passed'] === true);

            $results[] = [
                'id' => $item['id'] ?? null,
                'name' => $item['name'] ?? '',
                'area' => $item['area'] ?? '',
                'passed' => $passed,
                'checks' => $checks,
            ];
        }

        $passed = collect($results)->where('passed', true)->count();

        return [
            'total' => count($results),
            'passed' => $passed,
            'failed' => count($results) - $passed,
            'results' => $results,
        ];
    }

    private function verifyCheck(array $check): array
    {
        $type = $check['type'] ?? '';

        if ($type === 'route') {
            $uri = (string) ($check['uri'] ?? '');
            $method = strtoupper((string) ($check['method'] ?? 'GET'));

            foreach (Route::getRoutes() as $route) {
                $routeUri = $route->uri();
                $uriMatches = $routeUri === $uri || str_ends_with($routeUri, '/'.$uri);
                if ($uriMatches && in_array($method, $route->methods(), true)) {
                    return ['passed' => true, 'type' => $type, 'evidence' => $method.' '.$routeUri];
                }
            }

            return ['passed' => false, 'type' => $type, 'evidence' => $method.' '.$uri];
        }

        if ($type === 'file_contains') {
            $path = base_path((string) ($check['path'] ?? ''));
            $needle = (string) ($check['needle'] ?? '');
            $exists = is_file($path);
            $contains = $exists && str_contains((string) file_get_contents($path), $needle);

            return [
                'passed' => $contains,
                'type' => $type,
                'evidence' => ($check['path'] ?? '').' :: '.$needle,
            ];
        }

        return ['passed' => false, 'type' => $type, 'evidence' => 'Tipo de comprobación no soportado'];
    }
}
