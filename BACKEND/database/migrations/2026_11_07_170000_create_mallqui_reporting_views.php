<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clientes') && Schema::hasTable('cliente_membresia') && Schema::hasTable('membresias')) {
            DB::statement('DROP VIEW IF EXISTS vista_clientes_membresias');
            DB::statement(<<<'SQL'
CREATE VIEW vista_clientes_membresias AS
SELECT
    c.id_cliente,
    c.dni,
    CONCAT(c.nombres, ' ', c.apellidos) AS cliente,
    m.nombre AS membresia,
    m.precio,
    cm.fecha_inicio,
    cm.fecha_fin,
    cm.estado
FROM clientes c
INNER JOIN cliente_membresia cm ON cm.id_cliente = c.id_cliente
INNER JOIN membresias m ON m.id_membresia = cm.id_membresia
SQL);
        }

        if (Schema::hasTable('productos') && Schema::hasTable('categorias')) {
            DB::statement('DROP VIEW IF EXISTS vista_stock');
            DB::statement(<<<'SQL'
CREATE VIEW vista_stock AS
SELECT
    pr.id_producto,
    pr.codigo_producto,
    ca.nombre_categoria AS categoria,
    pr.nombre_producto,
    pr.precio_compra,
    pr.precio_venta,
    pr.stock,
    pr.stock_minimo,
    pr.estado
FROM productos pr
INNER JOIN categorias ca ON ca.id_categoria = pr.id_categoria
SQL);
        }

        if (Schema::hasTable('ventas') && Schema::hasTable('clientes') &&
            Schema::hasTable('detalle_venta') && Schema::hasTable('productos')) {
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
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS vista_ventas');
        DB::statement('DROP VIEW IF EXISTS vista_stock');
        DB::statement('DROP VIEW IF EXISTS vista_clientes_membresias');
    }
};
