<?php

namespace App\Http\Controllers;

use App\Models\ConfiguracionSistema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Throwable;

class ConfiguracionSistemaController extends Controller
{
    private function configuracion(): ConfiguracionSistema
    {
        return ConfiguracionSistema::firstOrCreate([], [
            'nombre_gimnasio' => 'Mallqui Gym',
            'hora_apertura' => '06:00:00',
            'hora_cierre' => '22:00:00',
            'dias_atencion' => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            'dias_aviso_vencimiento' => 7,
            'minutos_cancelacion_reserva' => 120,
            'dias_anticipacion_reserva' => 7,
            'stock_minimo_default' => 5,
            'notificar_vencimientos' => true,
            'notificar_stock_bajo' => true,
            'notificar_pagos_pendientes' => true,
        ]);
    }

    public function show()
    {
        return response()->json([
            'configuracion' => $this->configuracion(),
            'estado' => $this->estadoSistema(),
            'ultimo_respaldo' => $this->ultimoRespaldo(),
        ]);
    }

    public function update(Request $request)
    {
        $datos = $request->validate([
            'nombre_gimnasio' => 'required|string|max:120',
            'ruc' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:30',
            'correo' => 'nullable|email|max:150',
            'direccion' => 'nullable|string|max:255',
            'hora_apertura' => 'required|date_format:H:i',
            'hora_cierre' => 'required|date_format:H:i',
            'dias_atencion' => 'required|array|min:1',
            'dias_atencion.*' => 'string|max:20',
            'dias_aviso_vencimiento' => 'required|integer|min:1|max:60',
            'minutos_cancelacion_reserva' => 'required|integer|min:0|max:1440',
            'dias_anticipacion_reserva' => 'required|integer|min:0|max:60',
            'stock_minimo_default' => 'required|integer|min:0|max:9999',
            'notificar_vencimientos' => 'required|boolean',
            'notificar_stock_bajo' => 'required|boolean',
            'notificar_pagos_pendientes' => 'required|boolean',
        ]);

        $configuracion = $this->configuracion();
        $configuracion->update($datos);

        return response()->json([
            'mensaje' => 'Configuración guardada correctamente.',
            'configuracion' => $configuracion->fresh(),
        ]);
    }

    public function estado()
    {
        return response()->json($this->estadoSistema());
    }

    public function respaldo()
    {
        try {
            $codigo = Artisan::call('backup:database', ['--keep' => 30]);
            $salida = trim(Artisan::output());

            if ($codigo !== 0) {
                return response()->json([
                    'mensaje' => $salida !== '' ? $salida : 'No se pudo generar el respaldo.',
                ], 500);
            }

            return response()->json([
                'mensaje' => 'Respaldo generado correctamente.',
                'respaldo' => $this->ultimoRespaldo(),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'mensaje' => 'No se pudo generar el respaldo: '.$e->getMessage(),
            ], 500);
        }
    }

    public function limpiarCache()
    {
        foreach (['cache:clear', 'config:clear', 'route:clear', 'view:clear'] as $comando) {
            Artisan::call($comando);
        }

        return response()->json([
            'mensaje' => 'Caché del sistema limpiada correctamente.',
        ]);
    }

    private function estadoSistema(): array
    {
        $mysql = false;
        $detalle = null;

        try {
            DB::connection()->getPdo();
            DB::select('SELECT 1');
            $mysql = true;
        } catch (Throwable $e) {
            $detalle = $e->getMessage();
        }

        return [
            'api' => true,
            'mysql' => $mysql,
            'laravel' => app()->version(),
            'php' => PHP_VERSION,
            'driver' => config('database.default'),
            'sanctum' => class_exists(\Laravel\Sanctum\Sanctum::class),
            'entorno' => app()->environment(),
            'detalle_mysql' => $detalle,
            'fecha_revision' => now()->toDateTimeString(),
        ];
    }

    private function ultimoRespaldo(): ?array
    {
        $directorio = storage_path('app/backups');

        if (!File::isDirectory($directorio)) {
            return null;
        }

        $archivos = collect(File::files($directorio))
            ->filter(fn ($file) => strtolower($file->getExtension()) === 'sql')
            ->sortByDesc(fn ($file) => $file->getMTime());

        $archivo = $archivos->first();

        if (!$archivo) {
            return null;
        }

        return [
            'archivo' => $archivo->getFilename(),
            'fecha' => date('Y-m-d H:i:s', $archivo->getMTime()),
            'tamano_kb' => round($archivo->getSize() / 1024, 2),
        ];
    }
}
