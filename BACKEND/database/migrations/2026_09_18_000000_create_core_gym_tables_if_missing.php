<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Esta migración NO borra ni reemplaza tablas existentes.
        // Solo completa una instalación donde faltan las tablas base de Mallqui Gym.

        if (!Schema::hasTable('clientes')) {
            Schema::create('clientes', function (Blueprint $table) {
                $table->bigIncrements('id_cliente');
                $table->string('dni', 15)->unique();
                $table->string('nombres', 100);
                $table->string('apellidos', 100);
                $table->string('sexo', 20)->nullable();
                $table->string('telefono', 25)->nullable();
                $table->string('correo', 150)->nullable()->unique();
                $table->string('direccion', 255)->nullable();
                $table->date('fecha_nacimiento')->nullable();
                $table->dateTime('fecha_registro')->nullable();
                $table->string('estado', 20)->default('Activo')->index();
                $table->string('foto_perfil', 255)->nullable();
                $table->string('enfoque_entrenamiento', 80)->nullable();
                $table->string('nivel_entrenamiento', 30)->nullable();
            });
        }

        if (!Schema::hasTable('entrenadores')) {
            Schema::create('entrenadores', function (Blueprint $table) {
                $table->bigIncrements('id_entrenador');
                $table->string('dni', 15)->unique();
                $table->string('nombres', 100);
                $table->string('apellidos', 100);
                $table->string('telefono', 25)->nullable();
                $table->string('correo', 150)->nullable()->unique();
                $table->string('especialidad', 150)->nullable();
                $table->date('fecha_contratacion');
                $table->decimal('salario', 12, 2)->default(0);
                $table->string('estado', 20)->default('Activo')->index();
            });
        }

        if (!Schema::hasTable('usuarios')) {
            Schema::create('usuarios', function (Blueprint $table) {
                $table->bigIncrements('id_usuario');
                $table->unsignedBigInteger('id_cliente')->nullable()->index();
                $table->unsignedBigInteger('id_entrenador')->nullable()->index();
                $table->string('nombre_usuario', 80)->unique();
                $table->string('contrasena', 255);
                $table->string('nombres', 100);
                $table->string('apellidos', 100);
                $table->string('dni', 15)->unique();
                $table->string('telefono', 25)->nullable();
                $table->string('correo', 150)->nullable()->unique();
                $table->string('rol', 30)->default('Cliente')->index();
                $table->string('estado', 20)->default('Activo')->index();
                $table->dateTime('fecha_registro')->nullable();
            });
        }

        if (!Schema::hasTable('membresias')) {
            Schema::create('membresias', function (Blueprint $table) {
                $table->bigIncrements('id_membresia');
                $table->string('nombre', 100)->unique();
                $table->unsignedInteger('duracion_meses')->default(1);
                $table->decimal('precio', 12, 2)->default(0);
                $table->string('descripcion', 500)->nullable();
                $table->json('beneficios')->nullable();
                $table->boolean('permite_reservas')->default(true);
                $table->string('estado', 20)->default('Activo')->index();
            });
        }

        if (!Schema::hasTable('cliente_membresia')) {
            Schema::create('cliente_membresia', function (Blueprint $table) {
                $table->bigIncrements('id_cliente_membresia');
                $table->unsignedBigInteger('id_cliente')->index();
                $table->unsignedBigInteger('id_membresia')->index();
                $table->date('fecha_inicio');
                $table->date('fecha_fin');
                $table->string('estado', 30)->default('Activo')->index();
                $table->index(['id_cliente', 'estado']);
            });
        }

        if (!Schema::hasTable('pagos_membresia')) {
            Schema::create('pagos_membresia', function (Blueprint $table) {
                $table->bigIncrements('id_pago');
                $table->unsignedBigInteger('id_cliente_membresia')->index();
                $table->dateTime('fecha_pago');
                $table->decimal('monto', 12, 2);
                $table->string('metodo_pago', 50);
                $table->string('numero_operacion', 100)->nullable()->index();
                $table->string('observacion', 500)->nullable();
                $table->string('estado_pago', 30)->default('Pendiente')->index();
            });
        }

        if (!Schema::hasTable('clases')) {
            Schema::create('clases', function (Blueprint $table) {
                $table->bigIncrements('id_clase');
                $table->unsignedBigInteger('id_entrenador')->nullable()->index();
                $table->string('nombre', 100);
                $table->string('descripcion', 500)->nullable();
                $table->string('dia_semana', 20)->nullable();
                $table->time('hora_inicio');
                $table->time('hora_fin');
                $table->unsignedInteger('cupo_maximo')->default(1);
                $table->string('estado', 20)->default('Activo')->index();
            });
        }

        if (!Schema::hasTable('reservas')) {
            Schema::create('reservas', function (Blueprint $table) {
                $table->bigIncrements('id_reserva');
                $table->unsignedBigInteger('id_cliente')->index();
                $table->unsignedBigInteger('id_clase')->index();
                $table->date('fecha_clase')->index();
                $table->dateTime('fecha_reserva')->nullable();
                $table->string('estado', 30)->default('Reservada')->index();
                $table->index(['id_cliente', 'id_clase', 'fecha_clase']);
            });
        }

        if (!Schema::hasTable('rutinas')) {
            Schema::create('rutinas', function (Blueprint $table) {
                $table->bigIncrements('id_rutina');
                $table->unsignedBigInteger('id_cliente')->index();
                $table->unsignedBigInteger('id_entrenador')->index();
                $table->string('nombre_rutina', 150);
                $table->string('objetivo', 150)->nullable();
                $table->text('descripcion')->nullable();
                $table->date('fecha_inicio')->index();
                $table->date('fecha_fin')->nullable();
                $table->string('estado', 30)->default('Activo')->index();
            });
        }

        if (!Schema::hasTable('detalle_rutina')) {
            Schema::create('detalle_rutina', function (Blueprint $table) {
                $table->bigIncrements('id_detalle_rutina');
                $table->unsignedBigInteger('id_rutina')->index();
                $table->string('ejercicio', 150);
                $table->unsignedInteger('series')->default(1);
                $table->unsignedInteger('repeticiones')->default(1);
                $table->decimal('peso_recomendado', 8, 2)->nullable();
                $table->unsignedInteger('descanso_segundos')->nullable();
                $table->string('observaciones', 500)->nullable();
                $table->string('zona', 30)->nullable();
                $table->string('equipo', 120)->nullable();
            });
        }

        if (!Schema::hasTable('asistencias')) {
            Schema::create('asistencias', function (Blueprint $table) {
                $table->bigIncrements('id_asistencia');
                $table->unsignedBigInteger('id_cliente')->index();
                $table->dateTime('fecha_hora_entrada')->index();
                $table->dateTime('fecha_hora_salida')->nullable();
                $table->string('observacion', 500)->nullable();
                $table->string('estado', 30)->default('Dentro')->index();
            });
        }

        if (!Schema::hasTable('categorias')) {
            Schema::create('categorias', function (Blueprint $table) {
                $table->bigIncrements('id_categoria');
                $table->string('nombre_categoria', 120)->unique();
                $table->string('descripcion', 500)->nullable();
                $table->string('estado', 20)->default('Activo')->index();
            });
        }

        if (!Schema::hasTable('productos')) {
            Schema::create('productos', function (Blueprint $table) {
                $table->bigIncrements('id_producto');
                $table->unsignedBigInteger('id_categoria')->index();
                $table->string('codigo_producto', 60)->unique();
                $table->string('nombre_producto', 150);
                $table->string('descripcion', 500)->nullable();
                $table->mediumText('foto')->nullable();
                $table->decimal('precio_compra', 12, 2)->nullable();
                $table->decimal('precio_venta', 12, 2)->default(0);
                $table->integer('stock')->default(0);
                $table->integer('stock_minimo')->default(0);
                $table->string('unidad_medida', 50)->default('Unidad');
                $table->dateTime('fecha_registro')->nullable();
                $table->string('estado', 20)->default('Activo')->index();
            });
        }

        if (!Schema::hasTable('proveedores')) {
            Schema::create('proveedores', function (Blueprint $table) {
                $table->bigIncrements('id_proveedor');
                $table->string('ruc', 20)->unique();
                $table->string('razon_social', 180);
                $table->string('contacto', 150)->nullable();
                $table->string('telefono', 25)->nullable();
                $table->string('correo', 150)->nullable();
                $table->string('direccion', 255)->nullable();
                $table->string('estado', 20)->default('Activo')->index();
            });
        }

        if (!Schema::hasTable('compras')) {
            Schema::create('compras', function (Blueprint $table) {
                $table->bigIncrements('id_compra');
                $table->unsignedBigInteger('id_proveedor')->index();
                $table->unsignedBigInteger('id_usuario')->index();
                $table->dateTime('fecha_compra')->index();
                $table->string('tipo_comprobante', 50);
                $table->string('numero_comprobante', 80)->unique();
                $table->decimal('total', 12, 2)->default(0);
                $table->string('estado', 30)->default('Registrado')->index();
            });
        }

        if (!Schema::hasTable('detalle_compra')) {
            Schema::create('detalle_compra', function (Blueprint $table) {
                $table->bigIncrements('id_detalle_compra');
                $table->unsignedBigInteger('id_compra')->index();
                $table->unsignedBigInteger('id_producto')->index();
                $table->unsignedInteger('cantidad');
                $table->decimal('precio_compra', 12, 2);
                $table->decimal('subtotal', 12, 2);
            });
        }

        if (!Schema::hasTable('ventas')) {
            Schema::create('ventas', function (Blueprint $table) {
                $table->bigIncrements('id_venta');
                $table->unsignedBigInteger('id_cliente')->index();
                $table->unsignedBigInteger('id_usuario')->index();
                $table->dateTime('fecha_venta')->index();
                $table->string('tipo_comprobante', 50);
                $table->string('numero_comprobante', 80)->unique();
                $table->string('metodo_pago', 50)->default('Efectivo');
                $table->string('numero_operacion', 100)->nullable()->index();
                $table->decimal('subtotal', 12, 2)->default(0);
                $table->decimal('igv', 12, 2)->default(0);
                $table->decimal('total', 12, 2)->default(0);
                $table->string('estado', 30)->default('Registrado')->index();
                $table->dateTime('fecha_anulacion')->nullable();
                $table->string('motivo_anulacion', 500)->nullable();
                $table->unsignedBigInteger('id_usuario_anulacion')->nullable()->index();
            });
        }

        if (!Schema::hasTable('detalle_venta')) {
            Schema::create('detalle_venta', function (Blueprint $table) {
                $table->bigIncrements('id_detalle_venta');
                $table->unsignedBigInteger('id_venta')->index();
                $table->unsignedBigInteger('id_producto')->index();
                $table->unsignedInteger('cantidad');
                $table->decimal('precio_unitario', 12, 2);
                $table->decimal('subtotal', 12, 2);
            });
        }

        if (!Schema::hasTable('cajas')) {
            Schema::create('cajas', function (Blueprint $table) {
                $table->bigIncrements('id_caja');
                $table->unsignedBigInteger('id_usuario_apertura')->index();
                $table->dateTime('fecha_apertura')->index();
                $table->decimal('monto_inicial', 12, 2)->default(0);
                $table->dateTime('fecha_cierre')->nullable();
                $table->decimal('monto_esperado', 12, 2)->nullable();
                $table->decimal('monto_real', 12, 2)->nullable();
                $table->decimal('diferencia', 12, 2)->nullable();
                $table->string('estado', 20)->default('Abierta')->index();
                $table->text('observacion')->nullable();
            });
        }

        if (!Schema::hasTable('movimientos_caja')) {
            Schema::create('movimientos_caja', function (Blueprint $table) {
                $table->bigIncrements('id_movimiento');
                $table->unsignedBigInteger('id_caja')->index();
                $table->unsignedBigInteger('id_usuario')->index();
                $table->string('tipo', 20)->index();
                $table->string('origen', 50);
                $table->string('referencia_tipo', 80)->nullable();
                $table->unsignedBigInteger('referencia_id')->nullable();
                $table->string('descripcion', 255);
                $table->decimal('monto', 12, 2);
                $table->dateTime('fecha_movimiento')->index();
                $table->string('estado', 30)->default('Registrado')->index();
            });
        }

        if (!Schema::hasTable('movimientos_inventario')) {
            Schema::create('movimientos_inventario', function (Blueprint $table) {
                $table->bigIncrements('id_movimiento_inventario');
                $table->unsignedBigInteger('id_producto')->index();
                $table->unsignedBigInteger('id_usuario')->nullable()->index();
                $table->string('tipo', 20)->index();
                $table->string('origen', 50);
                $table->string('referencia_tipo', 80)->nullable();
                $table->unsignedBigInteger('referencia_id')->nullable();
                $table->integer('cantidad');
                $table->integer('stock_anterior');
                $table->integer('stock_nuevo');
                $table->string('observacion', 500)->nullable();
                $table->dateTime('fecha_movimiento')->index();
            });
        }

        if (!Schema::hasTable('auditorias')) {
            Schema::create('auditorias', function (Blueprint $table) {
                $table->bigIncrements('id_auditoria');
                $table->unsignedBigInteger('id_usuario')->nullable()->index();
                $table->string('usuario', 100)->nullable();
                $table->string('rol', 40)->nullable();
                $table->string('metodo', 12)->nullable();
                $table->string('ruta', 500)->nullable();
                $table->string('ip', 45)->nullable();
                $table->unsignedSmallInteger('status')->nullable();
                $table->dateTime('fecha')->index();
            });
        }

        if (Schema::hasTable('ventas') && Schema::hasTable('clientes') &&
            Schema::hasTable('detalle_venta') && Schema::hasTable('productos')) {
            try {
                DB::statement('DROP VIEW IF EXISTS vista_ventas');
                DB::statement(<<<'SQL'
CREATE VIEW vista_ventas AS
SELECT
    v.id_venta,
    v.fecha_venta,
    v.numero_comprobante,
    CONCAT(c.nombres, ' ', c.apellidos) AS cliente,
    p.codigo_producto,
    p.nombre_producto,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal,
    v.metodo_pago,
    v.estado
FROM ventas v
INNER JOIN clientes c ON c.id_cliente = v.id_cliente
INNER JOIN detalle_venta dv ON dv.id_venta = v.id_venta
INNER JOIN productos p ON p.id_producto = dv.id_producto
WHERE COALESCE(v.estado, 'Registrado') <> 'Anulado'
SQL);
            } catch (Throwable $e) {
                // La vista no debe impedir que las tablas funcionales queden creadas.
            }
        }
    }

    public function down(): void
    {
        // No se eliminan tablas aquí porque esta migración puede coexistir
        // con una base previa del usuario. Evitamos pérdida accidental de datos.
    }
};
