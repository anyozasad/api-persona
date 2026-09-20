<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('ventas') || !Schema::hasTable('detalle_venta')) {
            return;
        }

        // Compatibilidad con instalaciones antiguas:
        // la vista usa estas columnas, por eso deben existir ANTES de crearla.
        Schema::table('ventas', function (Blueprint $table) {
            if (!Schema::hasColumn('ventas', 'metodo_pago')) {
                $table->string('metodo_pago', 50)->default('Efectivo')->after('numero_comprobante');
            }

            if (!Schema::hasColumn('ventas', 'numero_operacion')) {
                $table->string('numero_operacion', 100)->nullable()->after('metodo_pago');
            }

            if (!Schema::hasColumn('ventas', 'estado')) {
                $table->string('estado', 30)->default('Registrado')->after('total');
            }
        });

        DB::statement("UPDATE ventas SET estado = 'Registrado' WHERE estado IS NULL OR TRIM(estado) = ''");

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
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS vista_ventas');
    }
};
