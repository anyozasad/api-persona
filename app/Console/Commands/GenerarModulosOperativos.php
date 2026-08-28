<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class GenerarModulosOperativos extends Command
{
    protected $signature = 'db:operacion-interno {--force : Sobrescribe migraciones operativas existentes}';

    protected $description = 'Genera las migraciones de clases, reservas e indices de integridad';

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

            $table->foreign('id_entrenador')
                ->references('id_entrenador')
                ->on('entrenadores')
                ->nullOnDelete()
                ->cascadeOnUpdate();
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

            $table->foreign('id_cliente')
                ->references('id_cliente')
                ->on('clientes')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreign('id_clase')
                ->references('id_clase')
                ->on('clases')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

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
