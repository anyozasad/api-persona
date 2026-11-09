<?php
declare(strict_types=1);

/** Crea un administrador ficticio EXCLUSIVAMENTE en la base temporal de CI. */
if (PHP_SAPI !== 'cli' || getenv('CI') !== 'true'
    || getenv('DB_DATABASE') !== 'mallqui_gym_e2e') {
    fwrite(STDERR,"No se permite ejecutar esto sobre un sistema real.\n");
    exit(1);
}
require __DIR__.'/../../../BACKEND/vendor/autoload.php';
$app=require __DIR__.'/../../../BACKEND/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

try {
    if((string)DB::connection()->getDatabaseName()!=='mallqui_gym_e2e'){
        throw new RuntimeException('Base de datos E2E incorrecta.');
    }
    $password=(string)getenv('E2E_ADMIN_PASSWORD');
    if(strlen($password)<12) throw new RuntimeException('Falta contraseña temporal E2E.');
    $usuario=Usuario::updateOrCreate(
        ['nombre_usuario'=>'admin_pruebas_e2e'],
        [
            'nombres'=>'Administrador',
            'apellidos'=>'Pruebas',
            'dni'=>'88990011',
            'correo'=>'e2e-admin@example.test',
            'telefono'=>'999888777',
            'contrasena'=>Hash::make($password),
            'rol'=>'Administrador',
            'estado'=>'Activo',
            'fecha_registro'=>now()
        ]
    );
    echo "E2E admin creado en BD temporal: id=".$usuario->getKey()."\n";
} catch(Throwable $e) {
    fwrite(STDERR,"Falló preparación E2E: ".$e->getMessage()."\n");
    exit(1);
}
