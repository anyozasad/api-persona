<?php

namespace Tests\Feature;

use App\Console\Commands\ReconciliarEsquemaRealMallqui;
use App\Console\Commands\VerificarMallquiBd;
use Illuminate\Support\Facades\Schema;
use ReflectionClass;
use ReflectionMethod;
use Tests\TestCase;

class EsquemaMysqlConsistenteTest extends TestCase
{
    /** No permitir que Verificar declare "OK" omitiendo tablas del dashboard o portal. */
    public function test_verificador_cubre_todas_las_tablas_y_columnas_del_reconciliador(): void
    {
        $esquema = (new ReflectionClass(ReconciliarEsquemaRealMallqui::class))
            ->getConstant('REQUERIDAS');

        $verificador = app(VerificarMallquiBd::class);
        $tablas = (new ReflectionMethod(VerificarMallquiBd::class, 'tablas'))
            ->invoke($verificador);

        $this->assertEqualsCanonicalizing(array_keys($esquema), array_keys($tablas));
        foreach ($esquema as $tabla => $columnas) {
            $this->assertArrayHasKey($tabla, $tablas);
            $this->assertEqualsCanonicalizing(
                $columnas,
                $tablas[$tabla],
                'El módulo '.$tabla.' tiene columnas sin verificar.'
            );
        }
    }

    /** La API pública y el reparador deben evaluar el MISMO esquema real. */
    public function test_estado_publico_no_omite_las_columnas_que_el_reparador_exige(): void
    {
        $esperadas = [];
        $detectadas = [];
        foreach (ReconciliarEsquemaRealMallqui::requisitos() as $tabla => $columnas) {
            if (!Schema::hasTable($tabla)) {
                $esperadas[] = 'tabla:'.$tabla;
                continue;
            }
            $detectadas[] = $tabla;
            foreach ($columnas as $columna) {
                if (!Schema::hasColumn($tabla, $columna)) {
                    $esperadas[] = $tabla.'.'.$columna;
                }
            }
        }
        foreach (['vista_clientes_membresias', 'vista_stock', 'vista_ventas'] as $vista) {
            try {
                \Illuminate\Support\Facades\DB::table($vista)->limit(1)->get();
            } catch (\Throwable $e) {
                $esperadas[] = 'vista:'.$vista;
            }
        }

        $respuesta = $this->getJson('/api/estado-sistema');
        $respuesta->assertOk()
            ->assertJsonPath('faltantes', $esperadas)
            ->assertJsonPath('tablas_detectadas', $detectadas)
            ->assertJsonPath('operativo', $esperadas === []);
    }

    /** El diagnóstico debe exigir las columnas que Eloquent realmente escribe. */
    public function test_contrato_incluye_campos_de_modelos_y_timestamps(): void
    {
        $requisitos = ReconciliarEsquemaRealMallqui::requisitos();
        $modelos = [
            \App\Models\AdminGymRecord::class,
            \App\Models\ConfiguracionSistema::class,
            \App\Models\NotificacionCliente::class,
            \App\Models\SolicitudSoporte::class,
            \App\Models\OpinionCliente::class,
            \App\Models\MetaCliente::class,
            \App\Models\ClaseFavorita::class,
            \App\Models\PlanEntrenamientoCasa::class,
            \App\Models\SesionEntrenamientoCasa::class,
            \App\Models\DetalleSesionEntrenamiento::class,
        ];
        foreach ($modelos as $clase) {
            $modelo = new $clase();
            $tabla = $modelo->getTable();
            $this->assertArrayHasKey($tabla, $requisitos);
            foreach ($modelo->getFillable() as $columna) {
                $this->assertContains($columna, $requisitos[$tabla], "$tabla.$columna no se verifica");
            }
            if ($modelo->usesTimestamps()) {
                $this->assertContains('created_at', $requisitos[$tabla], "$tabla.created_at no se verifica");
                $this->assertContains('updated_at', $requisitos[$tabla], "$tabla.updated_at no se verifica");
            }
        }
    }

}
