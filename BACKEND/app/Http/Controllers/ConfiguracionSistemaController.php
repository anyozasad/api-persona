<?php

namespace App\Http\Controllers;

use App\Models\ConfiguracionSistema;
use App\Models\Membresia;
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
            'telefono' => '939398148',
            'direccion' => 'Jr. Los Laureles Mz 17 Lt 18',
            'referencia' => 'Referencia: Plaza de Laura Bosso',
            'frase_publicitaria' => 'Ven, entrena con Mallqui Gym con el propósito de tener una vida saludable.',
            'horario_detalle' => 'Lunes a viernes: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 9:30 p. m. | Sábado: 6:00 a. m. - 12:00 p. m. y 2:00 p. m. - 8:30 p. m. | Domingo: atención hasta el mediodía.',
            'tarifa_diaria' => 6.00,
            'mensaje_productos' => 'Energizantes, bebidas y productos para consumo disponibles en recepción.',
            'hora_apertura' => '06:00:00',
            'hora_cierre' => '21:30:00',
            'dias_atencion' => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
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
            'referencia' => 'nullable|string|max:255',
            'frase_publicitaria' => 'nullable|string|max:255',
            'horario_detalle' => 'nullable|string|max:1000',
            'tarifa_diaria' => 'nullable|numeric|min:0|max:9999',
            'mensaje_productos' => 'nullable|string|max:1000',
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

    public function publico()
    {
        $config = $this->configuracion();

        return response()->json([
            'nombre_gimnasio' => $config->nombre_gimnasio,
            'telefono' => $config->telefono,
            'direccion' => $config->direccion,
            'referencia' => $config->referencia,
            'frase_publicitaria' => $config->frase_publicitaria,
            'horario_detalle' => $config->horario_detalle,
            'tarifa_diaria' => $config->tarifa_diaria,
            'mensaje_productos' => $config->mensaje_productos,
            'ruc' => $config->ruc,
            'membresias' => Membresia::query()
                ->where('estado', 'Activo')
                ->whereIn('nombre', ['Mensualidad 1 mes', 'Promoción 2 meses', 'Promoción 3 meses'])
                ->orderBy('duracion_meses')
                ->get(),
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
