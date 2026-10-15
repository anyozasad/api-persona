<?php

namespace App\Services;

use App\Models\Cliente;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class GymSystemClienteMirror
{
    private function conexion(): ConnectionInterface
    {
        $mysql = (array) config('database.connections.mysql', []);

        config([
            'database.connections.gym_system_mirror' => array_merge($mysql, [
                'database' => env('GYM_DB_DATABASE', 'gym_system'),
                'prefix' => '',
            ]),
        ]);

        DB::purge('gym_system_mirror');

        return DB::connection('gym_system_mirror');
    }

    public function sincronizar(Cliente $cliente): void
    {
        $db = $this->conexion();
        $schema = $db->getSchemaBuilder();

        if (!$schema->hasTable('socios')) {
            throw new RuntimeException('La base gym_system no contiene la tabla socios.');
        }

        $datos = [
            'nombre' => trim($cliente->nombres.' '.$cliente->apellidos),
            'dni' => $cliente->dni,
            'email' => $cliente->correo,
            'telefono' => $cliente->telefono,
            'fecha_registro' => $cliente->fecha_registro ?? now(),
            'estado' => strtolower((string) ($cliente->estado ?: 'Activo')),
        ];

        if ($schema->hasColumn('socios', 'foto')) {
            $datos['foto'] = $cliente->foto_perfil;
        }

        $existente = $db->table('socios')->where('dni', $cliente->dni)->first();

        if ($existente) {
            $db->table('socios')->where('id', $existente->id)->update($datos);
            return;
        }

        $db->table('socios')->insert($datos);
    }

    public function sincronizarTodos(): array
    {
        $creados = 0;
        $actualizados = 0;

        $db = $this->conexion();
        $schema = $db->getSchemaBuilder();

        if (!$schema->hasTable('socios')) {
            throw new RuntimeException('La base gym_system no contiene la tabla socios.');
        }

        Cliente::query()->orderBy('id_cliente')->chunkById(100, function ($clientes) use ($db, &$creados, &$actualizados) {
            foreach ($clientes as $cliente) {
                $existe = $db->table('socios')->where('dni', $cliente->dni)->exists();
                $this->sincronizar($cliente);
                $existe ? $actualizados++ : $creados++;
            }
        }, 'id_cliente');

        return [
            'creados' => $creados,
            'actualizados' => $actualizados,
            'total' => $creados + $actualizados,
        ];
    }
}
