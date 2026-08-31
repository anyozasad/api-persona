<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Angular integrado directamente en Laravel
|--------------------------------------------------------------------------
| Compila el frontend con: php artisan frontend:build
| Luego levanta Laravel con: php artisan serve
| La interfaz se abre directamente en http://127.0.0.1:8000
*/

$serveAngular = function () {
    $index = public_path('index.html');

    abort_unless(
        file_exists($index),
        503,
        'Frontend no compilado. Ejecuta: php artisan frontend:build'
    );

    $html = file_get_contents($index);

    // Incrusta TODOS los CSS generados por Angular directamente en el HTML.
    // Así la interfaz conserva el diseño aunque php artisan serve no cargue
    // correctamente una hoja de estilos externa.
    $css = '';
    foreach (glob(public_path('*.css')) ?: [] as $cssFile) {
        $css .= "\n/* " . basename($cssFile) . " */\n";
        $css .= file_get_contents($cssFile) . "\n";
    }

    if ($css !== '') {
        $style = '<style id="angular-inline-styles">' . str_replace('</style', '<\/style', $css) . '</style>';

        if (str_contains($html, '</head>')) {
            $html = str_replace('</head>', $style . '</head>', $html);
        } else {
            $html = $style . $html;
        }
    }

    return response($html, 200)
        ->header('Content-Type', 'text/html; charset=UTF-8')
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
};

Route::get('/', $serveAngular);

// Permite abrir directamente rutas Angular como /usuario y /admin.
// Se excluyen las rutas propias del backend/API.
Route::get('/{path}', $serveAngular)
    ->where('path', '^(?!api(?:/|$)|sanctum(?:/|$)|up$).*$');
