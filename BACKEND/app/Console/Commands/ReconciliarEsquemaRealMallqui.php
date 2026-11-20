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
        'progreso_medidas' => ['id', 'id_cliente', 'peso', 'grasa', 'cintura', 'brazo', 'fecha'],
        'admin_gym_records' => ['id', 'modulo', 'titulo', 'subtitulo', 'estado', 'fecha', 'monto', 'imagen_url', 'datos'],
        'configuracion_sistema' => ['id', 'nombre_gimnasio', 'ruc', 'telefono', 'correo', 'direccion', 'referencia', 'frase_publicitaria', 'horario_detalle', 'tarifa_diaria', 'mensaje_productos', 'hora_apertura', 'hora_cierre', 'dias_atencion', 'dias_aviso_vencimiento', 'minutos_cancelacion_reserva', 'dias_anticipacion_reserva', 'stock_minimo_default', 'notificar_vencimientos', 'notificar_stock_bajo', 'notificar_pagos_pendientes'],
        'sesiones_entrenamiento_casa' => ['id_sesion_casa', 'id_cliente', 'id_rutina', 'zona', 'fecha', 'duracion_segundos', 'ejercicios_total', 'ejercicios_completados', 'estado'],
        'detalle_sesion_entrenamiento' => ['id_detalle_sesion', 'id_sesion_casa', 'id_detalle_rutina', 'series_realizadas', 'repeticiones_realizadas', 'peso_utilizado', 'completado'],
        'personal_access_tokens' => ['id', 'tokenable_type', 'tokenable_id', 'name', 'token', 'abilities', 'last_used_at', 'expires_at', 'created_at', 'updated_at'],
        'notificaciones_cliente' => ['id_notificacion', 'id_cliente', 'titulo', 'mensaje', 'leida'],
        'solicitudes_soporte' => ['id_soporte', 'id_cliente', 'asunto', 'mensaje', 'estado'],
        'opiniones_cliente' => ['id_opinion', 'id_cliente', 'calificacion', 'comentario', 'estado'],
        'metas_cliente' => ['id_meta_cliente', 'id_cliente', 'sesiones_semanales'],
        'clases_favoritas' => ['id_favorito', 'id_cliente', 'id_clase'],
        'planes_entrenamiento_casa' => ['id_plan_casa', 'id_cliente', 'dias', 'zonas', 'activo'],
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

    public function handle(): int
    {
        $this->info('Revisando el esquema REAL de MySQL (sin borrar datos)...');
        try {
            DB::connection()->getPdo();
            foreach (self::MIGRACIONES_ADITIVAS as $nombre) {
                $archivo = database_path('migrations/'.$nombre);
                if (!is_file($archivo)) {
                    throw new \RuntimeException('Falta la migración de recuperación: '.$nombre);
                }
                // Solo ejecutar up() de archivos que verifican existencia.
                // No usar down(), fresh(), drop() ni sembrar datos ficticios.
                (require $archivo)->up();
            }

            $reparadas = 0;
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
                        $this->warn('No se pudo reparar '.$tabla.'.'.$columna. Revisar esquema antiguo y laravel.log.');
                        report($e);
                    }
                }
            }

            if ($pendientes !== []) {
                $this->error('No se completó el esquema: '.implode(', ', $pendientes));
                return self::FAILURE;
            }

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
            // Una columna generada mantiene el mismo ID en altas futuras.
            // No se crea una segunda secuencia ni se modifican claves antiguas.
            DB::statement('ALTER TABLE `'.$tabla.'` ADD COLUMN `'.$columna.'` BIGINT UNSIGNED GENERATED ALWAYS AS (`'.$autoAnterior.'`) STORED UNIQUE');
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
                || in_array($columna, ['fecha_registro','fecha_venta','fecha_compra','fecha_pago','fecha_movimiento','fecha_apertura','fecha_cierre','fecha_reserva','fecha_anulacion','fecha_respuesta'], true)) {
                $t->dateTime($columna)->nullable();
            } elseif (str_starts_with($columna, 'fecha_') || $columna === 'fecha') {
                $t->date($columna)->nullable();
            } elseif (str_starts_with($columna, 'hora_')) {
                $t->time($columna)->nullable();
            } elseif (str_starts_with($columna, 'precio') || str_starts_with($columna, 'monto')
                || in_array($columna, ['subtotal','igv','total','diferencia','salario','peso','grasa','cintura','brazo','peso_recomendado','peso_utilizado','tarifa_diaria'], true)) {
                $t->decimal($columna, 12, 2)->nullable();
            } elseif (in_array($columna, ['permite_reservas','activo','leida','completado','notificar_vencimientos','notificar_stock_bajo','notificar_pagos_pendientes'], true)) {
                $t->boolean($columna)->nullable();
            } elseif (str_starts_with($columna, 'stock') || str_starts_with($columna, 'ejercicios_')
                || in_array($columna, ['cantidad','series','repeticiones','calificacion','sesiones_semanales','cupo_maximo','duracion_meses','dias_aviso_vencimiento','minutos_cancelacion_reserva','dias_anticipacion_reserva','descanso_segundos','duracion_segundos','status','referencia_id'], true)) {
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
