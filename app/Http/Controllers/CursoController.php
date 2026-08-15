<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curso;

class CursoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
            $cursos = Curso::all();
            return response()->json($cursos);
    }

    /**
     * Store a newly created resource in storage.
     */
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

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
