<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class GenerarModulosOperativos extends Command
{
    protected $signature = 'db:operacion-interno {--force : Sobrescribe migraciones operativas existentes}';

    protected $description = 'Genera migraciones operativas: clases, reservas, caja, kardex, auditoria e integridad';

    public function handle(): int
    {
        foreach ($this->migraciones() as $nombre => $contenido) {
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
                $this->error("No se encontró el archivo generado para {$nombre}.");
                return self::FAILURE;
            }

            File::put($archivo, $contenido);
            $this->info('OK: '.basename($archivo));
        }

        return self::SUCCESS;
    }

    private function migraciones(): array
    {
        return [
            'create_clases_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clases', function (Blueprint $table) {
            $table->id('id_clase');
            $table->unsignedBigInteger('id_entrenador')->nullable();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->string('dia_semana', 20);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->unsignedInteger('cupo_maximo')->default(20);
            $table->string('estado', 30)->default('Activo');

            $table->foreign('id_entrenador')->references('id_entrenador')->on('entrenadores')->nullOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clases');
    }
};
PHP,
            'create_reservas_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id('id_reserva');
            $table->unsignedBigInteger('id_cliente');
            $table->unsignedBigInteger('id_clase');
            $table->date('fecha_clase');
            $table->dateTime('fecha_reserva')->useCurrent();
            $table->string('estado', 30)->default('Reservada');

            $table->foreign('id_cliente')->references('id_cliente')->on('clientes')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreign('id_clase')->references('id_clase')->on('clases')->restrictOnDelete()->cascadeOnUpdate();
            $table->index(['id_clase', 'fecha_clase'], 'reservas_clase_fecha_idx');
            $table->index(['id_cliente', 'fecha_clase'], 'reservas_cliente_fecha_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
PHP,
            'create_cajas_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cajas', function (Blueprint $table) {
            $table->id('id_caja');
            $table->unsignedBigInteger('id_usuario_apertura');
            $table->dateTime('fecha_apertura');
            $table->decimal('monto_inicial', 12, 2)->default(0);
            $table->dateTime('fecha_cierre')->nullable();
            $table->decimal('monto_esperado', 12, 2)->nullable();
            $table->decimal('monto_real', 12, 2)->nullable();
            $table->decimal('diferencia', 12, 2)->nullable();
            $table->string('estado', 20)->default('Abierta');
            $table->text('observacion')->nullable();

            $table->foreign('id_usuario_apertura')->references('id_usuario')->on('usuarios')->restrictOnDelete()->cascadeOnUpdate();
            $table->index(['estado', 'fecha_apertura'], 'cajas_estado_fecha_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cajas');
    }
};
PHP,
            'create_movimientos_caja_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('movimientos_caja', function (Blueprint $table) {
            $table->id('id_movimiento');
            $table->unsignedBigInteger('id_caja');
            $table->unsignedBigInteger('id_usuario');
            $table->string('tipo', 20);
            $table->string('origen', 50);
            $table->string('referencia_tipo', 80)->nullable();
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->string('descripcion', 255);
            $table->decimal('monto', 12, 2);
            $table->dateTime('fecha_movimiento')->useCurrent();
            $table->string('estado', 20)->default('Registrado');

            $table->foreign('id_caja')->references('id_caja')->on('cajas')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->restrictOnDelete()->cascadeOnUpdate();
            $table->index(['id_caja', 'fecha_movimiento'], 'movimientos_caja_fecha_idx');
            $table->index(['referencia_tipo', 'referencia_id'], 'movimientos_caja_ref_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_caja');
    }
};
PHP,
            'create_movimientos_inventario_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id('id_movimiento_inventario');
            $table->unsignedBigInteger('id_producto');
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('tipo', 20);
            $table->string('origen', 50);
            $table->string('referencia_tipo', 80)->nullable();
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->integer('cantidad');
            $table->integer('stock_anterior');
            $table->integer('stock_nuevo');
            $table->text('observacion')->nullable();
            $table->dateTime('fecha_movimiento')->useCurrent();

            $table->foreign('id_producto')->references('id_producto')->on('productos')->restrictOnDelete()->cascadeOnUpdate();
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->nullOnDelete()->cascadeOnUpdate();
            $table->index(['id_producto', 'fecha_movimiento'], 'mov_inv_producto_fecha_idx');
            $table->index(['referencia_tipo', 'referencia_id'], 'mov_inv_ref_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
    }
};
PHP,
            'create_auditorias_table' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('auditorias', function (Blueprint $table) {
            $table->id('id_auditoria');
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('usuario', 100)->nullable();
            $table->string('rol', 50)->nullable();
            $table->string('metodo', 10);
            $table->string('ruta', 255);
            $table->string('ip', 64)->nullable();
            $table->unsignedSmallInteger('status');
            $table->dateTime('fecha');

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->nullOnDelete()->cascadeOnUpdate();
            $table->index(['id_usuario', 'fecha'], 'auditorias_usuario_fecha_idx');
            $table->index(['ruta', 'fecha'], 'auditorias_ruta_fecha_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditorias');
    }
};
PHP,
            'add_integrity_indexes_to_business_tables' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pagos_membresia', function (Blueprint $table) {
            $table->unique('numero_operacion', 'pagos_membresia_numero_operacion_unique');
        });

        Schema::table('compras', function (Blueprint $table) {
            $table->unique('numero_comprobante', 'compras_numero_comprobante_unique');
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->unique('numero_comprobante', 'ventas_numero_comprobante_unique');
        });

        Schema::table('usuarios', function (Blueprint $table) {
            $table->unique('correo', 'usuarios_correo_unique');
        });
    }

    public function down(): void
    {
        Schema::table('pagos_membresia', function (Blueprint $table) {
            $table->dropUnique('pagos_membresia_numero_operacion_unique');
        });
        Schema::table('compras', function (Blueprint $table) {
            $table->dropUnique('compras_numero_comprobante_unique');
        });
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropUnique('ventas_numero_comprobante_unique');
        });
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropUnique('usuarios_correo_unique');
        });
    }
};
PHP,
        ];
    }
}
