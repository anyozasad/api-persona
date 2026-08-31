<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curso;

class CursoController extends Controller
{
    // LISTAR TODOS LOS CURSOS
    public function index()
    {
        $cursos = Curso::all();
        return response()->json($cursos);
    }

    // REGISTRAR CURSO
    public function store(Request $request)
    {
        $curso = Curso::create([
            'curso' => $request->curso,
            'horas' => $request->horas,
            'creditos' => $request->creditos,
            'idEspecialidad' => $request->idEspecialidad
        ]);

        return response()->json($curso, 201);
    }

    // BUSCAR CURSO POR ID
    public function show($id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json([
                'mensaje' => 'Curso no encontrado'
            ], 404);
        }

        return response()->json($curso);
    }

    // ACTUALIZAR CURSO
    public function update(Request $request, string $id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json([
                'mensaje' => 'Curso no encontrado'
            ], 404);
        }

        $curso->update([
            'curso' => $request->curso,
            'horas' => $request->horas,
            'creditos' => $request->creditos,
            'idEspecialidad' => $request->idEspecialidad
        ]);

        return response()->json([
            'mensaje' => 'Curso actualizado correctamente',
            'curso' => $curso
        ]);
    }

    // ELIMINAR CURSO
    public function destroy(string $id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json([
                'mensaje' => 'Curso no encontrado'
            ], 404);
        }

        $curso->delete();

        return response()->json([
            'mensaje' => 'Curso eliminado correctamente'
        ]);
    }
}