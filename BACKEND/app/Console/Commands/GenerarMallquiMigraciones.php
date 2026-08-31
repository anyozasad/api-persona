<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class GenerarMallquiMigraciones extends Command
{
    protected $signature = 'db:generar-interno {--force : Sobrescribe el contenido si ya existe una migracion con el mismo nombre}';

    protected $description = 'Genera con Artisan las migraciones del diagrama entidad-relacion del proyecto';

    public function handle(): int
    {
        $migraciones = $this->migraciones();

        $this->info('Generando migraciones del proyecto con Artisan...');

        foreach ($migraciones as $nombre => $contenido) {
            $patron = database_path("migrations/*_{$nombre}.php");
            $existentes = glob($patron) ?: [];

            if ($existentes && !$this->option('force')) {
                $this->warn("Ya existe {$nombre}; se omite.");
                continue;
            }

            if (!$existentes) {
                Artisan::call('make:migration', ['name' => $nombre]);
                $this->line(trim(Artisan::output()));
                sleep(1);
                $existentes = glob($patron) ?: [];
            }

            sort($existentes);
            $archivo = end($existentes);

            if (!$archivo) {
                $this->error("No se encontro el archivo generado para {$nombre}.");
                return self::FAILURE;
            }

            File::put($archivo, $contenido);
            $this->info('OK: '.basename($archivo));
        }

        $this->newLine();
        $this->info('Migraciones preparadas. Revisa database/migrations y luego ejecuta: php artisan migrate');
        $this->warn('No se ejecuto migrate automaticamente.');

        return self::SUCCESS;
    }

    private function migraciones(): array
    {
        return [
            'create_clientes_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('dni', 15)->unique();
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('sexo', 20)->nullable();
            $table->string('telefono', 25)->nullable();
            $table->string('correo', 150)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->dateTime('fecha_registro')->useCurrent();
            $table->string('estado', 30)->default('Activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
PHP,
            'create_membresias_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('membresias', function (Blueprint $table) {
            $table->id('id_membresia');
            $table->string('nombre', 100);
            $table->unsignedInteger('duracion_meses');
            $table->decimal('precio', 10, 2);
            $table->text('descripcion')->nullable();
            $table->string('estado', 30)->default('Activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membresias');
    }
};
PHP,
            'create_cliente_membresia_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cliente_membresia', function (Blueprint $table) {
            $table->id('id_cliente_membresia');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_membresia');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->string('estado', 30)->default('Activo');

            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreign('id_membresia')->references('id_membresia')->on('membresias')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_membresia');
    }
};
PHP,
            'create_pagos_membresia_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pagos_membresia', function (Blueprint $table) {
            $table->id('id_pago');
            $table->unsignedBigInteger('id_cliente_membresia');
            $table->dateTime('fecha_pago');
            $table->decimal('monto', 10, 2);
            $table->string('metodo_pago', 50);
            $table->string('numero_operacion', 100)->nullable();
            $table->text('observacion')->nullable();
            $table->string('estado_pago', 30)->default('Completado');

            $table->foreign('id_cliente_membresia')->references('id_cliente_membresia')->on('cliente_membresia')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos_membresia');
    }
};
PHP,
            'create_asistencias_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id('id_asistencia');
            $table->unsignedBigInteger('id_cliente');
            $table->dateTime('fecha_hora_entrada');
            $table->dateTime('fecha_hora_salida')->nullable();
            $table->text('observacion')->nullable();
            $table->string('estado', 30)->default('Registrado');

            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
