<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class DiagnosticarAuthMallqui extends Command
{
    protected $signature = 'auth:diagnosticar {--usuario=admin : Nombre de usuario o correo a verificar, sin contraseña}';

    protected $description = 'Diagnostica sin modificar datos las causas habituales del error 500 al iniciar sesion';

    public function handle(): int
    {
        $this->info('Diagnostico de autenticacion Mallqui Gym (solo lectura)');
        $errores = 0;

        try {
            $db = DB::connection();
            $db->getPdo();
            $this->info('OK: conexion MySQL disponible. Base: '.$db->getDatabaseName());
        } catch (Throwable $e) {
            $this->error('ERROR: Laravel no puede conectar con MySQL. Revisa BACKEND/.env y XAMPP.');
            $this->line('Tipo de error: '.class_basename($e));
            return self::FAILURE;
        }

        $usuarioTabla = Schema::hasTable('usuarios');
        if (!$usuarioTabla) {
            $this->error('FALTA tabla usuarios.');
            $errores++;
        }

        if ($usuarioTabla) {
            foreach (['id_usuario', 'nombre_usuario', 'correo', 'contrasena', 'rol', 'estado'] as $columna) {
                if (!Schema::hasColumn('usuarios', $columna)) {
                    $this->error('FALTA usuarios.'.$columna);
                    $errores++;
                }
            }

            if ($errores === 0) {
                $buscado = trim((string) $this->option('usuario'));
                $q = DB::table('usuarios');
                $q->where(function ($consulta) use ($buscado) {
                    $consulta->where('nombre_usuario', $buscado)
                        ->orWhere('correo', $buscado);
                });
                try {
                    $cuentas = $q->get(['id_usuario', 'rol', 'estado', 'contrasena']);
                    if ($cuentas->count() === 0) {
                        $this->warn('AVISO: no existe ese usuario/correo en la base activa.');
                    } elseif ($cuentas->count() > 1) {
                        $this->error('ERROR: se detectaron varias cuentas coincidentes. Revisa duplicados.');
                        $errores++;
                    } else {
                        $cuenta = $cuentas->first();
                        if (!is_numeric($cuenta->id_usuario) || (int) $cuenta->id_usuario <= 0) {
                            $this->error('ERROR: la cuenta no tiene id_usuario valido. Sanctum no puede crear una sesion fiable.');
                            $errores++;
                        } else {
                            $this->info('OK: identificador de usuario presente.');
                        }
                        $this->line('Rol: '.(string) $cuenta->rol.'; Estado: '.(string) $cuenta->estado);
                        if (mb_strtolower((string) $cuenta->estado) !== 'activo') {
                            $this->warn('AVISO: cuenta inactiva.');
                        }
                        $hash = (string) $cuenta->contrasena;
                        if ($hash === '' || (!str_starts_with($hash, '$2y$') && !str_starts_with($hash, '$argon2'))) {
                            $this->warn('AVISO: la contrasena almacenada no parece un hash compatible con Laravel.');
                        } else {
                            $this->info('OK: contrasena almacenada como hash. No se comprueba ni se muestra el secreto.');
                        }
                    }

                    $sinId = DB::table('usuarios')->whereNull('id_usuario')->count();
                    if ($sinId > 0) {
                        $this->error("ERROR: {$sinId} usuario(s) no tienen id_usuario; requiere reparacion de datos legacy.");
                        $errores++;
                    }
                } catch (Throwable $e) {
                    $this->error('ERROR: no se pudieron leer los usuarios. Tipo: '.class_basename($e));
                    $errores++;
                }
            }
        }

        if (!Schema::hasTable('personal_access_tokens')) {
            $this->error('FALTA tabla personal_access_tokens.');
            $errores++;
        } else {
            foreach ([
                'id', 'tokenable_type', 'tokenable_id', 'name', 'token',
                'abilities', 'created_at', 'updated_at'
            ] as $columna) {
                if (!Schema::hasColumn('personal_access_tokens', $columna)) {
                    $this->error('FALTA personal_access_tokens.'.$columna);
                    $errores++;
                }
            }
        }

        if ($errores > 0) {
            $this->error("Diagnostico: {$errores} problema(s). No se modifico ninguna cuenta.");
            $this->line('Ejecuta el reparador con respaldo: REPARAR_LOGIN_MALLQUI.ps1 -RepararEsquema');
            return self::FAILURE;
        }

        $this->info('OK: estructura de autenticacion y cuenta revisadas.');
        $this->line('Si el navegador sigue mostrando error 500, revisa la ultima excepcion del log Laravel (sin compartir claves/tokens).');
        return self::SUCCESS;
    }
}
