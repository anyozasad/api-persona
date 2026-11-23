<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Repara el esquema que realmente existe, incluso cuando migrations registra
 * una creación anterior cuyo objeto ya no está. No elimina tablas ni filas.
 * Ejecutar solo después de verificar un respaldo SQL nuevo.
 */
class ReconciliarEsquemaRealMallqui extends Command
{
    protected $signature = 'db:reconciliar-esquema';
    protected $description = 'Recupera tablas y columnas reales pendientes sin borrar registros';

    private const REQUERIDAS = [
        'clientes' => ['id_cliente', 'dni', 'nombres', 'apellidos', 'sexo', 'telefono', 'correo', 'direccion', 'fecha_nacimiento', 'fecha_registro', 'estado', 'foto_perfil', 'enfoque_entrenamiento', 'nivel_entrenamiento', 'whatsapp_api_key'],
        'cliente_membresia' => ['id_cliente_membresia', 'id_cliente', 'id_membresia', 'fecha_inicio', 'fecha_fin', 'estado'],
        'membresias' => ['id_membresia', 'nombre', 'duracion_meses', 'precio', 'descripcion', 'beneficios', 'permite_reservas', 'estado'],
        'pagos_membresia' => ['id_pago', 'id_cliente_membresia', 'fecha_pago', 'monto', 'metodo_pago', 'numero_operacion', 'observacion', 'estado_pago'],
        'asistencias' => ['id_asistencia', 'id_cliente', 'fecha_hora_entrada', 'fecha_hora_salida', 'observacion', 'estado'],
        'entrenadores' => ['id_entrenador', 'dni', 'nombres', 'apellidos', 'telefono', 'correo', 'especialidad', 'fecha_contratacion', 'salario', 'estado'],
        'rutinas' => ['id_rutina', 'id_cliente', 'id_entrenador', 'nombre_rutina', 'objetivo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'estado'],
        'detalle_rutina' => ['id_detalle_rutina', 'id_rutina', 'ejercicio', 'series', 'repeticiones', 'peso_recomendado', 'descanso_segundos', 'observaciones', 'zona', 'equipo'],
        'categorias' => ['id_categoria', 'nombre_categoria', 'descripcion', 'estado'],
        'productos' => ['id_producto', 'id_categoria', 'codigo_producto', 'nombre_producto', 'descripcion', 'foto', 'precio_compra', 'precio_venta', 'stock', 'stock_minimo', 'unidad_medida', 'fecha_registro', 'estado'],
        'proveedores' => ['id_proveedor', 'ruc', 'razon_social', 'contacto', 'telefono', 'correo', 'direccion', 'estado'],
        'compras' => ['id_compra', 'id_proveedor', 'id_usuario', 'fecha_compra', 'tipo_comprobante', 'numero_comprobante', 'total', 'estado'],
        'detalle_compra' => ['id_detalle_compra', 'id_compra', 'id_producto', 'cantidad', 'precio_compra', 'subtotal'],
        'ventas' => ['id_venta', 'id_cliente', 'id_usuario', 'fecha_venta', 'tipo_comprobante', 'numero_comprobante', 'metodo_pago', 'numero_operacion', 'subtotal', 'igv', 'total', 'estado', 'fecha_anulacion', 'motivo_anulacion', 'id_usuario_anulacion'],
        'detalle_venta' => ['id_detalle_venta', 'id_venta', 'id_producto', 'cantidad', 'precio_unitario', 'subtotal'],
        'usuarios' => ['id_usuario', 'nombre_usuario', 'contrasena', 'nombres', 'apellidos', 'dni', 'telefono', 'correo', 'id_cliente', 'id_entrenador', 'rol', 'estado', 'fecha_registro'],
        'clases' => ['id_clase', 'id_entrenador', 'nombre', 'descripcion', 'dia_semana', 'hora_inicio', 'hora_fin', 'cupo_maximo', 'estado'],
        'reservas' => ['id_reserva', 'id_cliente', 'id_clase', 'fecha_clase', 'fecha_reserva', 'estado'],
        'cajas' => ['id_caja', 'id_usuario_apertura', 'fecha_apertura', 'monto_inicial', 'fecha_cierre', 'monto_esperado', 'monto_real', 'diferencia', 'estado', 'observacion'],
        'movimientos_caja' => ['id_movimiento', 'id_caja', 'id_usuario', 'tipo', 'origen', 'referencia_tipo', 'referencia_id', 'descripcion', 'monto', 'fecha_movimiento', 'estado'],
        'movimientos_inventario' => ['id_movimiento_inventario', 'id_producto', 'id_usuario', 'tipo', 'origen', 'referencia_tipo', 'referencia_id', 'cantidad', 'stock_anterior', 'stock_nuevo', 'observacion', 'fecha_movimiento'],
        'auditorias' => ['id_auditoria', 'id_usuario', 'usuario', 'rol', 'metodo', 'ruta', 'ip', 'status', 'fecha'],
        'progreso_medidas' => ['id', 'id_cliente', 'peso', 'grasa', 'cintura', 'brazo', 'fecha', 'created_at'],
        'admin_gym_records' => ['id', 'modulo', 'titulo', 'subtitulo', 'estado', 'fecha', 'monto', 'imagen_url', 'datos', 'created_at', 'updated_at'],
        'configuracion_sistema' => ['id', 'nombre_gimnasio', 'ruc', 'telefono', 'correo', 'direccion', 'referencia', 'frase_publicitaria', 'horario_detalle', 'tarifa_diaria', 'mensaje_productos', 'hora_apertura', 'hora_cierre', 'dias_atencion', 'dias_aviso_vencimiento', 'minutos_cancelacion_reserva', 'dias_anticipacion_reserva', 'stock_minimo_default', 'notificar_vencimientos', 'notificar_stock_bajo', 'notificar_pagos_pendientes', 'created_at', 'updated_at'],
        'sesiones_entrenamiento_casa' => ['id_sesion_casa', 'id_cliente', 'id_rutina', 'zona', 'fecha', 'duracion_segundos', 'ejercicios_total', 'ejercicios_completados', 'estado', 'created_at', 'updated_at'],
        'detalle_sesion_entrenamiento' => ['id_detalle_sesion', 'id_sesion_casa', 'id_detalle_rutina', 'series_realizadas', 'repeticiones_realizadas', 'peso_utilizado', 'completado', 'created_at', 'updated_at'],
        'personal_access_tokens' => ['id', 'tokenable_type', 'tokenable_id', 'name', 'token', 'abilities', 'last_used_at', 'expires_at', 'created_at', 'updated_at'],
        'notificaciones_cliente' => ['id_notificacion', 'id_cliente', 'titulo', 'mensaje', 'leida', 'tipo', 'fecha', 'created_at', 'updated_at'],
        'solicitudes_soporte' => ['id_soporte', 'id_cliente', 'asunto', 'mensaje', 'estado', 'respuesta', 'fecha', 'fecha_respuesta', 'created_at', 'updated_at'],
        'opiniones_cliente' => ['id_opinion', 'id_cliente', 'calificacion', 'comentario', 'estado', 'categoria', 'fecha', 'created_at', 'updated_at'],
        'metas_cliente' => ['id_meta_cliente', 'id_cliente', 'sesiones_semanales', 'recordatorios', 'created_at', 'updated_at'],
        'clases_favoritas' => ['id_favorito', 'id_cliente', 'id_clase', 'created_at', 'updated_at'],
        'planes_entrenamiento_casa' => ['id_plan_casa', 'id_cliente', 'dias', 'zonas', 'activo', 'objetivo', 'created_at', 'updated_at'],
    ];

    private const MIGRACIONES_ADITIVAS = [
        '2026_09_18_000000_create_core_gym_tables_if_missing.php',
        '2026_09_21_163500_create_configuracion_sistema_table.php',
        '2026_09_21_173600_create_planes_entrenamiento_casa_table.php',
        '2026_09_21_173700_create_sesiones_entrenamiento_casa_table.php',
        '2026_09_25_130000_create_notificaciones_cliente_table.php',
        '2026_09_25_130100_create_solicitudes_soporte_table.php',
        '2026_09_25_140000_create_metas_cliente_table.php',
        '2026_09_25_150000_create_clases_favoritas_table.php',
        '2026_09_25_150100_create_opiniones_cliente_table.php',
        '2026_11_20_180000_recuperar_modulos_dashboard_existentes.php',
        '2026_11_20_145000_reparar_clientes_legacy_para_acceso.php',
        '2026_10_02_160000_complete_training_sessions_and_memberships.php',
        '2026_10_15_123000_complete_portal_functionality_fields.php',
        '2026_11_07_171000_add_progress_and_whatsapp_to_core_schema.php',
        '2026_11_07_230000_ensure_usuarios_identity.php',
        '2026_11_07_231000_ensure_usuarios_auth_fields.php',
        '2026_11_07_232000_expand_usuarios_rol.php',
        '2026_11_07_233000_ensure_sanctum_tokens_table.php',
        '2026_11_12_120000_repair_legacy_auth_tokens_and_user_ids.php',
        '2026_11_08_100000_ensure_admin_gym_records_for_applications.php',
        '2026_11_12_110000_complete_legacy_reservas_without_losing_rows.php',
    ];

    public static function requisitos(): array
    {
        return self::REQUERIDAS;
    }

    /** Verifica datos legacy que pueden quedar sin copiar aunque las
     *  columnas ya existan. Devuelve solo tablas, nunca datos personales.
     */
    public static function integridadCatalogoPendiente(): array
    {
        $pares = [
            'categorias' => ['id_categoria' => 'id', 'nombre_categoria' => 'nombre'],
            'productos' => [
                'id_producto' => 'id', 'id_categoria' => 'categoria_id',
                'codigo_producto' => 'codigo', 'nombre_producto' => 'nombre',
            ],
        ];
        $pendientes = [];
        foreach ($pares as $tabla => $alias) {
            if (!Schema::hasTable($tabla)) {
                continue;
            }
            $columnas = array_fill_keys(Schema::getColumnListing($tabla), true);
            $firmaLegacy = $tabla === 'productos'
                ? ['id', 'categoria_id', 'codigo', 'nombre']
                : ['id', 'nombre'];
            if (array_diff($firmaLegacy, array_keys($columnas)) !== []) {
                continue;
            }
            $paresExistentes = array_filter(
                $alias,
                fn (string $origen, string $nuevo) => isset($columnas[$nuevo], $columnas[$origen]),
                ARRAY_FILTER_USE_BOTH
            );
            if ($paresExistentes === []) {
                continue;
            }
            $desajuste = DB::table($tabla)->where(function ($q) use ($paresExistentes) {
                foreach ($paresExistentes as $nuevo => $origen) {
                    $q->orWhereNull($nuevo)->orWhereColumn($nuevo, '<>', $origen);
                }
            })->exists();
            if ($desajuste) {
                $pendientes[] = 'integridad:'.$tabla;
            }
        }
        return $pendientes;
    }

    public function handle(): int
    {
        $this->info('Revisando el esquema REAL de MySQL (sin borrar datos)...');
        try {
            DB::connection()->getPdo();

            // Una migración legacy defectuosa no debe impedir que se
            // intenten recuperar las demás tablas. Se registra la causa
            // y se verifica TODO el esquema antes de declarar éxito.
            $erroresMigraciones = [];
            foreach (self::MIGRACIONES_ADITIVAS as $nombre) {
                $archivo = database_path('migrations/'.$nombre);
                if (!is_file($archivo)) {
                    $erroresMigraciones[$nombre] = 'archivo ausente';
                    $this->warn('Falta el archivo de migración: '.$nombre);
                    continue;
                }
                try {
                    // Solo up() aditivos. Nunca down(), fresh() o drop().
                    (require $archivo)->up();
                } catch (Throwable $e) {
                    $erroresMigraciones[$nombre] = $e->getMessage();
                    $this->warn('Falló una migración de recuperación: '.$nombre.'. Se revisarán las restantes.');
                    report($e);
                }
            }

            $reparadas = 0;
            $pendientes = $this->completarColumnas($reparadas);

            if ($erroresMigraciones !== []) {
                // Esquemas XAMPP incompletos pueden no tener aún la columna
                // indicada por ->after('id_cliente') o ->after('descripcion').
                // La fase anterior ya recuperó esas dependencias: reintentar
                // SOLO migraciones que fallaron, sin ejecutar down ni borrar filas.
                $pendientesReintento = $erroresMigraciones;
                $erroresMigraciones = [];
                foreach ($pendientesReintento as $nombre => $motivo) {
                    $archivo = database_path('migrations/'.$nombre);
                    if (!is_file($archivo)) {
                        $erroresMigraciones[$nombre] = 'archivo ausente';
                        continue;
                    }
                    try {
                        (require $archivo)->up();
                        $this->info('Recuperada migración después de completar columnas: '.$nombre);
                    } catch (Throwable $e) {
                        $erroresMigraciones[$nombre] = $e->getMessage();
                        report($e);
                    }
                }
                // Una migración recuperada puede haber creado tablas nuevas
                // que todavía no existían durante la primera revisión.
                // Revisar también sus columnas antes de decidir el resultado.
                $pendientes = $this->completarColumnas($reparadas);
                if ($erroresMigraciones !== []) {
                    foreach ($erroresMigraciones as $nombre => $motivo) {
                        $this->warn('Migración pendiente: '.$nombre.' - '.$motivo);
                    }
                    $this->error('Hay migraciones que siguen fallando tras completar el esquema. El respaldo SQL se conserva.');
                    return self::FAILURE;
                }
            }

            if ($pendientes !== []) {
                $this->error('No se completó el esquema: '.implode(', ', $pendientes));
                return self::FAILURE;
            }

            // Las tablas originales siguen escribiendo codigo/nombre/categoria_id.
            // Rellenar sus equivalentes modernos para vistas y reportes sin
            // modificar los campos originales ni descartar fotografías.
            $this->sincronizarAliasesCatalogo();

            // Sincronizar socios y planes históricos después de crear las
            // tablas modernas, pero antes de consultar reportes y vistas.
            // Nunca convertir una suscripción en pago confirmado.
            $this->importarDatosLegado();

            // Las vistas son consultas derivadas, no contienen filas propias.
            // Si una tabla incompleta las invalidó, reconstruirlas al final,
            // cuando todas las columnas existen, aunque migrations diga aplicado.
            $vistas = database_path('migrations/2026_11_07_170000_create_mallqui_reporting_views.php');
            (require $vistas)->up();
            foreach (['vista_clientes_membresias', 'vista_stock', 'vista_ventas'] as $vista) {
                DB::table($vista)->limit(1)->get();
            }

            $this->info('Tablas, columnas y vistas recuperadas. Columnas añadidas: '.$reparadas);
            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No fue posible reparar la base: '.$e->getMessage());
            report($e);
            return self::FAILURE;
        }
    }

    /**
     * Inspección reutilizable para instalaciones XAMPP con migraciones
     * incompletas. Mantiene las filas existentes y sólo agrega columnas.
     * Devuelve los elementos que siguen ausentes en ESTE intento.
     */
    private function completarColumnas(int &$reparadas): array
    {
        $pendientes = [];
        foreach (self::REQUERIDAS as $tabla => $columnas) {
            if (!Schema::hasTable($tabla)) {
                $pendientes[] = 'tabla:'.$tabla;
                continue;
            }
            foreach ($columnas as $i => $columna) {
                if (Schema::hasColumn($tabla, $columna)) {
                    continue;
                }
                try {
                    if ($i === 0) {
                        $this->repararIdentificador($tabla, $columna);
                    } else {
                        $this->agregarColumna($tabla, $columna);
                    }
                    ++$reparadas;
                    $this->line('Agregada: '.$tabla.'.'.$columna);
                } catch (Throwable $e) {
                    $pendientes[] = $tabla.'.'.$columna;
                    $this->warn('No se pudo reparar '.$tabla.'.'.$columna.'. Revisar esquema antiguo y laravel.log.');
                    report($e);
                }
            }
        }

        return $pendientes;
    }

    /**
     * Copia valores existentes de categorías y productos legacy a columnas
     * que el catálogo y las vistas modernas necesitan. Es idempotente.
     */
    private function sincronizarAliasesCatalogo(): void
    {
        $compatibilidades = [
            'categorias' => [
                'id_categoria' => 'id',
                'nombre_categoria' => 'nombre',
            ],
            'productos' => [
                'id_producto' => 'id',
                'id_categoria' => 'categoria_id',
                'codigo_producto' => 'codigo',
                'nombre_producto' => 'nombre',
            ],
        ];
        foreach ($compatibilidades as $tabla => $alias) {
            if (!Schema::hasTable($tabla)) {
                continue;
            }
            $campos = array_fill_keys(Schema::getColumnListing($tabla), true);
            $firmaLegacy = $tabla === 'productos'
                ? ['id', 'categoria_id', 'codigo', 'nombre']
                : ['id', 'nombre'];
            if (array_diff($firmaLegacy, array_keys($campos)) !== []) {
                continue;
            }
            foreach ($alias as $nuevo => $anterior) {
                if (!isset($campos[$nuevo], $campos[$anterior])) {
                    continue;
                }
                // Nombre y código antiguos pueden ser obligatorios; solo
                // rellenar la copia nueva cuando aún está sin contenido.
                DB::table($tabla)
                    ->where(function ($q) use ($nuevo, $anterior) {
                        $q->whereNull($nuevo)->orWhereColumn($nuevo, '<>', $anterior);
                    })
                    ->update([$nuevo => DB::raw('`'.$anterior.'`')]);
            }
        }
    }

    /**
     * Cuando gym_system contiene socios/planes/suscripciones, importar las
     * entidades que todavía no están representadas en clientes/membresias.
     * Solo inserta faltantes. No borra, no renombra, ni pisa registros nuevos.
     */
    private function importarDatosLegado(): void
    {
        if (Schema::hasTable('planes') && Schema::hasTable('membresias')) {
            $campos = array_fill_keys(Schema::getColumnListing('planes'), true);
            if (isset($campos['id'], $campos['nombre'])) {
                DB::table('planes')->orderBy('id')->chunk(100, function ($planes) {
                    foreach ($planes as $p) {
                        $nombre = trim((string) ($p->nombre ?? ''));
                        if ($nombre === '' || mb_strlen($nombre) > 100) continue;
                        if (DB::table('membresias')->where('nombre', $nombre)->exists()) continue;
                        $dias = max(1, (int)($p->duracion_dias ?? 30));
                        DB::table('membresias')->insert([
                            'nombre' => $nombre,
                            'duracion_meses' => max(1, (int)ceil($dias / 30)),
                            'precio' => max(0, (float)($p->precio ?? 0)),
                            'descripcion' => $p->descripcion ?? null,
                            'estado' => strtolower((string)($p->estado ?? 'activo')) === 'activo'
                                ? 'Activo' : 'Inactivo',
                        ]);
                    }
                });
            }
        }

        if (Schema::hasTable('socios') && Schema::hasTable('clientes')) {
            $campos = array_fill_keys(Schema::getColumnListing('socios'), true);
            if (isset($campos['id'], $campos['dni'], $campos['nombre'])) {
                DB::table('socios')->orderBy('id')->chunk(100, function ($socios) {
                    foreach ($socios as $s) {
                        $dni = trim((string)($s->dni ?? ''));
                        $nombre = trim((string)($s->nombre ?? ''));
                        // No inventar DNI ni una persona distinta para
                        // superar una restricción UNIQUE.
                        if ($dni === '' || mb_strlen($dni) > 15 || $nombre === '') continue;
                        if (DB::table('clientes')->where('dni', $dni)->exists()) continue;
                        $partes = preg_split('/\s+/u', $nombre, 2);
                        $correo = trim((string)($s->email ?? ''));
                        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)
                            || DB::table('clientes')->where('correo', $correo)->exists()) {
                            $correo = null;
                        }
                        DB::table('clientes')->insert([
                            'dni' => $dni,
                            'nombres' => mb_substr($partes[0], 0, 100),
                            'apellidos' => mb_substr($partes[1] ?? '', 0, 100),
                            'telefono' => mb_substr((string)($s->telefono ?? ''), 0, 25) ?: null,
                            'correo' => $correo,
                            'fecha_registro' => $s->fecha_registro ?? null,
                            'estado' => strtolower((string)($s->estado ?? 'activo')) === 'activo'
                                ? 'Activo' : 'Inactivo',
                        ]);
                    }
                });
            }
        }

