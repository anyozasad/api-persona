<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ImportarFotosProductos extends Command
{
    protected $signature = 'productos:importar-fotos
        {carpeta : Carpeta de imágenes cuyo nombre de archivo coincide con el código de producto}
        {--aplicar : Guardar en MySQL las fotos encontradas; sin esta opción solamente verifica}
        {--reemplazar : Reemplazar fotografías existentes (solo con --aplicar)}';

    protected $description = 'Recupera fotos de productos desde archivos locales hacia la BD principal, sin inventar correspondencias';

    public function handle(): int
    {
        $raiz = realpath((string) $this->argument('carpeta'));
        if ($raiz === false || !is_dir($raiz) || !is_readable($raiz)) {
            $this->error('No se encuentra la carpeta de fotografías indicada.');
            return self::FAILURE;
        }

        $db = DB::connection();
        if (!Schema::hasTable('productos')) {
            $this->error('No existe la tabla productos en la base conectada.');
            return self::FAILURE;
        }

        $original = Schema::hasColumn('productos', 'id')
            && !Schema::hasColumn('productos', 'id_producto');
        $idCampo = $original ? 'id' : 'id_producto';
        $codigoCampo = $original ? 'codigo' : 'codigo_producto';

        if (!Schema::hasColumn('productos', 'foto')
            || !Schema::hasColumn('productos', $codigoCampo)) {
            $this->error('La tabla productos no tiene la columna foto o codigo. Ejecuta primero migraciones y respalda tu BD.');
            return self::FAILURE;
        }

        $this->info('Base de datos conectada: '.$db->getDatabaseName());
        $this->line('Esquema: '.($original ? 'original gym_system' : 'Laravel'));
        $this->line('Carpeta: '.$raiz);
        $this->line($this->option('aplicar')
            ? 'MODO APLICAR: se modificarán solamente fotos coincidentes en la tabla productos.'
            : 'MODO VISTA PREVIA: no se modificará ningún registro.');

        if ($this->option('aplicar')) {
            $this->warn('Asegúrate de tener un respaldo de MySQL antes de importar.');
        }

        $archivos = [];
        foreach (scandir($raiz) ?: [] as $nombre) {
            if ($nombre === '.' || $nombre === '..') continue;
            $ruta = $raiz.DIRECTORY_SEPARATOR.$nombre;
            if (!is_file($ruta) || is_link($ruta)
                || !preg_match('/\.(?:jpe?g|png|webp)$/i', $nombre)) continue;
            $clave = strtolower(pathinfo($nombre, PATHINFO_FILENAME));
            $archivos[$clave][] = $ruta;
        }

        $coinciden = 0;
        $aplicadas = 0;
        $omitidas = 0;
        $faltantes = 0;
        foreach ($db->table('productos')->orderBy($idCampo)
            ->get([$idCampo,$codigoCampo,'foto']) as $producto) {
            $codigo = strtolower(trim((string)($producto->{$codigoCampo} ?? '')));
            $id = (int)($producto->{$idCampo} ?? 0);
            if ($codigo === '' || $id < 1) {
                $faltantes++;
                continue;
            }

            $claves = [$codigo, 'producto_'.$id];
            $rutas = [];
            foreach ($claves as $clave) {
                foreach ($archivos[$clave] ?? [] as $ruta) $rutas[$ruta] = $ruta;
            }
            if (count($rutas) !== 1) {
                if (count($rutas) > 1) {
                    $this->warn("AMBIGUO {$codigo}: varios archivos coinciden. No se importó.");
                    $omitidas++;
                } else $faltantes++;
                continue;
            }

            $coinciden++;
            $fotoAnterior = trim((string)($producto->foto ?? ''));
            if ($fotoAnterior !== '' && !$this->option('reemplazar')) {
                $this->line("CONSERVADA {$codigo}: ya tiene foto en MySQL.");
                $omitidas++;
                continue;
            }

            $ruta = reset($rutas);
            if (!$this->option('aplicar')) {
                $this->line("LISTA {$codigo} <= ".basename($ruta));
                continue;
            }

            $imagen = $this->prepararImagen($ruta);
            if ($imagen === null) {
                $this->warn("NO IMPORTADA {$codigo}: formato, tamaño o resolución incorrecta.");
                $omitidas++;
                continue;
            }

            $query = $db->table('productos')->where($idCampo, $id);
            if (!$this->option('reemplazar')) {
                $query->where(function ($q) {
                    $q->whereNull('foto')->orWhere('foto', '=', '');
                });
            }
            $guardada = $query->update(['foto' => $imagen]);
            if ($guardada === 1) {
                $aplicadas++;
                $this->info("GUARDADA {$codigo}: fotografía en productos.foto");
            } else {
                $omitidas++;
                $this->warn("OMITIDA {$codigo}: otro proceso modificó la fotografía.");
            }
        }

        $this->newLine();
        $this->info("Coincidencias exactas: {$coinciden} | Guardadas: {$aplicadas} | Omitidas: {$omitidas} | Sin coincidencia: {$faltantes}");
        if (!$this->option('aplicar')) {
            $this->line('Para grabar tras revisar los códigos, repite con --aplicar.');
        }
        return self::SUCCESS;
    }

    private function prepararImagen(string $archivo): ?string
    {
        $tamano = @filesize($archivo);
        if (!is_int($tamano) || $tamano < 1 || $tamano > 15*1024*1024) return null;

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($archivo);
        if (!in_array($mime, ['image/png','image/jpeg','image/webp'], true)) return null;
        $info = @getimagesize($archivo);
        if (!$info || ($info[0] ?? 0) < 1 || ($info[1] ?? 0) < 1
            || ($info[0] * $info[1]) > 36_000_000) return null;

        $binario = file_get_contents($archivo);
        if ($binario === false) return null;
        $data = 'data:'.$mime.';base64,'.base64_encode($binario);
        if (strlen($data) <= 2_900_000) return $data;

        if (!extension_loaded('gd')) return null;
        $original = match ($mime) {
            'image/png' => @imagecreatefrompng($archivo),
            'image/jpeg' => @imagecreatefromjpeg($archivo),
            'image/webp' => @imagecreatefromwebp($archivo),
            default => false,
        };
        if (!$original) return null;

        try {
            foreach ([3840,3200,2560,2048,1600,1200] as $maximo) {
                $factor = min(1, $maximo / max($info[0], $info[1]));
                $ancho = max(1,(int)round($info[0]*$factor));
                $alto = max(1,(int)round($info[1]*$factor));
                $destino = imagecreatetruecolor($ancho,$alto);
                if (!$destino) continue;
                imagealphablending($destino,false);
                imagesavealpha($destino,true);
                imagecopyresampled($destino,$original,0,0,0,0,$ancho,$alto,$info[0],$info[1]);
                foreach ([88,80,72,64] as $calidad) {
                    ob_start();
                    if (function_exists('imagewebp')) {
                        $ok = imagewebp($destino,null,$calidad);
                        $tipo = 'image/webp';
                    } else {
                        $ok = imagejpeg($destino,null,$calidad);
                        $tipo = 'image/jpeg';
                    }
                    $bytes = ob_get_clean();
                    if ($ok && is_string($bytes) && $bytes !== '') {
                        $optimizada='data:'.$tipo.';base64,'.base64_encode($bytes);
                        if (strlen($optimizada) <= 2_900_000) {
                            imagedestroy($destino);
                            return $optimizada;
                        }
                    }
                }
                imagedestroy($destino);
            }
        } finally {
            imagedestroy($original);
        }

        return null;
    }
}
