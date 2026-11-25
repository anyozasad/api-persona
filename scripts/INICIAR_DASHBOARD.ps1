# Mallqui Gym | Inicio y diagnóstico en Windows (PowerShell 5.1+).
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\INICIAR_DASHBOARD.ps1
# Primera instalación: agregar -Preparar (instala composer/npm y crea .env si no existe).
# Solo esquema MySQL: -Migrar respalda, reconcilia y verifica SIN arrancar Angular ni sembrar datos.
# Diagnóstico: agregar -SoloVerificar (no instala, migra ni inicia servicios).
[CmdletBinding()]
param(
    [switch]$Preparar,
    [switch]$Migrar,
    [switch]$SoloVerificar,
    [switch]$RepararClientes,
    [switch]$RepararMembresias
)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backend = Join-Path $raiz 'BACKEND'
$frontend = Join-Path $raiz 'FRONTEND\suma-angular'

function Informar([string]$texto) {
    Write-Host ("[Mallqui Gym] " + $texto) -ForegroundColor Cyan
}
function Avisar([string]$texto) {
    Write-Host ("[ATENCION] " + $texto) -ForegroundColor Yellow
}
function Fallar([string]$texto) {
    Write-Host ("[ERROR] " + $texto) -ForegroundColor Red
    throw $texto
}
function BuscarComando([string[]]$nombres, [string[]]$alternativas) {
    foreach ($nombre in $nombres) {
        $comando = Get-Command $nombre -ErrorAction SilentlyContinue
        if ($null -ne $comando) {
            if ($comando.Source) { return $comando.Source }
            if ($comando.Path) { return $comando.Path }
        }
    }
    foreach ($ruta in $alternativas) {
        if (Test-Path -LiteralPath $ruta -PathType Leaf) { return $ruta }
    }
    return $null
}
function Ejecutar([string]$comando, [string[]]$argumentos, [string]$carpeta) {
    Push-Location $carpeta
    try {
        & $comando @argumentos
        if ($LASTEXITCODE -ne 0) {
            Fallar "Falló el comando $comando (código $LASTEXITCODE)."
        }
    } finally {
        Pop-Location
    }
}
function LeerApi([string]$ruta) {
    try {
        $respuesta = Invoke-WebRequest -Uri $ruta -UseBasicParsing -TimeoutSec 3
        if ($respuesta.StatusCode -ge 200 -and $respuesta.StatusCode -lt 300) {
            return $respuesta.Content
        }
    } catch {}
    return $null
}
function ObtenerEstadoBackend {
    # Leer también el JSON de HTTP 503: Mallqui Gym devuelve ese estado cuando
    # MySQL está apagado. No confundir ese error con un proyecto diferente.
    $respuesta = $null
    try {
        $solicitud = [System.Net.WebRequest]::Create('http://127.0.0.1:8000/api/estado-sistema')
        $solicitud.Timeout = 3000
        try {
            $respuesta = $solicitud.GetResponse()
        } catch [System.Net.WebException] {
            $respuesta = $_.Exception.Response
        }
        if ($null -eq $respuesta) { return $null }
        $flujo = $respuesta.GetResponseStream()
        if ($null -eq $flujo) { return $null }
        $lector = New-Object System.IO.StreamReader($flujo)
        try {
            $contenido = $lector.ReadToEnd()
        } finally {
            $lector.Dispose()
        }
        if (-not $contenido) { return $null }
        return ConvertFrom-Json -InputObject $contenido
    } catch {
        return $null
    } finally {
        if ($null -ne $respuesta) { $respuesta.Close() }
    }
}
function VerificarServidorMallqui([object]$estado) {
    if ($null -ne $estado -and $estado.sistema -ne 'Mallqui Gym') {
        Fallar 'El puerto 8000 responde, pero NO es la API de Mallqui Gym actual. Deten el otro servidor Laravel que usa el puerto 8000 antes de abrir este proyecto.'
    }
    # Es posible tener dos copias de Mallqui Gym abiertas: una actualizada en
    # GitHub y otra vieja escuchando en localhost:8000. Ambas responden el
    # mismo nombre; impedir la reparación contra el servidor equivocado.
    if ($null -ne $estado -and $estado.revision_mysql -ne 'mallqui-esquema-respaldo-20261123') {
        Fallar 'El Laravel del puerto 8000 está desactualizado o corresponde a otra copia del gimnasio. Detén ese servidor e inicia BACKEND de esta carpeta antes de reparar MySQL.'
    }
    # Comparar el controlador que realmente ejecuta localhost:8000 con el
    # archivo de esta carpeta. Dos copias diferentes de Mallqui Gym pueden
    # compartir el mismo título y la misma revisión de base de datos.
    if ($null -ne $estado) {
        $archivoVentas = Join-Path $backend 'app\Http\Controllers\VentaController.php'
        $revisionLocal = (Get-FileHash -LiteralPath $archivoVentas -Algorithm SHA256).Hash
        $revisionServidor = [string]$estado.revision_ventas
        if ([string]::IsNullOrWhiteSpace($revisionServidor) -or
            $revisionServidor -ine $revisionLocal) {
            Fallar 'El Laravel del puerto 8000 no está ejecutando la versión nueva de Ventas de ESTA carpeta. Cierra el servidor Laravel anterior y vuelve a ejecutar este iniciador; así evitarás repetir el error de MySQL con código viejo.'
        }
    }
}
function VerificarFrontendMallqui([string]$html) {
    # Además del título, exigir la marca de la copia actual del frontend.
    if ($html -and ($html -notmatch '(?is)<title>\s*Mallqui Gym\s*</title>' -or
                    $html -notmatch 'mallqui-repositorio' -or
                    $html -notmatch 'anyozasad/api-persona')) {
        Fallar 'El puerto 4200 muestra otro proyecto o una copia antigua de Mallqui Gym. Deten el servidor Angular que ocupa 4200 y vuelve a ejecutar este iniciador desde la carpeta api-persona actualizada.'
    }
}