PHP,
            'create_entrenadores_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('entrenadores', function (Blueprint $table) {
            $table->id('id_entrenador');
            $table->string('dni', 15)->unique();
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('telefono', 25)->nullable();
            $table->string('correo', 150)->nullable();
            $table->string('especialidad', 150)->nullable();
            $table->date('fecha_contratacion');
            $table->decimal('salario', 10, 2)->default(0);
            $table->string('estado', 30)->default('Activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entrenadores');
    }
};
PHP,
            'create_rutinas_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rutinas', function (Blueprint $table) {
            $table->id('id_rutina');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_entrenador');
            $table->string('nombre_rutina', 150);
            $table->string('objetivo', 150)->nullable();
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->string('estado', 30)->default('Activo');

            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreign('id_entrenador')->references('id_entrenador')->on('entrenadores')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rutinas');
    }
};
PHP,
            'create_detalle_rutina_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detalle_rutina', function (Blueprint $table) {
            $table->id('id_detalle_rutina');
            $table->unsignedBigInteger('id_rutina');
            $table->string('ejercicio', 150);
            $table->unsignedInteger('series');
            $table->unsignedInteger('repeticiones');
            $table->decimal('peso_recomendado', 8, 2)->nullable();
            $table->unsignedInteger('descanso_segundos')->nullable();
            $table->text('observaciones')->nullable();

            $table->foreign('id_rutina')->references('id_rutina')->on('rutinas')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_rutina');
    }
};
PHP,
            'create_categorias_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id('id_categoria');
            $table->string('nombre_categoria', 120);
            $table->text('descripcion')->nullable();
            $table->string('estado', 30)->default('Activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};
PHP,
            'create_productos_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');
            $table->unsignedBigInteger('id_categoria');
            $table->string('codigo_producto', 60)->unique();
            $table->string('nombre_producto', 150);
            $table->text('descripcion')->nullable();
            $table->decimal('precio_compra', 10, 2)->default(0);
            $table->decimal('precio_venta', 10, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('stock_minimo')->default(0);
            $table->string('unidad_medida', 50);
            $table->dateTime('fecha_registro')->useCurrent();
            $table->string('estado', 30)->default('Activo');

            $table->foreign('id_categoria')->references('id_categoria')->on('categorias')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
PHP,
            'create_usuarios_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre_usuario', 80)->unique();
            $table->string('contrasena');
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('dni', 15)->unique();
            $table->string('telefono', 25)->nullable();
            $table->string('correo', 150)->nullable();
            $table->string('rol', 50);
            $table->string('estado', 30)->default('Activo');
            $table->dateTime('fecha_registro')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
PHP,
            'create_proveedores_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('id_proveedor');
            $table->string('ruc', 20)->unique();
            $table->string('razon_social', 180);
            $table->string('contacto', 150)->nullable();
            $table->string('telefono', 25)->nullable();
            $table->string('correo', 150)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->string('estado', 30)->default('Activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proveedores');
    }
};
PHP,
            'create_compras_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id('id_compra');
            $table->unsignedBigInteger('id_proveedor');
            $table->unsignedBigInteger('id_usuario');
            $table->dateTime('fecha_compra');
            $table->string('tipo_comprobante', 50);
            $table->string('numero_comprobante', 80);
            $table->decimal('total', 12, 2);
            $table->string('estado', 30)->default('Registrado');

            $table->foreign('id_proveedor')->references('id_proveedor')->on('proveedores')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
PHP,
            'create_detalle_compra_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detalle_compra', function (Blueprint $table) {
            $table->id('id_detalle_compra');
            $table->unsignedBigInteger('id_compra');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_compra', 10, 2);
            $table->decimal('subtotal', 12, 2);

            $table->foreign('id_compra')->references('id_compra')->on('compras')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('id_producto')->references('id_producto')->on('productos')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_compra');
    }
};
PHP,
            'create_ventas_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ventas', function (Blueprint $table) {
            $table->id('id_venta');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_usuario');
            $table->dateTime('fecha_venta');
            $table->string('tipo_comprobante', 50);
            $table->string('numero_comprobante', 80);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('igv', 12, 2);
            $table->decimal('total', 12, 2);

            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
PHP,
            'create_detalle_venta_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('detalle_venta', function (Blueprint $table) {
            $table->id('id_detalle_venta');
            $table->unsignedBigInteger('id_venta');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 12, 2);

            $table->foreign('id_venta')->references('id_venta')->on('ventas')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('id_producto')->references('id_producto')->on('productos')->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_venta');
    }
};
PHP,
            'create_mallqui_views' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
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

        DB::statement(<<<'SQL'
CREATE VIEW vista_stock AS
SELECT
    p.id_producto,
    p.codigo_producto,
    c.nombre_categoria AS categoria,
    p.nombre_producto,
    p.precio_compra,
    p.precio_venta,
    p.stock,
    p.stock_minimo,
    p.estado
FROM productos p
INNER JOIN categorias c ON c.id_categoria = p.id_categoria
SQL);

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
    NULL AS metodo_pago
FROM ventas v
INNER JOIN clientes c ON c.id_cliente = v.id_cliente
INNER JOIN detalle_venta dv ON dv.id_venta = v.id_venta
INNER JOIN productos p ON p.id_producto = dv.id_producto
SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS vista_ventas');
        DB::statement('DROP VIEW IF EXISTS vista_stock');
        DB::statement('DROP VIEW IF EXISTS vista_clientes_membresias');
    }
};
PHP,
        ];
    }
}
