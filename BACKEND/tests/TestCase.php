<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Muchas pruebas integradas hacen cambios de esquema en la base de
        // pruebas. Nunca permitir que se ejecuten sobre gym_system real.
        $base = (string) DB::connection()->getDatabaseName();
        $esBaseDePrueba = (bool) preg_match('/(?:pruebas|test|_ci|_e2e)/i', $base);
        if (!$esBaseDePrueba || !app()->environment('testing')) {
            throw new RuntimeException(
                'SEGURIDAD: las pruebas solo se permiten en una BD temporal '.
                '(mallqui_gym_pruebas o mallqui_gym_e2e). No tocar '.$base.'.'
            );
        }
    }
}
