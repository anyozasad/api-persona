<?php

namespace App\Http\Middleware;

use App\Services\GymSystemDataMirror;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SyncGymSystemMirror
{
    public function __construct(private GymSystemDataMirror $mirror)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $metodo = strtoupper($request->method());
        $esMutacion = in_array($metodo, ['POST', 'PUT', 'PATCH', 'DELETE'], true);
        $correcta = $response->getStatusCode() >= 200 && $response->getStatusCode() < 400;
        $esRutaLegacy = $request->is('api/gym-admin/*');

        if ($esMutacion && $correcta && !$esRutaLegacy) {
            $this->mirror->sincronizarSilencioso();
        }

        return $response;
    }
}
