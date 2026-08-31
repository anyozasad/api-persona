<?php

namespace App\Http\Controllers;

use App\Models\Caja;
use App\Models\MovimientoCaja;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CajaController extends Controller
{
    public function actual()
    {
        $caja = Caja::with(['usuarioApertura', 'movimientos.usuario'])
            ->where('estado', 'Abierta')
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
            if (Caja::where('estado', 'Abierta')->lockForUpdate()->exists()) {
                throw ValidationException::withMessages([
                    'caja' => ['Ya existe una caja abierta. Debe cerrarse antes de abrir otra.'],
                ]);
            }

            return Caja::create([
                'id_usuario_apertura' => $request->user()->id_usuario,
                'fecha_apertura' => now(),
                'monto_inicial' => $datos['monto_inicial'],
                'estado' => 'Abierta',
                'observacion' => $datos['observacion'] ?? null,
            ]);
        });

        return response()->json([
            'mensaje' => 'Caja abierta correctamente.',
            'caja' => $caja->load('usuarioApertura'),
        ], 201);
    }

    public function movimiento(Request $request)
    {
        $datos = $request->validate([
            'tipo' => ['required', Rule::in(['Ingreso', 'Egreso'])],
            'origen' => 'required|string|max:50',
            'descripcion' => 'required|string|max:255',
            'monto' => 'required|numeric|min:0.01|max:99999999.99',
        ]);

        $movimiento = DB::transaction(function () use ($datos, $request) {
            $caja = Caja::where('estado', 'Abierta')->lockForUpdate()->first();
            if (!$caja) {
                throw ValidationException::withMessages([
                    'caja' => ['No existe una caja abierta.'],
                ]);
            }

            return MovimientoCaja::create([
                'id_caja' => $caja->id_caja,
                'id_usuario' => $request->user()->id_usuario,
                'tipo' => $datos['tipo'],
                'origen' => $datos['origen'],
                'descripcion' => $datos['descripcion'],
                'monto' => $datos['monto'],
                'fecha_movimiento' => now(),
                'estado' => 'Registrado',
            ]);
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
            $caja = Caja::where('estado', 'Abierta')->lockForUpdate()->first();
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
