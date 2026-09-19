<?php

namespace App\Http\Controllers;

use App\Models\Entrenador;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EntrenadorController extends Controller
{
    public function index()
    {
        return response()->json(
            Entrenador::withCount(['rutinas', 'clases'])
                ->orderBy('nombres')
                ->orderBy('apellidos')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'dni' => 'required|string|max:15|unique:entrenadores,dni',
            'nombres' => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:25',
            'correo' => 'nullable|email|max:150|unique:entrenadores,correo',
            'especialidad' => 'nullable|string|max:150',
            'fecha_contratacion' => 'required|date',
            'salario' => 'required|numeric|min:0',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
            'crear_acceso' => 'nullable|boolean',
            'nombre_usuario' => 'nullable|string|max:80',
            'contrasena' => 'nullable|string|min:8|max:100',
        ]);

        $crearAcceso = (bool) ($datos['crear_acceso'] ?? false);

        if ($crearAcceso) {
            if (blank($datos['correo'] ?? null) || blank($datos['nombre_usuario'] ?? null) || blank($datos['contrasena'] ?? null)) {
                throw ValidationException::withMessages([
                    'acceso' => ['Para crear acceso ingresa correo, usuario y contraseña.'],
                ]);
            }

            if (Usuario::where('nombre_usuario', $datos['nombre_usuario'])->exists()) {
                throw ValidationException::withMessages(['nombre_usuario' => ['Ese usuario ya existe.']]);
            }
            if (Usuario::where('correo', $datos['correo'])->exists()) {
                throw ValidationException::withMessages(['correo' => ['Ese correo ya pertenece a otro usuario.']]);
            }
            if (Usuario::where('dni', $datos['dni'])->exists()) {
                throw ValidationException::withMessages(['dni' => ['Ese DNI ya pertenece a otro usuario.']]);
            }
        }

        $entrenador = DB::transaction(function () use ($datos, $crearAcceso) {
            $entrenadorDatos = collect($datos)->only([
                'dni', 'nombres', 'apellidos', 'telefono', 'correo',
                'especialidad', 'fecha_contratacion', 'salario', 'estado',
            ])->all();
            $entrenadorDatos['estado'] = $entrenadorDatos['estado'] ?? 'Activo';

            $entrenador = Entrenador::create($entrenadorDatos);

            if ($crearAcceso) {
                Usuario::create([
                    'id_entrenador' => $entrenador->id_entrenador,
                    'nombre_usuario' => $datos['nombre_usuario'],
                    'contrasena' => Hash::make($datos['contrasena']),
                    'nombres' => $entrenador->nombres,
                    'apellidos' => $entrenador->apellidos,
                    'dni' => $entrenador->dni,
                    'telefono' => $entrenador->telefono,
                    'correo' => $entrenador->correo,
                    'rol' => 'Entrenador',
                    'estado' => $entrenador->estado,
                    'fecha_registro' => now(),
                ]);
            }

            return $entrenador;
        });

        return response()->json([
            'mensaje' => $crearAcceso
                ? 'Entrenador y cuenta de acceso creados correctamente.'
                : 'Entrenador creado correctamente.',
            'entrenador' => $entrenador->fresh(),
        ], 201);
    }

    public function show(string $id)
    {
        return response()->json(
            Entrenador::with(['rutinas.cliente', 'clases'])->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        $entrenador = Entrenador::findOrFail($id);
        $usuario = Usuario::where('id_entrenador', $entrenador->id_entrenador)->first();

        $datos = $request->validate([
            'dni' => [
                'sometimes', 'string', 'max:15',
                Rule::unique('entrenadores', 'dni')->ignore($entrenador->id_entrenador, 'id_entrenador'),
                Rule::unique('usuarios', 'dni')->ignore($usuario?->id_usuario ?? 0, 'id_usuario'),
            ],
            'nombres' => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'telefono' => 'sometimes|nullable|string|max:25',
            'correo' => [
                'sometimes', 'nullable', 'email', 'max:150',
                Rule::unique('entrenadores', 'correo')->ignore($entrenador->id_entrenador, 'id_entrenador'),
                Rule::unique('usuarios', 'correo')->ignore($usuario?->id_usuario ?? 0, 'id_usuario'),
            ],
            'especialidad' => 'sometimes|nullable|string|max:150',
            'fecha_contratacion' => 'sometimes|date',
            'salario' => 'sometimes|numeric|min:0',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        DB::transaction(function () use ($entrenador, $usuario, $datos) {
            $entrenador->update($datos);

            if ($usuario) {
                $sincronizar = array_intersect_key($datos, array_flip([
                    'dni', 'nombres', 'apellidos', 'telefono', 'correo', 'estado',
                ]));
                if ($sincronizar) {
                    $usuario->update($sincronizar);
                    if (($sincronizar['estado'] ?? null) === 'Inactivo') {
                        $usuario->tokens()->delete();
                    }
                }
            }
        });

        return response()->json($entrenador->fresh());
    }

    public function destroy(string $id)
    {
        $entrenador = Entrenador::findOrFail($id);

        DB::transaction(function () use ($entrenador) {
            $entrenador->update(['estado' => 'Inactivo']);

            Usuario::where(function ($q) use ($entrenador) {
                $q->where('id_entrenador', $entrenador->id_entrenador)
                  ->orWhere(function ($q2) use ($entrenador) {
                      $q2->whereNull('id_entrenador')->where('dni', $entrenador->dni)->where('rol', 'Entrenador');
                  });
            })->get()->each(function (Usuario $usuario) {
                $usuario->update(['estado' => 'Inactivo']);
                $usuario->tokens()->delete();
            });
        });

        return response()->json([
            'mensaje' => 'Entrenador y acceso asociados fueron desactivados. Se conservó su historial.',
            'entrenador' => $entrenador->fresh(),
        ]);
    }
}
