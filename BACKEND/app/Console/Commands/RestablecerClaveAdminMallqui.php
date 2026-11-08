<?php

namespace App\Console\Commands;

use App\Models\Usuario;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Throwable;

class RestablecerClaveAdminMallqui extends Command
{
    protected $signature = 'admin:clave';

    protected $description = 'Restablece la contraseña del administrador existente sin pedir otros datos';

    public function handle(): int
    {
        if (!Schema::hasTable('usuarios') || !Schema::hasColumn('usuarios', 'contrasena')) {
            $this->error('No está lista la tabla usuarios. No se modificó ninguna cuenta.');
            return self::FAILURE;
        }

        $usuario = Usuario::query()->where('nombre_usuario', 'admin')->first();
        if (!$usuario || mb_strtolower(trim((string) $usuario->rol)) !== 'administrador') {
            $this->error('No se encontró una cuenta admin con rol Administrador. No se modificó ninguna cuenta.');
            return self::FAILURE;
        }

        if (!Schema::hasTable('personal_access_tokens')) {
            $this->error('Falta la tabla de sesiones. No se modificó la contraseña.');
            return self::FAILURE;
        }

        $this->line('Restableciendo contraseña del usuario admin (Administrador).');
        $nueva = (string) $this->secret('Nueva contraseña (mínimo 8 caracteres)');
        $confirmacion = (string) $this->secret('Repite la nueva contraseña');

        if (strlen($nueva) < 8) {
            $this->error('La contraseña debe tener al menos 8 caracteres. No se realizaron cambios.');
            return self::FAILURE;
        }

        if (!hash_equals($nueva, $confirmacion)) {
            $this->error('Las contraseñas no coinciden. No se realizaron cambios.');
            return self::FAILURE;
        }

        try {
            DB::transaction(function () use ($usuario, $nueva): void {
                $usuario->contrasena = Hash::make($nueva);
                $usuario->save();
                $usuario->tokens()->delete();
            });
        } catch (Throwable $e) {
            $this->error('No se pudo guardar la contraseña. Comprueba el estado de MySQL.');
            return self::FAILURE;
        }

        $this->info('Contraseña actualizada. Inicia sesión con el usuario admin y tu nueva contraseña.');
        return self::SUCCESS;
    }
}
