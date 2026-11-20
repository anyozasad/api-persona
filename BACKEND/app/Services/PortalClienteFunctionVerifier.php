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
            $results[] = $this->verifyOne($item);
        }

        $passed = collect($results)->where('passed', true)->count();

        return [
            'total' => count($results),
            'passed' => $passed,
            'failed' => count($results) - $passed,
            'route_checks' => collect($results)->flatMap(fn ($item) => $item['checks'])
                ->where('type', 'route')->count(),
            'file_checks' => collect($results)->flatMap(fn ($item) => $item['checks'])
                ->where('type', 'file_contains')->count(),
            'results' => $results,
        ];
    }

    /**
     * Comprobación individual: permite 150 pruebas independientes y conserva
     * el informe agregado. Esto NO prueba el flujo de negocio del usuario.
     */
    public function verifyOne(array $item): array
    {
        $checks = [];
        foreach ($item['checks'] ?? [] as $check) {
            $checks[] = $this->verifyCheck($check);
        }

        return [
            'id' => $item['id'] ?? null,
            'name' => $item['name'] ?? '',
            'area' => $item['area'] ?? '',
            'passed' => $checks !== [] && collect($checks)->every(
                fn ($check) => $check['passed'] === true
            ),
            'checks' => $checks,
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
                // Coincidencia exacta: un sufijo parecido de otra ruta no
                // demuestra que la función declarada exista en /api.
                $uriMatches = $routeUri === $uri || $routeUri === 'api/'.ltrim($uri, '/');
                if ($uriMatches && in_array($method, $route->methods(), true)) {
                    $accion = $route->getActionName();
                    if ($accion !== 'Closure' && str_contains($accion, '@')) {
                        [$clase, $metodo] = explode('@', $accion, 2);
                        if (!method_exists($clase, $metodo)) {
                            return [
                                'passed' => false,
                                'type' => $type,
                                'evidence' => $method.' '.$routeUri.' (controlador sin método)',
                            ];
                        }
                    }

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
