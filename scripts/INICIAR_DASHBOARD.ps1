# Mallqui Gym | Inicio y diagnóstico en Windows (PowerShell 5.1+).
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\INICIAR_DASHBOARD.ps1
# Primera instalación: agregar -Preparar (instala composer/npm y crea .env si no existe).
# Esquema y datos mínimos: -Migrar ejecuta sistema:preparar SOLO con respaldo confirmado.
# Diagnóstico: agregar -SoloVerificar (no instala, migra ni inicia servicios).
[CmdletBinding()]
param(
    [switch]$Preparar,
    [switch]$Migrar,
    [switch]$SoloVerificar,
    [switch]$RepararClientes
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

    $php = BuscarComando @('php.exe','php') @('C:\xampp\php\php.exe','C:\laragon\bin\php\php.exe')
    $npm = BuscarComando @('npm.cmd','npm.exe') @('C:\Program Files\nodejs\npm.cmd')
    $composer = BuscarComando @('composer.bat','composer.cmd','composer') @('C:\ProgramData\ComposerSetup\bin\composer.bat')

    if (-not $php) { Fallar 'No encuentro PHP. Abre XAMPP o instala PHP 8.2+ y revisa C:\xampp\php\php.exe.' }
    if (-not $npm -and -not $RepararClientes) { Fallar 'No encuentro npm. Instala Node.js 22 y vuelve a ejecutar este archivo.' }
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
        if ($null -ne $estado -and $estado.sistema -eq 'Mallqui Gym') {
            $faltantes = @($estado.faltantes | Where-Object { $_ -eq 'tabla:clientes' })
            if ($faltantes.Count -gt 0) {
                Fallar 'La API de puerto 8000 sigue sin reconocer la tabla clientes. Comprueba que Laravel usa la misma DB_DATABASE y reinicia el backend.'
            }
        }
        Informar 'Revisión de clientes completada. Verifica el registro en el dashboard.'
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

    if (-not (Test-Path $nodeModules)) {
        if ($Preparar -and -not $SoloVerificar) {
            Informar 'Instalando dependencias de Angular desde package-lock.json...'
            Ejecutar $npm @('ci','--no-audit','--no-fund') $frontend
        } else {
            Fallar 'Falta FRONTEND/suma-angular/node_modules. Ejecuta el archivo con -Preparar.'
        }
    }

    if ($Migrar) {
        if ($SoloVerificar) { Fallar 'No combines -Migrar y -SoloVerificar.' }
        Avisar 'La preparación puede modificar tablas y crear datos iniciales. Nunca elimina voluntariamente los registros.'
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
        Informar 'Sincronizando únicamente el esquema pendiente de Mallqui Gym...'
        Ejecutar $php @('artisan','sistema:preparar') $backend

        # Algunas instalaciones XAMPP contienen migraciones marcadas como
        # ejecutadas pero conservan columnas ausentes en tablas legacy.
        # Reconciliar el esquema real (sin fresh ni drop) tras el respaldo.
        Informar 'Revisando tablas y columnas reales de clientes, usuarios y módulos...'
        Ejecutar $php @('artisan','db:reconciliar-esquema') $backend

        # No informar éxito si el registro todavía carece de columnas.
        # El estado comprueba la conexión que usa el backend abierto.
        Ejecutar $php @('artisan','optimize:clear') $backend
        $estadoFinal = ObtenerEstadoBackend
        if ($null -ne $estadoFinal -and $estadoFinal.sistema -eq 'Mallqui Gym' -and $estadoFinal.database -eq $true) {
            $pendientesRegistro = @($estadoFinal.faltantes | Where-Object {
                $_ -match '^(clientes|usuarios|personal_access_tokens)(\.|$|:)'
            })
            if ($pendientesRegistro.Count -gt 0) {
                Avisar ('Aún faltan campos del registro: ' + ($pendientesRegistro -join ', '))
                Fallar 'No se pudo completar el esquema de registro; revisa las advertencias anteriores.'
            }
        }
        Informar 'La preparación y conciliación terminaron. Conserva el respaldo SQL.'
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

    $paginaYaAbierta = LeerApi 'http://127.0.0.1:4200/'
    VerificarFrontendMallqui $paginaYaAbierta
    if (-not $paginaYaAbierta) {
        Start-Process -FilePath $npm -ArgumentList @('start','--','--host','127.0.0.1','--port','4200') -WorkingDirectory $frontend
    } else {
        Informar 'El frontend correcto de Mallqui Gym ya está iniciado en el puerto 4200.'
    }

    $estado = $null
    for ($intento=0; $intento -lt 25; $intento++) {
        $estado = ObtenerEstadoBackend
        if ($null -ne $estado) { break }
        Start-Sleep -Seconds 1
    }
    VerificarServidorMallqui $estado
    if ($null -eq $estado) {
        Avisar 'Laravel no responde con la API Mallqui Gym. Comprueba la consola PHP y el puerto 8000.'
    } elseif ($estado.database -ne $true) {
        Avisar 'MySQL no está disponible. Enciende MySQL desde XAMPP y revisa BACKEND/.env.'
    } elseif ($estado.operativo -ne $true) {
        $cantidadFaltantes = @($estado.faltantes).Count
        Avisar ("MySQL responde, pero el esquema requiere revisión (" + $cantidadFaltantes + " requisitos pendientes).")
        Avisar 'Para crear respaldo automáticamente y preparar tablas, ejecuta este script con -Migrar.'
    } else {
        Informar 'Backend y base de datos detectados.'
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
