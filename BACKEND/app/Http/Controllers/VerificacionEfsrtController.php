<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Diagnóstico de solo lectura para la revisión EFSRT.
 *
 * No genera datos ficticios, no registra pruebas como aprobadas y nunca
 * altera tablas. El permiso Administrador se aplica en routes/api.php.
 */
class VerificacionEfsrtController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            DB::connection()->getPdo();

            $definiciones = [
                ['id'=>'usuarios','nombre'=>'Cuentas y registro','destino'=>'usuarios',
                    'tablas'=>['usuarios','clientes'],'principal'=>'usuarios'],
                ['id'=>'socios','nombre'=>'Socios y membresías','destino'=>'clientes',
                    'tablas'=>['clientes','membresias','cliente_membresia'],'principal'=>'clientes'],
                ['id'=>'reservas','nombre'=>'Reservas de clases','destino'=>'reservas',
                    'tablas'=>['reservas','clases'],'principal'=>'reservas'],
                ['id'=>'pagos','nombre'=>'Pagos y constancias','destino'=>'pagos',
                    'tablas'=>['pagos_membresia'],'principal'=>'pagos_membresia'],
                ['id'=>'asistencia','nombre'=>'Asistencia y accesos','destino'=>'asistencias',
                    'tablas'=>['asistencias'],'principal'=>'asistencias'],
                ['id'=>'rutinas','nombre'=>'Rutinas y ejercicios','destino'=>'rutinas',
                    'tablas'=>['rutinas','detalle_rutina'],'principal'=>'rutinas'],
                ['id'=>'productos','nombre'=>'Productos y stock','destino'=>'productos',
                    'tablas'=>['productos','categorias'],'principal'=>'productos'],
                ['id'=>'ventas','nombre'=>'Ventas e inventario','destino'=>'ventas',
                    'tablas'=>['ventas','detalle_venta','movimientos_inventario'],'principal'=>'ventas'],
                ['id'=>'seguimiento','nombre'=>'Seguimiento y alertas','destino'=>'seguimiento',
                    'tablas'=>['cliente_membresia','asistencias','rutinas'],'principal'=>'cliente_membresia'],
                ['id'=>'evidencias','nombre'=>'Configuración y registros','destino'=>'mantenimiento-sistema',
                    'tablas'=>['configuracion_sistema','auditorias','admin_gym_records'],'principal'=>'admin_gym_records'],
            ];

            $modulos = [];
            foreach ($definiciones as $definicion) {
                // Adaptación de tablas antiguas equivalentes; nunca considerar
                // movimientos de caja como si fueran Kardex de inventario.
                $alternativas = [
                    'clientes' => ['clientes','socios'],
                    'membresias' => ['membresias','planes'],
                    'cliente_membresia' => ['cliente_membresia','suscripciones'],
                    'pagos_membresia' => ['pagos_membresia','pagos'],
                    'detalle_venta' => ['detalle_venta','detalle_ventas'],
                    'configuracion_sistema' => ['configuracion_sistema','configuracion'],
                ];
                $faltantes = array_values(array_filter(
                    $definicion['tablas'],
                    fn (string $tabla) => !collect($alternativas[$tabla] ?? [$tabla])
                        ->contains(fn ($alternativa) => Schema::hasTable($alternativa))
                ));
                $listo = count($faltantes) === 0;
                $principal = collect($alternativas[$definicion['principal']] ?? [$definicion['principal']])
                    ->first(fn ($tabla) => Schema::hasTable($tabla));
                $modulos[] = [
                    'id' => $definicion['id'],
                    'nombre' => $definicion['nombre'],
                    'destino' => $definicion['destino'],
                    // "disponible" significa estructura presente, no CRUD probado.
                    'estado' => $listo ? 'estructura_disponible' : 'estructura_incompleta',
                    'registros' => $principal
                        ? (int) DB::table($principal)->count()
                        : null,
                    'faltantes' => $faltantes,
                ];
            }

            $alertas = [];
            if ($this->columnas('clientes', ['dni'])) {
                $duplicados = DB::table('clientes')->whereNotNull('dni')
                    ->groupBy('dni')->havingRaw('COUNT(*) > 1')->get(['dni'])->count();
                if ($duplicados > 0) {
                    $alertas[] = ['tipo'=>'duplicados_clientes','cantidad'=>$duplicados,
                        'mensaje'=>'Hay documentos DNI repetidos en clientes.','destino'=>'clientes'];
                }
            }

            if ($this->columnas('reservas', ['id_cliente','id_clase','fecha_clase','estado'])) {
                $duplicados = DB::table('reservas')
                    ->whereIn('estado', ['Reservada','Confirmada'])
                    ->groupBy('id_cliente','id_clase','fecha_clase')
                    ->havingRaw('COUNT(*) > 1')
                    ->get(['id_cliente'])->count();
                if ($duplicados > 0) {
                    $alertas[] = ['tipo'=>'reservas_duplicadas','cantidad'=>$duplicados,
                        'mensaje'=>'Hay reservas activas repetidas para el mismo socio, clase y fecha.',
                        'destino'=>'reservas'];
                }
            }

            if ($this->columnas('pagos_membresia', ['id_cliente_membresia','monto'])
                && $this->columnas('cliente_membresia', ['id_cliente_membresia'])) {
                $sinMembresia = DB::table('pagos_membresia as p')
                    ->leftJoin('cliente_membresia as cm','cm.id_cliente_membresia','=','p.id_cliente_membresia')
                    ->whereNull('cm.id_cliente_membresia')->count();
                if ($sinMembresia > 0) {
                    $alertas[] = ['tipo'=>'pagos_huerfanos','cantidad'=>$sinMembresia,
                        'mensaje'=>'Hay pagos que no tienen una membresía relacionada.','destino'=>'pagos'];
                }
            }

            if ($this->columnas('productos', ['stock'])) {
                $negativos = DB::table('productos')->where('stock', '<', 0)->count();
                if ($negativos > 0) {
                    $alertas[] = ['tipo'=>'stock_negativo','cantidad'=>$negativos,
                        'mensaje'=>'Hay productos con stock negativo.','destino'=>'productos'];
                }
            }

            $faltantesTotales = collect($modulos)->sum(fn ($modulo) => count($modulo['faltantes']));
            $semanas = $this->evaluarSemanas($alertas);

            return response()->json([
                'fecha_revision' => now()->toDateTimeString(),
                'base_datos' => DB::connection()->getDatabaseName(),
                'conexion' => 'disponible',
                'modulos' => $modulos,
                'total_modulos' => count($modulos),
                'modulos_con_estructura' => collect($modulos)
                    ->where('estado','estructura_disponible')->count(),
                'faltantes' => $faltantesTotales,
                'alertas' => $alertas,
                'semanas' => $semanas,
                'semanas_pendientes' => collect($semanas)->where('estado', 'pendiente')->count(),
                'nota' => 'Diagnóstico de estructuras y coherencia de registros. '
                    .'No reemplaza las pruebas funcionales con usuario, dashboard y MySQL. '
                    .'La emisión SUNAT requiere integración y autorización independientes.',
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'conexion'=>'no_disponible',
                'mensaje'=>'No fue posible consultar la base de datos para la revisión.',
            ], 503);
        }
    }

    /**
     * Control de las once semanas, sin marcar trabajo presencial o CI como
     * aprobado únicamente por encontrar una tabla. No escribe datos.
     * Las alternativas cubren bases modernas y productos heredados.
     */
    private function evaluarSemanas(array $alertas): array
    {
        $existe = fn (array $alternativas): bool =>
            collect($alternativas)->contains(fn ($tabla) => Schema::hasTable($tabla));

        $catalogo = [
            [1, 'Requerimientos y estructura', 'verificacion-efsrt', [['usuarios'], ['productos'], ['reservas']]],
            [2, 'Portada, menú y diseño adaptable', 'dashboard', []],
            [3, 'Inicio de sesión y registro', 'usuarios', [['usuarios']]],
            [4, 'Socios, reservas y panel administrador', 'clientes', [['clientes','socios'], ['reservas']]],
            [5, 'Productos, fotografías y pagos', 'productos', [['productos'], ['categorias'], ['pagos_membresia','pagos']]],
            [6, 'Asistencia, rutinas y entrenador', 'asistencias', [['asistencias'], ['rutinas'], ['entrenadores']]],
            [7, 'Interfaz, navegación y botones', 'dashboard', []],
            [8, 'Fotografías locales y sincronización', 'productos', [['productos']]],
            [9, 'Duplicados, alertas y datos consistentes', 'renovaciones', [['reservas'], ['productos'], ['cliente_membresia','suscripciones']]],
            [10, 'Pagos, comprobantes, permisos y uso sin conexión', 'pagos', [['pagos_membresia','pagos'], ['usuarios']]],
            [11, 'Pruebas finales, evidencia y respaldo', 'mantenimiento-sistema', []],
        ];

        $resultado = [];
        foreach ($catalogo as [$numero, $titulo, $destino, $grupos]) {
            $observaciones = [];
            foreach ($grupos as $alternativas) {
                if (!$existe($alternativas)) {
                    $observaciones[] = 'Falta tabla de datos: '.implode(' / ', $alternativas).'.';
                }
            }

            if ($numero === 5 || $numero === 8) {
                if ($this->columnas('productos', ['foto'])) {
                    $sinFoto = DB::table('productos')->where(function ($q) {
                        $q->whereNull('foto')->orWhere('foto', '');
                    })->count();
                    if ($sinFoto > 0) {
                        $observaciones[] = "Hay {$sinFoto} productos sin fotografía en MySQL.";
                    }
                    $rutas = DB::table('productos')->whereNotNull('foto')
                        ->where('foto','!=','')
                        ->where('foto','not like','data:image/%;base64,%')->count();
                    if ($rutas > 0) {
                        $observaciones[] = "Revisar {$rutas} referencias antiguas de fotografías.";
                    }
                } elseif (Schema::hasTable('productos')) {
                    $observaciones[] = 'La tabla productos no tiene la columna foto.';
                }
            }

            if ($numero === 9) {
                foreach ($alertas as $alerta) {
                    if (in_array($alerta['tipo'], ['duplicados_clientes','reservas_duplicadas','pagos_huerfanos','stock_negativo'], true)) {
                        $observaciones[] = $alerta['mensaje'];
                    }
                }
            }

            if ($numero === 10) {
                $observaciones[] = 'La boleta electrónica SUNAT y el modo completamente offline no están acreditados.';
            }

            if ($numero === 11) {
                $directorio = storage_path('app/backups');
                $respaldos = is_dir($directorio) ? glob($directorio.DIRECTORY_SEPARATOR.'*.sql') : [];
                if (!$respaldos) {
                    $observaciones[] = 'No existe todavía un respaldo SQL verificado en storage/app/backups.';
                }
            }

            // El código fuente o una tabla no certifican pruebas de interfaz y flujo.
            $estado = $observaciones ? 'pendiente' : 'verificacion_manual';
            if (!$observaciones) {
                $observaciones[] = 'Comprobar el flujo completo con navegador, Laravel y MySQL; guardar evidencia real.';
            }
            $resultado[] = [
                'semana' => $numero,
                'titulo' => $titulo,
                'destino' => $destino,
                'estado' => $estado,
                'observaciones' => $observaciones,
            ];
        }
        return $resultado;
    }

    /** Antes de consultar, comprobar tablas y columnas de esquemas existentes. */
    private function columnas(string $tabla, array $columnas): bool
    {
        if (!Schema::hasTable($tabla)) return false;
        foreach ($columnas as $columna) {
            if (!Schema::hasColumn($tabla, $columna)) return false;
        }
        return true;
    }
}