try {
    if (-not (Test-Path (Join-Path $backend 'artisan') -PathType Leaf) -or
        -not (Test-Path (Join-Path $frontend 'package.json') -PathType Leaf)) {
        Fallar 'Ejecuta este archivo desde la carpeta principal del repositorio que contiene BACKEND y FRONTEND.'
    }

    $php = BuscarComando @('php.exe','php') @('C:\xampp\php\php.exe','D:\xampp\php\php.exe','C:\laragon\bin\php\php.exe')
    $npm = BuscarComando @('npm.cmd','npm.exe') @('C:\Program Files\nodejs\npm.cmd')
    $composer = BuscarComando @('composer.bat','composer.cmd','composer') @('C:\ProgramData\ComposerSetup\bin\composer.bat')

    if (-not $php) { Fallar 'No encuentro PHP. Abre XAMPP o instala PHP 8.2+ y revisa C:\xampp\php\php.exe.' }
    if (-not $npm -and -not $Migrar -and -not $RepararClientes -and -not $RepararMembresias) { Fallar 'No encuentro npm. Instala Node.js 22 y vuelve a ejecutar este archivo.' }
    $versionPhp = & $php -r 'echo PHP_VERSION_ID;'
    $idVersionPhp = 0
    if ($LASTEXITCODE -ne 0 -or -not [int]::TryParse([string]$versionPhp, [ref]$idVersionPhp)) {
        Fallar 'No se pudo comprobar la versión del PHP ejecutable.'
    }
    if ($idVersionPhp -lt 80200) {
        Fallar ("PHP " + (& $php -r 'echo PHP_VERSION;') + ' es incompatible con Laravel 12. Configura PHP 8.2 o superior antes de iniciar el dashboard.')
    }
    Informar ("PHP: " + $php)
    Informar ("npm: " + $npm)

    # Ruta corta para el error exacto "Faltan en MySQL: tabla:clientes".
    # No invoca las migraciones de todos los módulos; respaldo y creación
    # segura se gestionan dentro del comando Laravel.
    if ($RepararClientes) {
        if ($Migrar -or $SoloVerificar) {
            Fallar 'Usa -RepararClientes por separado, sin -Migrar ni -SoloVerificar.'
        }
        if (-not (Test-Path (Join-Path $backend '.env') -PathType Leaf) -or
            -not (Test-Path (Join-Path $backend 'vendor\autoload.php') -PathType Leaf)) {
            Fallar 'Faltan .env o vendor del backend. Primero completa la instalación de Laravel.'
        }
        Informar 'Verificando y reparando exclusivamente la tabla clientes de MySQL...'
        Ejecutar $php @('artisan','db:asegurar-clientes') $backend
        Ejecutar $php @('artisan','optimize:clear') $backend
        $estado = ObtenerEstadoBackend
        if ($null -eq $estado) {
            Avisar 'La tabla clientes se reparó mediante CLI, pero el Laravel del puerto 8000 no respondió. Inicia el backend y comprueba su base de datos.'
            return
        }
        VerificarServidorMallqui $estado
        if ($estado.database -ne $true) {
            Fallar 'Laravel del puerto 8000 no se conecta a MySQL. Comprueba DB_DATABASE del backend que está ejecutándose.'
        }
        $faltantes = @($estado.faltantes | Where-Object { $_ -eq 'tabla:clientes' })
        if ($faltantes.Count -gt 0) {
            Avisar ('Base de datos del servidor activo: ' + $estado.base_datos)
            Fallar 'La API de puerto 8000 sigue sin reconocer la tabla clientes. El Laravel activo puede usar otra DB_DATABASE o una copia distinta del proyecto.'
        }
        Informar ('La API Mallqui Gym reconoce la tabla clientes en: ' + $estado.base_datos)
        Informar 'Revisión de clientes completada. Verifica el registro en el dashboard.'
        return
    }

    # Reparación limitada a las 3 tablas de tarifas, contratos y pagos.
    # Se puede ejecutar desde FRONTEND mediante npm run reparar:membresias.
    if ($RepararMembresias) {
        if ($Migrar -or $SoloVerificar -or $RepararClientes) {
            Fallar 'Usa -RepararMembresias sin otros modos de reparación o migración.'
        }
        if (-not (Test-Path (Join-Path $backend '.env') -PathType Leaf) -or
            -not (Test-Path (Join-Path $backend 'vendor\autoload.php') -PathType Leaf)) {
            Fallar 'Faltan .env o vendor del backend. Revisa la instalación de Laravel.'
        }
        Informar 'Revisando únicamente tablas de membresías y pagos de MySQL...'
        Ejecutar $php @('artisan','db:asegurar-membresias') $backend
        Ejecutar $php @('artisan','optimize:clear') $backend

        $estado = ObtenerEstadoBackend
        if ($null -eq $estado) {
            Avisar 'La reparación CLI terminó, pero Laravel del puerto 8000 no respondió. Inicia el backend para verificar.'
            return
        }
        VerificarServidorMallqui $estado
        if ($estado.database -ne $true) {
            Fallar 'Laravel del puerto 8000 no está conectado a MySQL.'
        }
        $faltantes = @($estado.faltantes | Where-Object {
            $_ -match '^(tabla:)?(membresias|cliente_membresia|pagos_membresia|cajas|movimientos_caja)(\.|$)'
        })
        if ($faltantes.Count -gt 0) {
            Avisar ('Base del Laravel activo: ' + $estado.base_datos)
            Fallar ('La API todavía encuentra elementos de membresías ausentes: ' + ($faltantes -join ', '))
        }
        Informar ('El Laravel activo reconoce las tablas de membresías en: ' + $estado.base_datos)
        Informar 'Esquema comprobado; verifica los planes y asignaciones en el navegador.'
        return
    }

    $nuevoEnv = $false
    $archivoEnv = Join-Path $backend '.env'
    $vendor = Join-Path $backend 'vendor\autoload.php'
    $nodeModules = Join-Path $frontend 'node_modules\@angular\cli\bin\ng.js'
    if (-not (Test-Path $archivoEnv)) {
        if ($Preparar -and -not $SoloVerificar) {
            Copy-Item (Join-Path $backend '.env.example') $archivoEnv
            Informar 'Se creó BACKEND/.env desde el ejemplo. Comprueba DB_DATABASE, usuario y contraseña.'
            $nuevoEnv = $true
        } else {
            Fallar 'Falta BACKEND/.env. Ejecuta el script con -Preparar.'
        }
    }

    if (-not (Test-Path $vendor)) {
        if ($Preparar -and -not $SoloVerificar) {
            if (-not $composer) { Fallar 'Falta Composer. Instálalo y asegúrate de que esté en PATH.' }
            Informar 'Instalando dependencias de Laravel...'
            Ejecutar $composer @('install','--no-interaction','--prefer-dist') $backend
        } else {
            Fallar 'Falta BACKEND/vendor. Ejecuta este archivo con -Preparar.'
        }
    }

    if ($nuevoEnv) {
        Ejecutar $php @('artisan','key:generate','--force') $backend
    }

    if (-not $Migrar -and -not (Test-Path $nodeModules)) {
        if ($Preparar -and -not $SoloVerificar) {
            Informar 'Instalando dependencias de Angular desde package-lock.json...'
            Ejecutar $npm @('ci','--no-audit','--no-fund') $frontend
        } else {
            Fallar 'Falta FRONTEND/suma-angular/node_modules. Ejecuta el archivo con -Preparar.'
        }
    }

    if ($Migrar) {
        if ($SoloVerificar) { Fallar 'No combines -Migrar y -SoloVerificar.' }
        # Validar el puerto 8000 ANTES de modificar tablas del .env local.
        # Si hay otra copia Laravel abierta no mezclar dos bases diferentes.
        $estadoAntes = ObtenerEstadoBackend
        VerificarServidorMallqui $estadoAntes
        Avisar 'Se revisará SOLAMENTE la estructura de MySQL; no se crearán socios, ventas, productos ni tarifas ficticias.'
        $respuesta = Read-Host '¿Autorizas crear primero un respaldo SQL y después preparar las tablas faltantes? Escribe SI'
        if ($respuesta -ne 'SI') { Fallar 'Preparación cancelada; no se modificó la base.' }

        # No permitir migraciones sobre la base del gimnasio si no se pudo
        # guardar una copia SQL NUEVA y con contenido.
        $inicioRespaldo = (Get-Date).ToUniversalTime()
        Informar 'Creando respaldo preventivo completo de MySQL con mysqldump...'
        Ejecutar $php @('artisan','backup:database') $backend
        $carpetaRespaldos = Join-Path $backend 'storage\app\backups'
        $nuevoRespaldo = Get-ChildItem -LiteralPath $carpetaRespaldos -Filter '*.sql' -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Length -gt 200 -and $_.LastWriteTimeUtc -ge $inicioRespaldo } |
            Sort-Object -Property LastWriteTimeUtc -Descending |
            Select-Object -First 1
        if ($null -eq $nuevoRespaldo) {
            Fallar 'Respaldo SQL no confirmado. Preparación cancelada antes de alterar tablas.'
        }
        Informar ('Respaldo SQL verificado: ' + $nuevoRespaldo.FullName)
        # No ejecutar sistema:preparar aquí: además de migraciones, siembra
        # configuraciones y puede fallar antes de revisar todos los módulos.
        # Recuperar el ESQUEMA REAL directamente, sin borrar datos ni tablas.
        Informar 'Recuperando tablas y columnas reales de TODOS los módulos de MySQL...'
        Ejecutar $php @('artisan','db:reconciliar-esquema') $backend

        # Exigir verificación independiente de tablas y vistas. Nunca presentar
        # "reparado" mientras db:verificar encuentre objetos ausentes.
        Informar 'Verificando todas las tablas, columnas y vistas obligatorias...'
        Ejecutar $php @('artisan','db:verificar') $backend

        # No informar éxito si el registro todavía carece de columnas.
        # El estado comprueba la conexión que usa el backend abierto.
        Ejecutar $php @('artisan','optimize:clear') $backend
        # Verificar todas las tablas y columnas utilizadas por el dashboard,
        # no solamente clientes. Evitar mensajes de éxito engañosos.
        $estadoFinal = ObtenerEstadoBackend
        if ($null -eq $estadoFinal) {
            Avisar 'La conciliación se ejecutó, pero Laravel del puerto 8000 no responde para verificarla.'
            Avisar 'Inicia el backend de este proyecto y usa el modo -SoloVerificar.'
            Informar 'El respaldo SQL previo fue conservado.'
            return
        }
        VerificarServidorMallqui $estadoFinal
        if ($estadoFinal.database -ne $true) {
            Fallar 'La API de Laravel no está conectada a MySQL. Comprueba el servidor activo y DB_DATABASE.'
        }
        Informar ('Base activa verificada por Laravel: ' + $estadoFinal.base_datos)
        $faltantesGlobal = @($estadoFinal.faltantes | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) })
        if ($faltantesGlobal.Count -gt 0 -or $estadoFinal.operativo -ne $true) {
            Avisar ('La API todavía detecta ' + $faltantesGlobal.Count + ' tablas/columnas obligatorias pendientes.')
            $faltantesGlobal | Select-Object -First 40 | ForEach-Object { Avisar ('Falta: ' + $_) }
            Fallar 'El esquema MySQL del dashboard no está completo. No se puede declarar reparado.'
        }
        Informar 'Base MySQL verificada: todas las tablas y columnas obligatorias están disponibles.'
        Informar 'Conserva el respaldo SQL.'
        return
    }

    if ($SoloVerificar) {
        Informar 'Archivos, PHP, npm y dependencias presentes.'
        $estado = ObtenerEstadoBackend
        VerificarServidorMallqui $estado
        $htmlAngular = LeerApi 'http://127.0.0.1:4200/'
        VerificarFrontendMallqui $htmlAngular
        if ($null -eq $estado) {
            Avisar 'Laravel no responde en http://127.0.0.1:8000. La comprobación de MySQL requiere Laravel iniciado.'
        } elseif ($estado.database -eq $true -and $estado.operativo -eq $true) {
            Informar 'La API y las tablas obligatorias de MySQL están disponibles.'
        } elseif ($estado.database -eq $true) {
            Avisar ('MySQL está conectado, pero quedan ' + @($estado.faltantes).Count + ' requisitos de esquema pendientes.')
            Avisar 'Revisa Configuración > Información del sistema > Diagnóstico avanzado.'
        } else {
            Avisar 'La API responde pero MySQL no está conectado. Enciende MySQL en XAMPP.'
        }
        return
    }

    Informar 'Iniciando Laravel y Angular sin modificar el diseño actual...'
    $laravelYaAbierto = LeerApi 'http://127.0.0.1:8000/up'
    if (-not $laravelYaAbierto) {
        Start-Process -FilePath $php -ArgumentList @('artisan','serve','--host=127.0.0.1','--port=8000') -WorkingDirectory $backend
    } else {
        $estadoServidor = ObtenerEstadoBackend
        if ($null -eq $estadoServidor) {
            Fallar 'El puerto 8000 tiene un servidor activo, pero no responde como Mallqui Gym. No se iniciará sobre un backend equivocado.'
        }
        VerificarServidorMallqui $estadoServidor
        Informar 'La API correcta de Mallqui Gym ya está iniciada en el puerto 8000.'
    }

    $estado = $null
    for ($intento=0; $intento -lt 25; $intento++) {
        $estado = ObtenerEstadoBackend
        if ($null -ne $estado) { break }
        Start-Sleep -Seconds 1
    }
    VerificarServidorMallqui $estado
    if ($null -eq $estado) {
        Fallar 'No se abrirá un dashboard sin guardado: Laravel no responde. Revisa PHP, el puerto 8000 y XAMPP.'
    } elseif ($estado.database -ne $true) {
        Fallar 'No se abrirá un dashboard que no guarda datos: MySQL no está conectado. Enciende MySQL desde XAMPP y revisa BACKEND/.env.'
    } elseif ($estado.operativo -ne $true) {
        $cantidadFaltantes = @($estado.faltantes).Count
        Avisar ("La base MySQL " + $estado.base_datos + " tiene " + $cantidadFaltantes + " requisitos pendientes.")
        Avisar 'No se abrirá el panel como si estuviera completo. Puedes recuperar las tablas desde aquí, sin ejecutar -Migrar.'
        $respuestaReparar = Read-Host '¿Crear respaldo SQL y reparar los módulos faltantes ahora? Escribe SI'
        if ($respuestaReparar -eq 'SI') {
            # Misma reparación que el botón web, pero el comando CLI evita
            # los límites de tiempo de una petición HTTP de XAMPP.
            Informar 'Creando respaldo y reconciliando MySQL sin borrar registros...'
            Ejecutar $php @('artisan','db:reparar-gym','--confirmar') $backend
            Ejecutar $php @('artisan','optimize:clear') $backend
            $estadoReparado = ObtenerEstadoBackend
            VerificarServidorMallqui $estadoReparado
            if ($null -eq $estadoReparado -or $estadoReparado.database -ne $true) {
                Fallar 'La reparación terminó por CLI, pero Laravel no puede verificar MySQL. Revisa el backend del puerto 8000.'
            }
            if ($estadoReparado.operativo -ne $true) {
                $pendientes = @($estadoReparado.faltantes | Where-Object { $_ })
                $pendientes | Select-Object -First 15 | ForEach-Object { Avisar ('Pendiente: ' + $_) }
                Fallar 'La API aún detecta elementos pendientes. No declarar terminado y revisar el respaldo SQL.'
            }
            Informar ('MySQL reparado y verificado en la base ' + $estadoReparado.base_datos + '.')
        } else {
            Fallar 'No se abrirá el dashboard con tablas o columnas incompletas. MySQL no fue modificado. Para reparar con respaldo puedes ejecutar nuevamente el iniciador y autorizarlo cuando lo solicite.'
        }
    } else {
        Informar ('Backend y MySQL operativos: ' + $estado.base_datos)
    }

    # Arrancar Angular SOLO después de comprobar que Laravel conoce las tablas
    # necesarias. No exponer formularios capaces de mostrar éxitos engañosos.
    $paginaYaAbierta = LeerApi 'http://127.0.0.1:4200/'
    VerificarFrontendMallqui $paginaYaAbierta
    if (-not $paginaYaAbierta) {
        Start-Process -FilePath $npm -ArgumentList @('start','--','--host','127.0.0.1','--port','4200') -WorkingDirectory $frontend
    } else {
        Informar 'El frontend correcto de Mallqui Gym ya está iniciado en el puerto 4200.'
    }

    $angularDisponible = $false
    for ($intento=0; $intento -lt 45; $intento++) {
        $htmlAngular = LeerApi 'http://127.0.0.1:4200/'
        VerificarFrontendMallqui $htmlAngular
        if ($htmlAngular) {
            $angularDisponible = $true
            break
        }
        Start-Sleep -Seconds 1
    }
    if ($angularDisponible) {
        Informar 'Abriendo Mallqui Gym. Entra con tu cuenta Administrador.'
        Start-Process 'http://127.0.0.1:4200/admin'
    } else {
        Avisar 'Angular no respondió en el puerto 4200. Lee los errores de la consola de Angular.'
    }
} catch {
    Write-Host ('[Mallqui Gym] ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
