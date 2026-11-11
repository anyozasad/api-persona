<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ProductoController extends Controller
{
    /**
     * La instalación original gym_system tiene productos.id / categoria_id.
     * La instalación Laravel nueva utiliza id_producto / id_categoria.
     * Ambas deben operar en la misma conexión DB_DATABASE, sin copiar
     * registros a una tabla paralela ni perder fotografías ya almacenadas.
     */
    private function usaEsquemaOriginal(): bool
    {
        return Schema::hasTable('productos')
            && Schema::hasColumn('productos', 'id')
            && !Schema::hasColumn('productos', 'id_producto');
    }


    /**
     * Estado verificable de fotografías sin descargar los archivos grandes.
     * Protegido por la misma autorización de administrador que el CRUD.
     */
    public function diagnosticoFotos()
    {
        $conexion = DB::connection();
        $tabla = $conexion->table('productos');

        $total = (clone $tabla)->count();
        $sinFoto = (clone $tabla)->where(function ($consulta) {
            $consulta->whereNull('foto')->orWhere('foto', '=', '');
        })->count();
        $conFoto = (clone $tabla)
            ->where('foto', 'like', 'data:image/%;base64,%')->count();
        $rutasAnteriores = max(0, $total - $sinFoto - $conFoto);

        $id = $this->usaEsquemaOriginal() ? 'id' : 'id_producto';
        $codigo = $this->usaEsquemaOriginal() ? 'codigo' : 'codigo_producto';
        $nombre = $this->usaEsquemaOriginal() ? 'nombre' : 'nombre_producto';

        // Ni credenciales ni cadenas base64 completas viajan en el diagnóstico.
        $pendientes = $conexion->table('productos')
            ->where(function ($consulta) {
                $consulta->whereNull('foto')->orWhere('foto', '=', '')
                    ->orWhere('foto', 'not like', 'data:image/%;base64,%');
            })
            ->orderBy($id)
            ->limit(30)
            ->get([$id, $codigo, $nombre, 'foto'])
            ->map(function ($producto) use ($id, $codigo, $nombre) {
                $foto = (string) ($producto->foto ?? '');
                return [
                    'id_producto' => (int) $producto->{$id},
                    'codigo_producto' => (string) $producto->{$codigo},
                    'nombre_producto' => (string) $producto->{$nombre},
                    'problema' => $foto === '' ? 'sin_fotografia'
                        : 'referencia_antigua_o_imagen_no_valida',
                ];
            });

        return response()->json([
            'base_datos' => (string) $conexion->getDatabaseName(),
            'esquema' => $this->usaEsquemaOriginal() ? 'original' : 'laravel',
            'total_productos' => $total,
            'fotos_guardadas_en_mysql' => $conFoto,
            'sin_foto' => $sinFoto,
            'referencias_antiguas' => $rutasAnteriores,
            'pendientes' => $pendientes,
            'nota' => 'Las fotos guardadas como base64 viven en productos.foto. Las rutas antiguas requieren recuperar el archivo original.',
        ]);
    }

    /**
     * Reemplaza exclusivamente los diez registros ficticios PROD-001..PROD-010
     * que siguen sin foto por artículos identificables en las fotografías
     * originales de Mallqui Gym. Idempotente y restringido a Administrador.
     * Conserva los códigos, identificadores, precios, stock e historial.
     *
     * No se aplica a productos reales, fotos existentes o categorías ausentes.
     */
    public function completarFotosIniciales()
    {
        if (!Schema::hasTable('productos') || !Schema::hasTable('categorias')) {
            return response()->json(['mensaje'=>'No se encuentran las tablas de productos y categorías.'],503);
        }

        $legacy = $this->usaEsquemaOriginal();
        $codigoCampo = $legacy ? 'codigo' : 'codigo_producto';
        $nombreCampo = $legacy ? 'nombre' : 'nombre_producto';
        $categoriaCampo = $legacy ? 'categoria_id' : 'id_categoria';
        $categoriaIdCampo = $legacy ? 'id' : 'id_categoria';
        $categoriaNombreCampo = $legacy ? 'nombre' : 'nombre_categoria';

        if (!Schema::hasColumn('productos','foto')
            || !Schema::hasColumn('productos',$codigoCampo)
            || !Schema::hasColumn('productos',$nombreCampo)
            || !Schema::hasColumn('productos',$categoriaCampo)
            || !Schema::hasColumn('categorias',$categoriaNombreCampo)) {
            return response()->json(['mensaje'=>'No está preparada la estructura de fotografías en MySQL.'],503);
        }

        // Asegura columna MEDIUMTEXT en una instalación antigua de gym_system.
        if ($legacy) app(GymSystemAdminController::class);

        $ejemplos = [
            1 => ['Creatina', 'Suplementos', 'foto-12.jpg'],
            2 => ['Shaker gris', 'Accesorios', 'foto-13.jpg'],
            3 => ['BCAA', 'Suplementos', 'foto-16.jpg'],
            4 => ['Shaker azul', 'Accesorios', 'foto-14.jpg'],
            5 => ['Big M', 'Suplementos', 'foto-15.jpg'],
            6 => ['Collagen Pro', 'Suplementos', 'foto-17.jpg'],
            7 => ['NOXRAGE', 'Suplementos', 'foto-09.jpg'],
            8 => ['Pro Mass XL', 'Suplementos', 'foto-33.jpg'],
            9 => ['AN USA (cajas)', 'Suplementos', 'foto-11.jpg'],
            10 => ['NOXRAGE (presentación alternativa)', 'Suplementos', 'foto-29.jpg'],
        ];

        $baseFotos = base_path('../FRONTEND/suma-angular/public/assets/mallqui/fotos-reales');
        $guardadas = 0;
        $omitidas = 0;
        $observaciones = [];

        foreach ($ejemplos as $numero => [$nombreReal, $categoria, $archivo]) {
            $codigo = 'PROD-'.str_pad((string)$numero,3,'0',STR_PAD_LEFT);
            $nombrePrueba = 'Producto Prueba '.$numero;
            $fila = DB::table('productos')
                ->where($codigoCampo,$codigo)
                ->where($nombreCampo,$nombrePrueba)
                ->where(function ($q) {
                    $q->whereNull('foto')->orWhere('foto','');
                })->first();
            if (!$fila) {
                $omitidas++;
                continue;
            }

            $idCategoria = DB::table('categorias')
                ->where($categoriaNombreCampo,$categoria)->value($categoriaIdCampo);
            if (!$idCategoria) {
                $observaciones[] = "No existe la categoría {$categoria} para {$codigo}.";
                continue;
            }

            $ruta = $baseFotos.DIRECTORY_SEPARATOR.$archivo;
            if (!is_file($ruta) || is_link($ruta) || filesize($ruta) > 2100000) {
                $observaciones[] = "Falta la fotografía local de {$codigo}.";
                continue;
            }

            $contenido = file_get_contents($ruta);
            $info = $contenido === false ? false : @getimagesizefromstring($contenido);
            if (!$info || ($info['mime'] ?? '') !== 'image/jpeg') {
                $observaciones[] = "La fotografía de {$codigo} no es un JPEG válido.";
                continue;
            }
            $foto = 'data:image/jpeg;base64,'.base64_encode($contenido);
            if (strlen($foto) > 2900000) {
                $observaciones[] = "La fotografía de {$codigo} excede el tamaño permitido.";
                continue;
            }

            // WHERE protege ante concurrencia o cambios efectuados por el usuario.
            $actualizados = DB::table('productos')
                ->where($codigoCampo,$codigo)
                ->where($nombreCampo,$nombrePrueba)
                ->where(function ($q) {
                    $q->whereNull('foto')->orWhere('foto','');
                })
                ->update([
                    $nombreCampo => $nombreReal,
                    $categoriaCampo => $idCategoria,
                    'foto' => $foto,
                ]);
            if ($actualizados === 1) $guardadas++;
            else $omitidas++;
        }

        return response()->json([
            'mensaje' => $guardadas
                ? "{$guardadas} productos de prueba completados automáticamente con fotografías reales."
                : 'No se encontraron registros de prueba sin fotografía para completar.',
            'actualizados' => $guardadas,
            'omitidos' => $omitidas,
            'observaciones' => $observaciones,
            'base_datos' => DB::connection()->getDatabaseName(),
        ]);
    }

    public function index(Request $request)
    {
        if ($this->usaEsquemaOriginal()) {
            return app(GymSystemAdminController::class)->productos();
        }
        $query = Producto::with('categoria')->orderBy('nombre_producto');

        if ($request->boolean('stock_bajo')) {
            $query->whereColumn('stock', '<=', 'stock_minimo');
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        if ($this->usaEsquemaOriginal()) {
            $respuesta = app(GymSystemAdminController::class)->guardarProducto($request);
            $id = (int) ($respuesta->getData(true)['id_producto'] ?? 0);
            return response()->json(
                app(GymSystemAdminController::class)->producto((string) $id)->getData(true),
                201
            );
        }
        $datos = $request->validate([
            'id_categoria' => 'required|integer|exists:categorias,id_categoria',
            'codigo_producto' => 'required|string|max:60|unique:productos,codigo_producto',
            'nombre_producto' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:500',
            'foto' => 'nullable|string|max:3000000',
            'precio_compra' => 'nullable|numeric|min:0',
            'precio_venta' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'stock_minimo' => 'nullable|integer|min:0',
            'unidad_medida' => 'required|string|max:50',
            'fecha_registro' => 'nullable|date',
            'estado' => ['nullable', Rule::in(['Activo', 'Inactivo'])],
        ]);

        if (array_key_exists('foto', $datos) && $datos['foto'] !== null && $datos['foto'] !== '') {
            abort_unless(
                preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+\/=]+$/i', $datos['foto']) === 1,
                422,
                'La imagen del producto no tiene un formato válido.'
            );
        }

        $datos['foto'] = $datos['foto'] ?? null;
        $datos['precio_compra'] = $datos['precio_compra'] ?? 0;
        $datos['stock'] = $datos['stock'] ?? 0;
        $datos['stock_minimo'] = $datos['stock_minimo'] ?? 0;
        $datos['fecha_registro'] = $datos['fecha_registro'] ?? now();
        $datos['estado'] = $datos['estado'] ?? 'Activo';

        return response()->json(Producto::create($datos)->load('categoria'), 201);
    }

    public function show(string $id)
    {
        if ($this->usaEsquemaOriginal()) {
            return app(GymSystemAdminController::class)->producto($id);
        }
        return response()->json(
            Producto::with(['categoria', 'detallesCompra.compra', 'detallesVenta.venta'])
                ->findOrFail($id)
        );
    }

    public function update(Request $request, string $id)
    {
        if ($this->usaEsquemaOriginal()) {
            app(GymSystemAdminController::class)->actualizarProducto($request, $id);
            return app(GymSystemAdminController::class)->producto($id);
        }
        $producto = Producto::findOrFail($id);

        $datos = $request->validate([
            'id_categoria' => 'sometimes|integer|exists:categorias,id_categoria',
            'codigo_producto' => [
                'sometimes', 'string', 'max:60',
                Rule::unique('productos', 'codigo_producto')->ignore($producto->id_producto, 'id_producto'),
            ],
            'nombre_producto' => 'sometimes|string|max:150',
            'descripcion' => 'sometimes|nullable|string|max:500',
            'foto' => 'sometimes|nullable|string|max:3000000',
            'precio_compra' => 'sometimes|numeric|min:0',
            'precio_venta' => 'sometimes|numeric|min:0',
            'stock_minimo' => 'sometimes|integer|min:0',
            'unidad_medida' => 'sometimes|string|max:50',
            'estado' => ['sometimes', Rule::in(['Activo', 'Inactivo'])],
        ]);

        if (array_key_exists('foto', $datos) && $datos['foto'] !== null && $datos['foto'] !== '') {
            abort_unless(
                preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+\/=]+$/i', $datos['foto']) === 1,
                422,
                'La imagen del producto no tiene un formato válido.'
            );
        }

        if (array_key_exists('foto', $datos) && $datos['foto'] === '') {
            $datos['foto'] = null;
        }

        // El stock no se modifica desde este CRUD: cambia mediante compras y ventas.
        $producto->update($datos);

        return response()->json($producto->fresh('categoria'));
    }

    /**
     * Semana 05: permite cargar solo la foto del producto desde su fila
     * sin cambiar precio, stock ni datos de inventario. Funciona con
     * productos.id (gym_system) o productos.id_producto (Laravel).
     */
    public function actualizarFoto(Request $request, string $id)
    {
        $datos = $request->validate([
            'foto' => 'required|string|max:2900000',
        ]);

        $foto = $datos['foto'];
        if (!preg_match('~^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$~D', $foto, $coincidencia)) {
            abort(422, 'Selecciona una fotografía PNG, JPG o WEBP válida.');
        }

        $contenido = base64_decode($coincidencia[2], true);
        if ($contenido === false || strlen($contenido) > 2200000) {
            abort(422, 'La fotografía es demasiado grande o no se pudo leer.');
        }
        $informacion = @getimagesizefromstring($contenido);
        if (!$informacion || ($informacion['mime'] ?? '') !== 'image/'.$coincidencia[1]
            || $informacion[0] < 1 || $informacion[1] < 1
            || ($informacion[0] * $informacion[1]) > 36000000) {
            abort(422, 'El archivo no contiene una imagen válida.');
        }

        if ($this->usaEsquemaOriginal()) {
            $existe = DB::table('productos')->where('id', $id)->exists();
            abort_unless($existe, 404, 'Producto no encontrado.');
            DB::table('productos')->where('id', $id)->update(['foto' => $foto]);
            return app(GymSystemAdminController::class)->producto($id);
        }

        $producto = Producto::findOrFail($id);
        $producto->update(['foto' => $foto]);
        return response()->json($producto->fresh('categoria'));
    }

    public function destroy(string $id)
    {
        if ($this->usaEsquemaOriginal()) {
            $request = Request::create('/api/productos/'.$id, 'DELETE', ['estado' => 'Inactivo']);
            app(GymSystemAdminController::class)->cambiarEstadoProducto($request, $id);
            return response()->json([
                'mensaje' => 'Producto desactivado correctamente. Se conserva su historial.',
                'producto' => app(GymSystemAdminController::class)->producto($id)->getData(true),
            ]);
        }
        $producto = Producto::findOrFail($id);
        $producto->update(['estado' => 'Inactivo']);

        return response()->json([
            'mensaje' => 'Producto desactivado correctamente. Se conserva su historial.',
            'producto' => $producto->fresh(),
        ]);
    }
}
