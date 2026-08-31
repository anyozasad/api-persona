<?php

namespace App\Http\Controllers;

use App\Models\Auditoria;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        $query = Auditoria::query()->orderByDesc('fecha');

        if ($request->filled('id_usuario')) {
            $query->where('id_usuario', $request->integer('id_usuario'));
        }

        if ($request->filled('ruta')) {
            $query->where('ruta', 'like', '%'.$request->input('ruta').'%');
        }

        if ($request->filled('desde')) {
            $query->whereDate('fecha', '>=', $request->input('desde'));
        }

        if ($request->filled('hasta')) {
            $query->whereDate('fecha', '<=', $request->input('hasta'));
        }

        return response()->json($query->limit(1000)->get());
    }
}
