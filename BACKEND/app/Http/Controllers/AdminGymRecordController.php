<?php

namespace App\Http\Controllers;

use App\Models\AdminGymRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGymRecordController extends Controller
{
    private const MODULOS = [
        'nutricion',
        'equipos',
        'eventos',
        'galeria',
        'noticias',
        'salarios',
        'ingresos',
        'facturas',
    ];

    public function index(Request $request, string $modulo): JsonResponse
    {
        $this->validarModulo($modulo);

        $q = AdminGymRecord::query()
            ->where('modulo', $modulo)
            ->orderByDesc('fecha')
            ->orderByDesc('id');

        if ($request->filled('estado')) {
            $q->where('estado', $request->string('estado')->toString());
        }

        if ($request->filled('buscar')) {
            $buscar = trim($request->string('buscar')->toString());
            $q->where(function ($sub) use ($buscar) {
                $sub->where('titulo', 'like', "%{$buscar}%")
                    ->orWhere('subtitulo', 'like', "%{$buscar}%");
            });
        }

        return response()->json($q->get());
    }

    public function store(Request $request, string $modulo): JsonResponse
    {
        $this->validarModulo($modulo);
        $data = $this->validar($request);
        $data['modulo'] = $modulo;

        $record = AdminGymRecord::create($data);

        return response()->json($record, 201);
    }

    public function update(Request $request, string $modulo, int $id): JsonResponse
    {
        $this->validarModulo($modulo);

        $record = AdminGymRecord::where('modulo', $modulo)->findOrFail($id);
        $record->update($this->validar($request));
        $record->refresh();

        return response()->json($record);
    }

    public function destroy(string $modulo, int $id): JsonResponse
    {
        $this->validarModulo($modulo);

        $record = AdminGymRecord::where('modulo', $modulo)->findOrFail($id);
        $record->delete();

        return response()->json(['ok' => true]);
    }

    public function cambiarEstado(Request $request, string $modulo, int $id): JsonResponse
    {
        $this->validarModulo($modulo);
        $data = $request->validate([
            'estado' => ['required', 'string', 'max:50'],
        ]);

        $record = AdminGymRecord::where('modulo', $modulo)->findOrFail($id);
        $record->update(['estado' => $data['estado']]);

        return response()->json($record->fresh());
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'titulo' => ['required', 'string', 'max:180'],
            'subtitulo' => ['nullable', 'string', 'max:255'],
            'estado' => ['required', 'string', 'max:50'],
            'fecha' => ['nullable', 'date'],
            'monto' => ['nullable', 'numeric', 'min:0'],
            'imagen_url' => ['nullable', 'string', 'max:500'],
            'datos' => ['nullable', 'array'],
        ]);
    }

    private function validarModulo(string $modulo): void
    {
        abort_unless(in_array($modulo, self::MODULOS, true), 404, 'Módulo no disponible.');
    }
}
