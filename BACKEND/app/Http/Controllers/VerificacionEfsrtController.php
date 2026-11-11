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

            // Una instalación con productos llamados "Producto Prueba N"
            // todavía muestra datos de demostración, aunque tenga fotos.
            // Advertirlo sin cambiar automáticamente precios ni historiales.
            if (Schema::hasTable('productos')) {
                $nombreProducto = Schema::hasColumn('productos', 'nombre_producto')
                    ? 'nombre_producto'
                    : (Schema::hasColumn('productos', 'nombre') ? 'nombre' : null);
                if ($nombreProducto !== null) {
                    $dePrueba = DB::table('productos')
                        ->where($nombreProducto, 'like', 'Producto Prueba %')
                        ->count();
                    if ($dePrueba > 0) {
                        $alertas[] = [
                            'tipo'=>'productos_prueba',
                            'cantidad'=>$dePrueba,
                            'mensaje'=>"Hay {$dePrueba} productos con nombres de prueba; verifica sus nombres y fotografías reales.",
                            'destino'=>'productos',
                        ];
                    }
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

        // Cinco actividades por semana, fieles a la bitácora original TEC.
        // Incluye la evidencia especificada; no supone que exista ni que
        // el supervisor ya la haya validado.
        $actividadesBitacora = [
            1 => [
                ['Requerimientos del gimnasio y funciones principales', 'Lista de requerimientos'],
                ['Requerimientos de usuario y administrador', 'Esquema de módulos'],
                ['Separación de usuario, dashboard, API y BD', 'Estructura del proyecto'],
                ['Datos de socios, reservas, pagos, productos y rutinas', 'Modelo de datos'],
                ['Creación de tablas y relaciones de la BD', 'Captura de la BD'],
            ],
            2 => [
                ['Configuración de frontend y rutas', 'Código del frontend'],
                ['Menú con secciones principales', 'Captura del menú'],
                ['Portada, mensaje y botón de reserva', 'Captura de portada'],
                ['Secciones de entrenamiento y gimnasio', 'Captura de secciones'],
                ['Pruebas responsive en distintos tamaños', 'Prueba responsive'],
            ],
            3 => [
                ['Diseño del inicio de sesión', 'Captura del login'],
                ['Formulario de registro de usuarios', 'Captura de registro'],
                ['Login y registro conectados con backend y BD', 'Registro en BD'],
                ['Validaciones de datos vacíos o incorrectos', 'Validaciones'],
                ['Pruebas y correcciones del acceso', 'Evidencia de pruebas'],
            ],
            4 => [
                ['Dashboard administrativo', 'Captura dashboard'],
                ['Módulos de socios, reservas, pagos, productos, entrenador y reportes', 'Menú de módulos'],
                ['Registro y listado de socios', 'CRUD de socios'],
                ['Edición y baja de socios y reservas', 'CRUD de reservas'],
                ['Persistencia de cambios en base de datos', 'Consulta de BD'],
            ],
            5 => [
                ['Reservas y relación con usuarios y socios', 'Captura de reservas'],
                ['Gestión de estados de reserva', 'Estados de reserva'],
                ['Productos con nombre, precio y stock', 'CRUD productos'],
                ['Fotografía guardada y visible en productos', 'Imagen de producto'],
                ['Pagos y socios contrastados con BD', 'Pruebas de módulos'],
            ],
            6 => [
                ['Asistencia e ingreso de socios', 'Módulo asistencia'],
                ['Seguimiento y progreso individual', 'Módulo seguimiento'],
                ['Rutinas por nivel y tipo de entrenamiento', 'Captura rutinas'],
                ['Entrenador principal', 'Sección entrenador'],
                ['Pruebas y corrección de funciones duplicadas', 'Pruebas dashboard'],
            ],
            7 => [
                ['Diseño coherente del dashboard', 'Captura dashboard'],
                ['Tarjetas, botones y espacios organizados', 'Captura interfaz'],
                ['Eliminación de elementos repetidos', 'Captura interfaz'],
                ['Login con el estilo del sistema', 'Captura login'],
                ['Navegación a las funciones correctas', 'Prueba de navegación'],
            ],
            8 => [
                ['Corrección de imágenes borrosas', 'Capturas de calidad'],
                ['Imágenes guardadas localmente para trabajar sin Internet', 'Carpeta imágenes'],
                ['Fotografías de entrenamiento, entrenador, productos y gimnasio', 'Capturas de imágenes'],
                ['Portada principal con imagen nítida', 'Captura de portada'],
                ['Pruebas de usuario, dashboard y BD', 'Evidencia de pruebas'],
            ],
            9 => [
                ['Reservas sincronizadas entre usuario y dashboard', 'Prueba usuario-dashboard'],
                ['Socios, productos y pagos comparados con BD', 'Consultas de BD'],
                ['Eliminación de registros duplicados o inconsistentes', 'Prueba CRUD'],
                ['Alerta de vencimiento de socios', 'Captura de alerta'],
                ['Asistencia, seguimiento y rutinas integrados', 'Prueba de módulos'],
            ],
            10 => [
                ['Flujo completo de pagos', 'Prueba de pagos'],
                ['Preparación y validación de la boleta electrónica', 'Boleta electrónica'],
                ['Fotos y recursos sin Internet externo', 'Prueba sin Internet'],
                ['Permisos y control de acceso por rol', 'Prueba de accesos'],
                ['Pruebas finales de módulos y registro de errores', 'Registro de errores'],
            ],
            11 => [
                ['Pruebas de login y registro', 'Prueba de autenticación'],
                ['Pruebas de módulos principales del dashboard', 'Checklist dashboard'],
                ['Consulta de duplicados y datos incompletos de BD', 'Consulta final BD'],
                ['Corrección de detalles de interfaz', 'Captura final'],
                ['Organización de evidencias y respaldo del proyecto', 'Documentación y respaldo'],
            ],
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

            if ($numero === 5) {
                foreach ($alertas as $alerta) {
                    if ($alerta['tipo'] === 'productos_prueba') {
                        $observaciones[] = $alerta['mensaje'];
                    }
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
                'actividades' => collect($actividadesBitacora[$numero] ?? [])
                    ->map(fn (array $item, int $i) => [
                        'numero' => $i + 1,
                        'actividad' => $item[0],
                        'evidencia' => $item[1],
                        'estado' => $numero >= 9 ? 'programada_por_validar' : 'evidencia_por_validar',
                    ])->values()->all(),
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
