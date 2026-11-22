<?php

namespace Tests\Feature;

use App\Console\Commands\ReconciliarEsquemaRealMallqui;
use App\Console\Commands\VerificarMallquiBd;
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
