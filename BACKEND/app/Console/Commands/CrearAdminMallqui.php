<?php

namespace App\Console\Commands;

use App\Models\Usuario;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Throwable;

class CrearAdminMallqui extends Command
{
    protected $signature = 'admin:crear';

    protected $description = 'Crea o actualiza un usuario administrador del sistema';

    public function handle(): int
    {
        if (!Schema::hasTable('usuarios')) {
            $this->error('La tabla usuarios aun no existe. Ejecuta primero las migraciones.');
            return self::FAILURE;
        }

        // Reparar antes de pedir datos para no repetir preguntas si falla la DB.
        if (!Schema::hasColumn('usuarios', 'id_usuario')) {
            $this->warn('La tabla usuarios es antigua; se preparara su identificador sin borrar registros.');
            try {
                $codigo = Artisan::call('migrate', [
                    '--path' => 'database/migrations/2026_11_07_230000_ensure_usuarios_identity.php',
                    '--force' => true,
                ]);
                $salida = trim(Artisan::output());
                if ($salida !== '') $this->line($salida);
                if ($codigo !== 0 || !Schema::hasColumn('usuarios', 'id_usuario')) {
                    $this->error('No se pudo preparar id_usuario. Revisa la migracion indicada.');
                    return self::FAILURE;
                }
            } catch (Throwable $e) {
                $this->error('No se pudo preparar la tabla usuarios: '.$e->getMessage());
                return self::FAILURE;
            }
        }

        // Las tablas usuarios antiguas pueden existir sin columnas de acceso.
        // Prepararlas ANTES de solicitar datos evita perder tiempo en el formulario.
        $columnasAcceso = [
            'nombre_usuario', 'contrasena', 'correo', 'nombres', 'apellidos',
            'dni', 'telefono', 'rol', 'estado', 'fecha_registro',
            'id_cliente', 'id_entrenador',
        ];
        $faltantes = array_values(array_filter(
            $columnasAcceso,
            fn (string $columna) => !Schema::hasColumn('usuarios', $columna)
        ));

        if ($faltantes !== []) {
            $this->warn('Preparando campos de usuarios existentes: '.implode(', ', $faltantes));
            try {
                $codigo = Artisan::call('migrate', [
                    '--path' => 'database/migrations/2026_11_07_231000_ensure_usuarios_auth_fields.php',
                    '--force' => true,
                ]);
                $salida = trim(Artisan::output());
                if ($salida !== '') $this->line($salida);
                if ($codigo !== 0) {
                    $this->error('No se pudo completar el esquema de usuarios.');
                    return self::FAILURE;
                }

                foreach ($columnasAcceso as $columna) {
                    if (!Schema::hasColumn('usuarios', $columna)) {
                        $this->error('Todavia falta la columna usuarios.'.$columna);
                        return self::FAILURE;
                    }
                }
            } catch (Throwable $e) {
                $this->error('No se pudo preparar usuarios: '.$e->getMessage());
                return self::FAILURE;
            }
        }

        // Las tablas antiguas a veces guardan rol como ENUM limitado.
        // Verificar el tipo antes de solicitar contraseña u otros datos.
        try {
            $codigo = Artisan::call('migrate', [
                '--path' => 'database/migrations/2026_11_07_232000_expand_usuarios_rol.php',
                '--force' => true,
            ]);
            $salida = trim(Artisan::output());
            if ($salida !== '') $this->line($salida);
            if ($codigo !== 0) {
                $this->error('No se pudo preparar la columna usuarios.rol.');
                return self::FAILURE;
            }
        } catch (Throwable $e) {
            $this->error('No se pudo preparar el rol de los usuarios: '.$e->getMessage());
            return self::FAILURE;
        }

        // Sanctum necesita esta tabla tanto para cerrar sesiones antiguas
        // como para generar el token del login. Prepararla antes de pedir datos.
        if (!Schema::hasTable('personal_access_tokens')) {
            $this->warn('Preparando tabla de sesiones de Sanctum...');
            try {
                $codigo = Artisan::call('migrate', [
                    '--path' => 'database/migrations/2026_11_07_233000_ensure_sanctum_tokens_table.php',
                    '--force' => true,
                ]);
                $salida = trim(Artisan::output());
                if ($salida !== '') $this->line($salida);
                if ($codigo !== 0 || !Schema::hasTable('personal_access_tokens')) {
                    $this->error('No se pudo preparar la tabla de sesiones.');
                    return self::FAILURE;
                }
            } catch (Throwable $e) {
                $this->error('No se pudo preparar las sesiones de Sanctum: '.$e->getMessage());
                return self::FAILURE;
            }
        }

        $nombreUsuario = trim((string) $this->ask('Nombre de usuario', 'admin'));
        $nombres = trim((string) $this->ask('Nombres', 'Administrador'));
        $apellidos = trim((string) $this->ask('Apellidos', 'Sistema'));
        $correo = trim((string) $this->ask('Correo'));
        $dni = trim((string) $this->ask('DNI'));
        $telefono = trim((string) $this->ask('Telefono (opcional)', ''));
        $contrasena = (string) $this->secret('Contrasena (minimo 8 caracteres)');

        if ($nombreUsuario === '') {
            $this->error('El nombre de usuario es obligatorio.');
            return self::FAILURE;
        }

        if ($dni === '') {
            $this->error('El DNI es obligatorio.');
            return self::FAILURE;
        }

        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->error('Ingresa un correo valido.');
            return self::FAILURE;
        }

        if (strlen($contrasena) < 8) {
            $this->error('La contrasena debe tener al menos 8 caracteres.');
            return self::FAILURE;
        }

        $usuario = Usuario::updateOrCreate(
            ['nombre_usuario' => $nombreUsuario],
            [
                'contrasena' => Hash::make($contrasena),
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'dni' => $dni,
                'telefono' => $telefono !== '' ? $telefono : null,
                'correo' => $correo,
                'rol' => 'Administrador',
                'estado' => 'Activo',
                'fecha_registro' => now(),
            ]
        );

        $usuario->tokens()->delete();

        $this->info('Administrador preparado correctamente.');
        $this->line('Usuario: '.$usuario->nombre_usuario);
        $this->line('Correo: '.$usuario->correo);
        $this->line('Rol: '.$usuario->rol);

        return self::SUCCESS;
    }
}
