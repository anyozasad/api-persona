<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class RepararVentasYVista extends Command
{
    protected $signature = 'db:reparar-ventas';

    protected $description = 'Repara columnas comerciales de ventas y reconstruye vista_ventas';

    public function handle(): int
    {
        if (!Schema::hasTable('ventas') || !Schema::hasTable('detalle_venta')) {
            $this->error('No existen las tablas ventas y/o detalle_venta.');
            return self::FAILURE;
        }

        try {
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
                if (!Schema::hasColumn('ventas', 'fecha_anulacion')) {
                    $table->dateTime('fecha_anulacion')->nullable()->after('estado');
                }
                if (!Schema::hasColumn('ventas', 'motivo_anulacion')) {
                    $table->text('motivo_anulacion')->nullable()->after('fecha_anulacion');
                }
                if (!Schema::hasColumn('ventas', 'id_usuario_anulacion')) {
                    $table->unsignedBigInteger('id_usuario_anulacion')->nullable()->after('motivo_anulacion');
                }
            });

            $p = DB::connection()->getTablePrefix();
            DB::statement("UPDATE {$p}ventas SET estado = 'Registrado' WHERE estado IS NULL OR TRIM(estado) = ''");

            DB::statement("DROP VIEW IF EXISTS {$p}vista_ventas");
            DB::statement("
CREATE VIEW {$p}vista_ventas AS
SELECT
    v.id_venta,
    v.fecha_venta,
    v.numero_comprobante,
    CONCAT(c.nombres, ' ', c.apellidos) AS cliente,
    pr.codigo_producto,
    pr.nombre_producto,
    dv.cantidad,
    dv.precio_unitario,
    dv.subtotal,
    v.metodo_pago,
    v.estado
FROM {$p}ventas v
INNER JOIN {$p}clientes c ON c.id_cliente = v.id_cliente
INNER JOIN {$p}detalle_venta dv ON dv.id_venta = v.id_venta
INNER JOIN {$p}productos pr ON pr.id_producto = dv.id_producto
WHERE COALESCE(v.estado, 'Registrado') <> 'Anulado'
");

            DB::table('vista_ventas')->limit(1)->get();

            $this->info('OK: ventas reparada y vista_ventas reconstruida correctamente.');
            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No se pudo reparar ventas/vista_ventas: '.$e->getMessage());
            return self::FAILURE;
        }
    }
}
