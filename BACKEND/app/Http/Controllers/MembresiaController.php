<?php

namespace App\Http\Controllers;

use App\Models\Membresia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class MembresiaController extends Controller
{
    public function index()
    {
        if ($error = $this->diagnosticarTabla('membresias', $this->columnasPlan())) {
            return $error;
        }

        // Planes y Precios no debe fallar por una tabla de contrataciones
        // antigua o todavía pendiente de migrar.
        try {
            $query = Membresia::query()->orderBy('precio');
            if (Schema::hasTable('cliente_membresia')
                && Schema::hasColumn('cliente_membresia', 'id_membresia')) {
                $query->withCount('clienteMembresias');
            }

            return response()->json($query->get());
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'codigo' => 'PLANES_CONSULTA_FALLIDA',
                'mensaje' => 'No se pudieron consultar los planes guardados en MySQL. Revisa la conexión y el esquema de membresías.',
            ], 503);
        }
    }

    public function store(Request $request)
    {
        if ($error = $this->diagnosticarTabla('membresias', $this->columnasPlan())) return $error;
        $datos = $request->validate([
            'nombre' => 'required|string|max:100|unique:membresias,nombre',
            'duracion_meses' => 'required|integer|min:1|max:36',
            'precio' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string|max:500',
            'beneficios' => 'nullable|array|max:12',
            'beneficios.*' => 'required|string|max:150',
            'permite_reservas' => 'nullable|boolean',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $datos['estado'] = $datos['estado'] ?? 'Activo';
        $datos['permite_reservas'] = $datos['permite_reservas'] ?? true;

        return response()->json(Membresia::create($datos), 201);
    }

    public function show(Membresia $membresia)
    {
        if ($error = $this->diagnosticarTabla('cliente_membresia')) return $error;
        return response()->json(
            $membresia->load(['clienteMembresias.cliente', 'clienteMembresias.pagos'])
        );
    }

    public function update(Request $request, Membresia $membresia)
    {
        if ($error = $this->diagnosticarTabla('membresias', $this->columnasPlan())) return $error;
        $datos = $request->validate([
            'nombre' => [
                'sometimes', 'string', 'max:100',
                Rule::unique('membresias', 'nombre')->ignore($membresia->id_membresia, 'id_membresia'),
            ],
            'duracion_meses' => 'sometimes|integer|min:1|max:36',
            'precio' => 'sometimes|numeric|min:0',
            'descripcion' => 'sometimes|nullable|string|max:500',
            'beneficios' => 'sometimes|nullable|array|max:12',
            'beneficios.*' => 'required|string|max:150',
            'permite_reservas' => 'sometimes|boolean',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $membresia->update($datos);

        return response()->json($membresia->fresh());
    }

    public function destroy(Membresia $membresia)
    {
        if ($error = $this->diagnosticarTabla('membresias', $this->columnasPlan())) return $error;
        $membresia->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Membresía desactivada. Se conserva el historial de clientes y pagos.',
            'membresia' => $membresia->fresh(),
        ]);
    }
    private function columnasPlan(): array
    {
        return [
            'id_membresia', 'nombre', 'duracion_meses', 'precio',
            'descripcion', 'beneficios', 'permite_reservas', 'estado',
        ];
    }

    private function diagnosticarTabla(string $tabla, array $columnas = []): ?\Illuminate\Http\JsonResponse
    {
        try {
            if (!Schema::hasTable($tabla)) {
                return response()->json([
                    'codigo' => 'TABLA_MODULO_AUSENTE',
                    'mensaje' => 'Falta la tabla '.$tabla.' en MySQL. Haz un respaldo y ejecuta la preparación segura de la base de datos.',
                    'tabla' => $tabla,
                ], 503);
            }

            $faltantes = array_values(array_filter(
                $columnas,
                fn (string $columna) => !Schema::hasColumn($tabla, $columna)
            ));

            if ($faltantes !== []) {
                return response()->json([
                    'codigo' => 'COLUMNAS_PLANES_AUSENTES',
                    'mensaje' => 'La tabla de membresías existe, pero le faltan columnas. Haz un respaldo y prepara la base para poder guardar y consultar planes.',
                    'tabla' => $tabla,
                    'faltantes' => $faltantes,
                ], 503);
            }
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'codigo' => 'MYSQL_PLANES_NO_DISPONIBLE',
                'mensaje' => 'No se pudo acceder a MySQL para consultar los planes. Revisa XAMPP y la configuración BACKEND/.env.',
            ], 503);
        }
        return null;
    }


}
