<?php

namespace App\Console\Commands;

use App\Models\Usuario;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class CrearAdminMallqui extends Command
{
    protected $signature = 'mallqui:crear-admin';

    protected $description = 'Crea o actualiza el usuario administrador de Mallqui Gym';

    public function handle(): int
    {
        if (!Schema::hasTable('usuarios')) {
            $this->error('La tabla usuarios aun no existe. Ejecuta primero las migraciones.');
            return self::FAILURE;
        }

        $nombreUsuario = trim((string) $this->ask('Nombre de usuario', 'admin'));
        $nombres = trim((string) $this->ask('Nombres', 'Administrador'));
        $apellidos = trim((string) $this->ask('Apellidos', 'Mallqui Gym'));
        $correo = trim((string) $this->ask('Correo'));
        $dni = trim((string) $this->ask('DNI (opcional)', ''));
        $telefono = trim((string) $this->ask('Telefono (opcional)', ''));
        $contrasena = (string) $this->secret('Contrasena (minimo 6 caracteres)');

        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->error('Ingresa un correo valido.');
            return self::FAILURE;
        }

        if (strlen($contrasena) < 6) {
            $this->error('La contrasena debe tener al menos 6 caracteres.');
            return self::FAILURE;
        }

        $usuario = Usuario::updateOrCreate(
            ['nombre_usuario' => $nombreUsuario],
            [
                'contrasena' => Hash::make($contrasena),
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'dni' => $dni !== '' ? $dni : null,
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
