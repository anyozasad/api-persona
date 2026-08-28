<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class GenerarAjustesProduccion extends Command
{
    protected $signature = 'db:produccion-interno {--force : Sobrescribe migraciones de ajustes de produccion}';

    protected $description = 'Genera ajustes de base necesarios para operacion empresarial';

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
                $this->error("No se encontro el archivo generado para {$nombre}.");
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
            'add_payment_fields_to_ventas' => <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            if (!Schema::hasColumn('ventas', 'metodo_pago')) {
                $table->string('metodo_pago', 50)->nullable()->after('numero_comprobante');
            }
            if (!Schema::hasColumn('ventas', 'numero_operacion')) {
                $table->string('numero_operacion', 100)->nullable()->after('metodo_pago');
                $table->unique('numero_operacion', 'ventas_numero_operacion_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            if (Schema::hasColumn('ventas', 'numero_operacion')) {
                $table->dropUnique('ventas_numero_operacion_unique');
                $table->dropColumn('numero_operacion');
            }
            if (Schema::hasColumn('ventas', 'metodo_pago')) {
                $table->dropColumn('metodo_pago');
            }
        });
    }
};
PHP,
        ];
    }
}
