<?php

namespace App\Http\Controllers;

use App\Models\Caja;
use App\Models\MovimientoCaja;
use App\Services\CajaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CajaController extends Controller
{
    public function actual()
    {
        $caja = Caja::with(['usuarioApertura', 'movimientos.usuario'])
            ->whereRaw('LOWER(estado) = ?', ['abierta'])
            ->orderByDesc('fecha_apertura')
            ->first();

        if (!$caja) {
            return response()->json(['caja_abierta' => false, 'caja' => null]);
        }

        return response()->json([
            'caja_abierta' => true,
            'caja' => $caja,
            'resumen' => $this->resumen($caja),
        ]);
    }

    public function abrir(Request $request)
    {
        $datos = $request->validate([
            'monto_inicial' => 'required|numeric|min:0|max:99999999.99',
            'observacion' => 'nullable|string|max:1000',
        ]);

        $caja = DB::transaction(function () use ($datos, $request) {
            if (Caja::whereRaw('LOWER(estado) = ?', ['abierta'])->lockForUpdate()->exists()) {
                throw ValidationException::withMessages([
                    'caja' => ['Ya existe una caja abierta. Debe cerrarse antes de abrir otra.'],
                ]);
            }

            $datosCaja = [
                'id_usuario_apertura' => $request->user()->id_usuario,
                'fecha_apertura' => now(),
                'monto_inicial' => $datos['monto_inicial'],
                'estado' => 'Abierta',
                'observacion' => $datos['observacion'] ?? null,
            ];

            // Compatibilidad con instalaciones originales de gym_system:
            // cajas.id es la PK, usuario_id/monto_final/total_ventas/total_gastos
            // son columnas legacy requeridas y deben conservarse.
            if (Schema::hasColumn('cajas', 'id') && Schema::hasColumn('cajas', 'usuario_id')) {
                $campos = array_fill_keys(Schema::getColumnListing('cajas'), true);
                $datosCaja['usuario_id'] = (int) (
                    $request->user()->getAttribute('id') ?: $request->user()->id_usuario
                );
                foreach (['monto_final', 'total_ventas', 'total_gastos'] as $columna) {
                    if (isset($campos[$columna])) {
                        $datosCaja[$columna] = 0;
                    }
                }
                $datosCaja['estado'] = 'abierta';
                $idLegacy = (int) DB::table('cajas')->insertGetId($datosCaja, 'id');
                if (isset($campos['id_caja'])) {
                    DB::table('cajas')->where('id', $idLegacy)->update(['id_caja' => $idLegacy]);
                }

                return Caja::findOrFail($idLegacy);
            }

            return Caja::create($datosCaja);
        });

        return response()->json([
            'mensaje' => 'Caja abierta correctamente.',
            'caja' => $caja->load('usuarioApertura'),
        ], 201);
    }

    public function movimiento(Request $request, CajaService $cajaService)
    {
        $datos = $request->validate([
            'tipo' => ['required', Rule::in(['Ingreso', 'Egreso'])],
            'origen' => 'required|string|max:50',
            'descripcion' => 'required|string|max:255',
            'monto' => 'required|numeric|min:0.01|max:99999999.99',
        ]);

        $movimiento = DB::transaction(function () use ($datos, $request, $cajaService) {
            $caja = Caja::whereRaw('LOWER(estado) = ?', ['abierta'])->lockForUpdate()->first();
            if (!$caja) {
                throw ValidationException::withMessages([
                    'caja' => ['No existe una caja abierta.'],
                ]);
            }

            // Evitar egresos superiores al saldo disponible de la caja.
            if ($datos['tipo'] === 'Egreso' &&
                (float) $datos['monto'] > (float) $this->resumen($caja)['monto_esperado']) {
                throw ValidationException::withMessages([
                    'monto' => ['El egreso supera el saldo disponible de la caja.'],
                ]);
            }

            // Utiliza el mismo guardado que una venta: incluye caja_id
            // e id_movimiento en las instalaciones anteriores de gym_system.
            // Reutilizar la caja bloqueada evita movimientos sin referencia.
            $movimiento = $cajaService->registrarMovimiento(
                (int) $request->user()->id_usuario,
                $datos['tipo'],
                $datos['origen'],
                $datos['descripcion'],
                (float) $datos['monto'],
                null,
                null,
                $caja
            );
            if (!$movimiento) {
                throw ValidationException::withMessages([
                    'caja' => ['No existe una caja abierta para registrar este movimiento.'],
                ]);
            }
            return $movimiento;
        });

        return response()->json([
            'mensaje' => 'Movimiento de caja registrado.',
            'movimiento' => $movimiento,
        ], 201);
    }

    public function cerrar(Request $request)
    {
        $datos = $request->validate([
            'monto_real' => 'required|numeric|min:0|max:99999999.99',
            'observacion' => 'nullable|string|max:1000',
        ]);

        $caja = DB::transaction(function () use ($datos) {
            $caja = Caja::whereRaw('LOWER(estado) = ?', ['abierta'])->lockForUpdate()->first();
            if (!$caja) {
                throw ValidationException::withMessages([
                    'caja' => ['No existe una caja abierta para cerrar.'],
                ]);
            }

            $resumen = $this->resumen($caja);
            $esperado = $resumen['monto_esperado'];
            $real = round((float) $datos['monto_real'], 2);

            $caja->update([
                'fecha_cierre' => now(),
                'monto_esperado' => $esperado,
                'monto_real' => $real,
                'diferencia' => round($real - $esperado, 2),
                'estado' => 'Cerrada',
                'observacion' => $datos['observacion'] ?? $caja->observacion,
            ]);

            return $caja;
        });

        return response()->json([
            'mensaje' => 'Caja cerrada correctamente.',
            'caja' => $caja->fresh(['usuarioApertura', 'movimientos.usuario']),
        ]);
    }

    public function historial()
    {
        return response()->json(
            Caja::with('usuarioApertura')
                ->orderByDesc('fecha_apertura')
                ->limit(100)
                ->get()
        );
    }

    private function resumen(Caja $caja): array
    {
        $ingresos = (float) MovimientoCaja::where('id_caja', $caja->id_caja)
            ->where('estado', 'Registrado')->where('tipo', 'Ingreso')->sum('monto');
        $egresos = (float) MovimientoCaja::where('id_caja', $caja->id_caja)
            ->where('estado', 'Registrado')->where('tipo', 'Egreso')->sum('monto');
        $inicial = (float) $caja->monto_inicial;

        return [
            'monto_inicial' => round($inicial, 2),
            'ingresos' => round($ingresos, 2),
            'egresos' => round($egresos, 2),
            'monto_esperado' => round($inicial + $ingresos - $egresos, 2),
        ];
    }
}
