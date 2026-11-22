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
}
