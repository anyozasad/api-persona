<?php

namespace App\Http\Controllers;

use App\Models\ClienteMembresia;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class ClienteMembresiaController extends Controller
{
    /**
     * Las membresías de socios requieren las 3 tablas relacionadas.
     * Devolver 503 con los campos pendientes, en lugar de un SQL 500.
     */
    private function diagnosticarEsquema(): ?JsonResponse
    {
        try {
            $requeridas = [
                'cliente_membresia' => ['id_cliente_membresia', 'id_cliente', 'id_membresia', 'fecha_inicio', 'fecha_fin', 'estado'],
                'membresias' => ['id_membresia', 'nombre', 'duracion_meses', 'precio', 'estado'],
                'pagos_membresia' => ['id_pago', 'id_cliente_membresia', 'fecha_pago', 'monto', 'estado_pago'],
                'clientes' => ['id_cliente', 'nombres', 'apellidos'],
            ];
            $faltantes = [];
            foreach ($requeridas as $tabla => $columnas) {
                if (!Schema::hasTable($tabla)) {
                    $faltantes[] = 'tabla:'.$tabla;
                    continue;
                }
                foreach ($columnas as $columna) {
                    if (!Schema::hasColumn($tabla, $columna)) {
                        $faltantes[] = $tabla.'.'.$columna;
                    }
                }
            }

            if ($faltantes !== []) {
                return response()->json([
                    'codigo' => 'ESQUEMA_MEMBRESIAS_INCOMPLETO',
                    'mensaje' => 'Faltan tablas o columnas para consultar las membresías. Realiza un respaldo y ejecuta la reparación del módulo de membresías.',
                    'faltantes' => $faltantes,
                ], 503);
            }
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'codigo' => 'MYSQL_MEMBRESIAS_NO_DISPONIBLE',
                'mensaje' => 'No se pudo revisar MySQL para mostrar membresías. Verifica el servidor y DB_DATABASE.',
            ], 503);
        }
        return null;
    }

    public function index(): JsonResponse
    {
        if ($error = $this->diagnosticarEsquema()) {
            return $error;
        }
        try {
            return response()->json(
                ClienteMembresia::with(['cliente', 'membresia', 'pagos'])
                    ->orderByDesc('fecha_fin')
                    ->get()
            );
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'codigo' => 'CONSULTA_MEMBRESIAS_FALLIDA',
                'mensaje' => 'No se pudieron consultar las membresías guardadas. Revisa el registro de errores de Laravel.',
            ], 503);
        }
    }

    public function show(string $id): JsonResponse
    {
        if ($error = $this->diagnosticarEsquema()) {
            return $error;
        }
        return response()->json(
            ClienteMembresia::with(['cliente', 'membresia', 'pagos'])
                ->findOrFail($id)
        );
    }
}
