<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    public function index()
    {
        return response()->json(
            Cliente::orderBy('nombres')->orderBy('apellidos')->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'dni' => 'required|string|max:15|unique:clientes,dni',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'sexo' => 'nullable|string|max:20',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'nullable|required_if:crear_acceso,true|email|max:150|unique:clientes,correo',
            'direccion' => 'nullable|string|max:255',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'fecha_registro' => 'nullable|date',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
            'crear_acceso' => 'nullable|boolean',
            'nombre_usuario' => 'nullable|required_if:crear_acceso,true|string|max:80|unique:usuarios,nombre_usuario',
            'contrasena' => 'nullable|required_if:crear_acceso,true|string|min:8|max:100',
        ]);

        if (!empty($datos['crear_acceso']) && Usuario::where('dni', $datos['dni'])->exists()) {
            throw ValidationException::withMessages([
                'dni' => ['Este DNI ya tiene una cuenta de acceso.'],
            ]);
        }

        if (!empty($datos['crear_acceso']) && Usuario::whereRaw('LOWER(correo) = ?', [mb_strtolower((string) $datos['correo'])])->exists()) {
            throw ValidationException::withMessages([
                'correo' => ['Este correo ya tiene una cuenta de acceso.'],
            ]);
        }

        $crearAcceso = (bool) ($datos['crear_acceso'] ?? false);
        $nombreUsuario = $datos['nombre_usuario'] ?? null;
        $contrasena = $datos['contrasena'] ?? null;

        unset($datos['crear_acceso'], $datos['nombre_usuario'], $datos['contrasena']);

        $datos['fecha_registro'] = $datos['fecha_registro'] ?? now();
        $datos['estado'] = $datos['estado'] ?? 'Activo';

        $cliente = DB::transaction(function () use ($datos, $crearAcceso, $nombreUsuario, $contrasena) {
            $cliente = Cliente::create($datos);

            if ($crearAcceso) {
                Usuario::create([
                    'nombre_usuario' => $nombreUsuario,
                    'contrasena' => Hash::make((string) $contrasena),
                    'nombres' => $cliente->nombres,
                    'apellidos' => $cliente->apellidos,
                    'dni' => $cliente->dni,
                    'telefono' => $cliente->telefono,
                    'correo' => mb_strtolower((string) $cliente->correo),
                    'rol' => 'Cliente',
                    'estado' => 'Activo',
                    'fecha_registro' => now(),
                    'id_cliente' => $cliente->id_cliente,
                ]);
            } else {
                // Compatibilidad con cuentas cliente creadas antes del vínculo id_cliente.
                $usuarioExistente = Usuario::where('rol', 'Cliente')
                    ->whereNull('id_cliente')
                    ->where(function ($q) use ($cliente) {
                        $q->where('dni', $cliente->dni);
                        if ($cliente->correo) {
                            $q->orWhereRaw('LOWER(correo) = ?', [mb_strtolower((string) $cliente->correo)]);
                        }
                    })
                    ->first();

                if ($usuarioExistente) {
                    $usuarioExistente->update(['id_cliente' => $cliente->id_cliente]);
                }
            }

            return $cliente;
        });

        return response()->json([
            'mensaje' => 'Cliente registrado correctamente.',
            'cliente' => $cliente->fresh(),
        ], 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Cliente::with([
                'clienteMembresias.membresia',
                'clienteMembresias.pagos',
                'asistencias',
                'rutinas.entrenador',
                'ventas.detalles.producto',
            ])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $cliente = Cliente::findOrFail($id);

        // Algunas cuentas antiguas se crearon antes de guardar id_cliente.
        // Se intenta localizar la cuenta por vínculo, DNI o correo para que editar
        // un cliente no falle por una falsa validación de "dato duplicado".
        $usuario = Usuario::where('rol', 'Cliente')
            ->where(function ($q) use ($cliente) {
                $q->where('id_cliente', $cliente->id_cliente)
                  ->orWhere('dni', $cliente->dni);

                if ($cliente->correo) {
                    $q->orWhereRaw('LOWER(correo) = ?', [mb_strtolower((string) $cliente->correo)]);
                }
            })
            ->orderByRaw('CASE WHEN id_cliente = ? THEN 0 ELSE 1 END', [$cliente->id_cliente])
            ->first();

        $datos = $request->validate([
            'dni' => [
                'sometimes', 'string', 'max:15',
                Rule::unique('clientes', 'dni')->ignore($cliente->id_cliente, 'id_cliente'),
                Rule::unique('usuarios', 'dni')->ignore($usuario?->id_usuario ?? 0, 'id_usuario'),
            ],
            'nombres' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'sexo' => 'sometimes|nullable|string|max:20',
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => [
                'sometimes', 'nullable', 'email', 'max:150',
                Rule::unique('clientes', 'correo')->ignore($cliente->id_cliente, 'id_cliente'),
                Rule::unique('usuarios', 'correo')->ignore($usuario?->id_usuario ?? 0, 'id_usuario'),
            ],
            'direccion' => 'sometimes|nullable|string|max:255',
            'fecha_nacimiento' => 'sometimes|nullable|date|before:today',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        DB::transaction(function () use ($cliente, $usuario, $datos) {
            $cliente->update($datos);

            if ($usuario) {
                $sincronizar = array_intersect_key($datos, array_flip([
                    'dni', 'nombres', 'apellidos', 'telefono', 'correo', 'estado',
                ]));

                // Repara automáticamente cuentas antiguas sin relación explícita.
                $sincronizar['id_cliente'] = $cliente->id_cliente;

                $usuario->update($sincronizar);

                if (($sincronizar['estado'] ?? null) === 'Inactivo') {
                    $usuario->tokens()->delete();
                }
            }
        });

        return response()->json([
            'mensaje' => 'Cambios del cliente guardados correctamente.',
            'cliente' => $cliente->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $cliente = Cliente::findOrFail($id);

        DB::transaction(function () use ($cliente) {
            $cliente->update(['estado' => 'Inactivo']);

            Usuario::where(function ($q) use ($cliente) {
                $q->where('id_cliente', $cliente->id_cliente)
                  ->orWhere(function ($q2) use ($cliente) {
                      $q2->whereNull('id_cliente')->where('dni', $cliente->dni)->where('rol', 'Cliente');
                  });
            })->get()->each(function (Usuario $usuario) {
                $usuario->update(['estado' => 'Inactivo']);
                $usuario->tokens()->delete();
            });
        });

        return response()->json([
            'mensaje' => 'Cliente y acceso asociados fueron desactivados. El historial fue conservado.',
            'cliente' => $cliente->fresh(),
        ]);
    }
}
