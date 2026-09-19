<?php

namespace App\Http\Controllers;

use App\Models\DetalleRutina;
use App\Models\Entrenador;
use App\Models\Rutina;
use Illuminate\Http\Request;

class DetalleRutinaController extends Controller
{
    public function index(Request $request)
    {
        $query = DetalleRutina::with('rutina.cliente')->orderBy('id_detalle_rutina');
        if ($idEntrenador = $this->idEntrenadorActual($request)) {
            $query->whereHas('rutina', fn ($q) => $q->where('id_entrenador', $idEntrenador));
        }
        if ($request->filled('id_rutina')) $query->where('id_rutina', $request->integer('id_rutina'));
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_rutina' => 'required|integer|exists:rutinas,id_rutina',
            'ejercicio' => 'required|string|max:150',
            'series' => 'required|integer|min:1|max:20',
            'repeticiones' => 'required|integer|min:1|max:200',
            'peso_recomendado' => 'nullable|numeric|min:0',
            'descanso_segundos' => 'nullable|integer|min:0|max:3600',
            'observaciones' => 'nullable|string|max:500',
        ]);
        $this->autorizarRutina($request, (int) $datos['id_rutina']);
        return response()->json(DetalleRutina::create($datos)->load('rutina'), 201);
    }

    public function show(Request $request, string $id)
    {
        return response()->json($this->detalleAutorizado($request, $id)->load('rutina'));
    }

    public function update(Request $request, string $id)
    {
        $detalle = $this->detalleAutorizado($request, $id);
        $datos = $request->validate([
            'id_rutina' => 'sometimes|integer|exists:rutinas,id_rutina',
            'ejercicio' => 'sometimes|string|max:150',
            'series' => 'sometimes|integer|min:1|max:20',
            'repeticiones' => 'sometimes|integer|min:1|max:200',
            'peso_recomendado' => 'sometimes|nullable|numeric|min:0',
            'descanso_segundos' => 'sometimes|nullable|integer|min:0|max:3600',
            'observaciones' => 'sometimes|nullable|string|max:500',
        ]);
        if (isset($datos['id_rutina'])) $this->autorizarRutina($request, (int) $datos['id_rutina']);
        $detalle->update($datos);
        return response()->json($detalle->fresh('rutina'));
    }

    public function destroy(Request $request, string $id)
    {
        $this->detalleAutorizado($request, $id)->delete();
        return response()->json(null, 204);
    }

    private function detalleAutorizado(Request $request, string $id): DetalleRutina
    {
        $detalle = DetalleRutina::findOrFail($id);
        $this->autorizarRutina($request, (int) $detalle->id_rutina);
        return $detalle;
    }

    private function autorizarRutina(Request $request, int $idRutina): void
    {
        if ($idEntrenador = $this->idEntrenadorActual($request)) {
            abort_unless(Rutina::where('id_rutina', $idRutina)->where('id_entrenador', $idEntrenador)->exists(), 403, 'No puedes modificar una rutina de otro entrenador.');
        }
    }

    private function idEntrenadorActual(Request $request): ?int
    {
        if (mb_strtolower((string) $request->user()?->rol) !== 'entrenador') return null;
        $usuario = $request->user();
        $entrenador = $usuario?->id_entrenador ? Entrenador::find($usuario->id_entrenador) : null;
        if (!$entrenador && $usuario?->dni) {
            $entrenador = Entrenador::where('dni', $usuario->dni)->first();
        }
        abort_unless($entrenador && mb_strtolower((string) $entrenador->estado) === 'activo', 403, 'La cuenta no está vinculada a un entrenador activo.');
        return (int) $entrenador->id_entrenador;
    }
}
