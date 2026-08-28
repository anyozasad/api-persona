<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class VerificarMallquiBd extends Command
{
    protected $signature = 'db:verificar';

    protected $description = 'Verifica tablas, columnas, seguridad y vistas principales de la base de datos';

    public function handle(): int
    {
        $tablas = $this->tablas();
        $errores = 0;

        $this->info('Verificando base de datos...');
        $this->newLine();

        foreach ($tablas as $tabla => $columnas) {
            if (!Schema::hasTable($tabla)) {
                $this->error("FALTA tabla: {$tabla}");
                $errores++;
                continue;
            }

            $faltantes = array_values(array_filter(
                $columnas,
                fn (string $columna) => !Schema::hasColumn($tabla, $columna)
            ));

            if ($faltantes) {
                $this->error("{$tabla}: faltan columnas -> ".implode(', ', $faltantes));
                $errores += count($faltantes);
            } else {
                $this->info("OK tabla: {$tabla}");
            }
        }

        $this->newLine();
        $this->info('Verificando vistas...');

        foreach (['vista_clientes_membresias', 'vista_stock', 'vista_ventas'] as $vista) {
            try {
                DB::table($vista)->limit(1)->get();
                $this->info("OK vista: {$vista}");
            } catch (Throwable $e) {
                $this->error("FALTA o falla vista: {$vista}");
                $errores++;
            }
        }

        $this->newLine();

        if ($errores > 0) {
            $this->error("Verificación terminada con {$errores} problema(s).");
            return self::FAILURE;
        }

        $this->info('TODO OK: el esquema principal y los módulos operativos están completos.');
        return self::SUCCESS;
    }

    private function tablas(): array
    {
        return [
            'clientes' => [
                'id_cliente', 'dni', 'nombres', 'apellidos', 'sexo', 'telefono',
                'correo', 'direccion', 'fecha_nacimiento', 'fecha_registro', 'estado',
            ],
            'cliente_membresia' => [
                'id_cliente_membresia', 'id_cliente', 'id_membresia',
                'fecha_inicio', 'fecha_fin', 'estado',
            ],
            'membresias' => [
                'id_membresia', 'nombre', 'duracion_meses', 'precio', 'descripcion', 'estado',
            ],
            'pagos_membresia' => [
                'id_pago', 'id_cliente_membresia', 'fecha_pago', 'monto', 'metodo_pago',
                'numero_operacion', 'observacion', 'estado_pago',
            ],
            'asistencias' => [
                'id_asistencia', 'id_cliente', 'fecha_hora_entrada', 'fecha_hora_salida',
                'observacion', 'estado',
            ],
            'entrenadores' => [
                'id_entrenador', 'dni', 'nombres', 'apellidos', 'telefono', 'correo',
                'especialidad', 'fecha_contratacion', 'salario', 'estado',
            ],
            'rutinas' => [
                'id_rutina', 'id_cliente', 'id_entrenador', 'nombre_rutina', 'objetivo',
                'descripcion', 'fecha_inicio', 'fecha_fin', 'estado',
            ],
            'detalle_rutina' => [
                'id_detalle_rutina', 'id_rutina', 'ejercicio', 'series', 'repeticiones',
                'peso_recomendado', 'descanso_segundos', 'observaciones',
            ],
            'categorias' => [
                'id_categoria', 'nombre_categoria', 'descripcion', 'estado',
            ],
            'productos' => [
                'id_producto', 'id_categoria', 'codigo_producto', 'nombre_producto',
                'descripcion', 'precio_compra', 'precio_venta', 'stock', 'stock_minimo',
                'unidad_medida', 'fecha_registro', 'estado',
            ],
            'proveedores' => [
                'id_proveedor', 'ruc', 'razon_social', 'contacto', 'telefono', 'correo',
                'direccion', 'estado',
            ],
            'compras' => [
                'id_compra', 'id_proveedor', 'id_usuario', 'fecha_compra', 'tipo_comprobante',
                'numero_comprobante', 'total', 'estado',
            ],
            'detalle_compra' => [
                'id_detalle_compra', 'id_compra', 'id_producto', 'cantidad',
                'precio_compra', 'subtotal',
            ],
            'ventas' => [
                'id_venta', 'id_cliente', 'id_usuario', 'fecha_venta', 'tipo_comprobante',
                'numero_comprobante', 'subtotal', 'igv', 'total',
            ],
            'detalle_venta' => [
                'id_detalle_venta', 'id_venta', 'id_producto', 'cantidad',
                'precio_unitario', 'subtotal',
            ],
            'usuarios' => [
                'id_usuario', 'nombre_usuario', 'contrasena', 'nombres', 'apellidos',
                'dni', 'telefono', 'correo', 'rol', 'estado', 'fecha_registro',
            ],
            'clases' => [
                'id_clase', 'id_entrenador', 'nombre', 'descripcion', 'dia_semana',
                'hora_inicio', 'hora_fin', 'cupo_maximo', 'estado',
            ],
            'reservas' => [
                'id_reserva', 'id_cliente', 'id_clase', 'fecha_clase', 'fecha_reserva', 'estado',
            ],
            'personal_access_tokens' => [
                'id', 'tokenable_type', 'tokenable_id', 'name', 'token', 'abilities',
                'last_used_at', 'expires_at',
            ],
        ];
    }
}