        if (Schema::hasTable('suscripciones') && Schema::hasTable('cliente_membresia')
            && Schema::hasTable('socios') && Schema::hasTable('planes')) {
            $campos = array_fill_keys(Schema::getColumnListing('suscripciones'), true);
            if (!isset($campos['id'], $campos['socio_id'], $campos['plan_id'],
                $campos['fecha_inicio'], $campos['fecha_fin'])) {
                return;
            }
            DB::table('suscripciones')->orderBy('id')->chunk(100, function ($subs) {
                foreach ($subs as $s) {
                    $socio = DB::table('socios')->where('id', $s->socio_id)->first();
                    $plan = DB::table('planes')->where('id', $s->plan_id)->first();
                    if (!$socio || !$plan || empty($s->fecha_inicio) || empty($s->fecha_fin)) continue;
                    $idCliente = DB::table('clientes')->where('dni', trim((string)($socio->dni ?? '')))
                        ->value('id_cliente');
                    $idPlan = DB::table('membresias')->where('nombre', (string)($plan->nombre ?? ''))
                        ->value('id_membresia');
                    if (!$idCliente || !$idPlan) continue;
                    $existe = DB::table('cliente_membresia')
                        ->where('id_cliente', $idCliente)->where('id_membresia', $idPlan)
                        ->whereDate('fecha_inicio', $s->fecha_inicio)
                        ->whereDate('fecha_fin', $s->fecha_fin)->exists();
                    if ($existe) continue;
                    $estado = strtolower((string)($s->estado ?? 'activa'));
                    DB::table('cliente_membresia')->insert([
                        'id_cliente' => $idCliente,
                        'id_membresia' => $idPlan,
                        'fecha_inicio' => $s->fecha_inicio,
                        'fecha_fin' => $s->fecha_fin,
                        'estado' => in_array($estado, ['activa','activo'], true)
                            ? 'Activo' : 'Vencido',
                    ]);
                }
            });
        }
    }

    private function repararIdentificador(string $tabla, string $columna): void
    {
        $motor = DB::connection()->getDriverName();
        if (!in_array($motor, ['mysql', 'mariadb'], true)) {
            throw new \RuntimeException('El identificador legacy solo se repara en MySQL/MariaDB.');
        }
        foreach ([$tabla, $columna] as $nombre) {
            if (!preg_match('/^[a-z_][a-z0-9_]*$/i', $nombre)) {
                throw new \RuntimeException('Identificador no permitido.');
            }
        }
        $autoAnterior = null;
        foreach (DB::select('SHOW COLUMNS FROM `'.$tabla.'`') as $campo) {
            if (str_contains(strtolower((string) ($campo->Extra ?? '')), 'auto_increment')) {
                $autoAnterior = (string) $campo->Field;
                break;
            }
        }

        if ($autoAnterior !== null && $autoAnterior !== $columna) {
            if (!preg_match('/^[a-z_][a-z0-9_]*$/i', $autoAnterior)) {
                throw new \RuntimeException('Columna auto incremental anterior no permitida.');
            }
            // MySQL 8 y MariaDB NO permiten una columna GENERATED que dependa
            // de una columna AUTO_INCREMENT. Mantener el ID original y agregar
            // una referencia normal, nullable y única; copiar los IDs existentes.
            // Los controladores legacy actualizan el alias en cada nuevo INSERT.
            DB::statement('ALTER TABLE `'.$tabla.'` ADD COLUMN `'.$columna.'` BIGINT UNSIGNED NULL UNIQUE');
            DB::statement('UPDATE `'.$tabla.'` SET `'.$columna.'` = `'.$autoAnterior.'` WHERE `'.$columna.'` IS NULL');
            return;
        }
        DB::statement('ALTER TABLE `'.$tabla.'` ADD COLUMN `'.$columna.'` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE');
    }

    private function agregarColumna(string $tabla, string $columna): void
    {
        Schema::table($tabla, function (Blueprint $t) use ($tabla, $columna) {
            if (str_starts_with($columna, 'id_') || $columna === 'tokenable_id' || $columna === 'referencia_id') {
                $t->unsignedBigInteger($columna)->nullable();
            } elseif ($columna === 'foto') {
                $t->mediumText($columna)->nullable();
            } elseif (in_array($columna, ['dias','zonas','abilities'], true)) {
                $t->longText($columna)->nullable();
            } elseif (in_array($columna, ['beneficios','datos','dias_atencion'], true)) {
                $t->json($columna)->nullable();
            } elseif (in_array($columna, ['descripcion','observacion','observaciones','mensaje','mensaje_productos','horario_detalle','frase_publicitaria','respuesta','comentario'], true)) {
                $t->text($columna)->nullable();
            } elseif (str_starts_with($columna, 'fecha_hora_') || str_ends_with($columna, '_at')
                || in_array($columna, ['fecha_registro','fecha_venta','fecha_compra','fecha_pago','fecha_movimiento','fecha_apertura','fecha_cierre','fecha_reserva','fecha_anulacion','fecha_respuesta'], true)
                || ($columna === 'fecha' && in_array($tabla, ['notificaciones_cliente','solicitudes_soporte','opiniones_cliente'], true))) {
                $t->dateTime($columna)->nullable();
            } elseif (str_starts_with($columna, 'fecha_') || $columna === 'fecha') {
                $t->date($columna)->nullable();
            } elseif (str_starts_with($columna, 'hora_')) {
                $t->time($columna)->nullable();
            } elseif (str_starts_with($columna, 'precio') || str_starts_with($columna, 'monto')
                || in_array($columna, ['subtotal','igv','total','diferencia','salario','peso','grasa','cintura','brazo','peso_recomendado','peso_utilizado','tarifa_diaria'], true)) {
                $t->decimal($columna, 12, 2)->nullable();
            } elseif (in_array($columna, ['permite_reservas','activo','leida','completado','recordatorios','notificar_vencimientos','notificar_stock_bajo','notificar_pagos_pendientes'], true)) {
                $t->boolean($columna)->nullable();
            } elseif (str_starts_with($columna, 'stock') || str_starts_with($columna, 'ejercicios_')
                || in_array($columna, ['cantidad','series','repeticiones','series_realizadas','repeticiones_realizadas','calificacion','stock_minimo_default','sesiones_semanales','cupo_maximo','duracion_meses','dias_aviso_vencimiento','minutos_cancelacion_reserva','dias_anticipacion_reserva','descanso_segundos','duracion_segundos','status','referencia_id'], true)) {
                $t->integer($columna)->nullable();
            } elseif ($columna === 'token') {
                $t->string($columna, 64)->nullable();
            } elseif ($columna === 'contrasena') {
                $t->string($columna, 255)->nullable();
            } else {
                $t->string($columna, 255)->nullable();
            }
        });
    }
}
