# Mallqui Gym | Inicio y diagnóstico en Windows (PowerShell 5.1+).
# Uso: powershell -ExecutionPolicy Bypass -File .\INICIAR_DASHBOARD.ps1
# Primera instalación: agregar -Preparar (instala composer/npm y crea .env si no existe).
# Esquema y datos mínimos: -Migrar ejecuta sistema:preparar SOLO con respaldo confirmado.
# Diagnóstico: agregar -SoloVerificar (no instala, migra ni inicia servicios).
[CmdletBinding()]
param(
    [switch]$Preparar,
    [switch]$Migrar,
    [switch]$SoloVerificar
)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
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
    $contenido = LeerApi 'http://127.0.0.1:8000/api/estado-sistema'
    if (-not $contenido) { return $null }
    try { return ConvertFrom-Json -InputObject $contenido } catch { return $null }
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
    if (-not $npm) { Fallar 'No encuentro npm. Instala Node.js 22 y vuelve a ejecutar este archivo.' }
    Informar ("PHP: " + $php)
    Informar ("npm: " + $npm)

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
        Avisar 'Las migraciones modifican la estructura de MySQL. Haz una copia de respaldo antes.'
        $respuesta = Read-Host '¿Tienes respaldo y autorizas sistema:preparar (esquema y datos iniciales)? Escribe SI'
        if ($respuesta -ne 'SI') { Fallar 'Migración cancelada; no se modificó la base.' }
        Ejecutar $php @('artisan','sistema:preparar') $backend
    }

    if ($SoloVerificar) {
        Informar 'Archivos, PHP, npm y dependencias presentes.'
        $estado = ObtenerEstadoBackend
        if ($null -eq $estado) {
            Avisar 'Laravel no responde en http://127.0.0.1:8000. La comprobación de MySQL requiere Laravel iniciado.'
        } elseif ($estado.database -eq $true -and $estado.operativo -eq $true) {
            Informar 'La API y las tablas obligatorias de MySQL están disponibles.'
        } else {
            Avisar 'La API responde, pero la base o sus tablas no están completas. Revisa MySQL y Sistema > Comprobación EFSRT.'
        }
        return
    }

    Informar 'Iniciando Laravel y Angular sin modificar la interfaz Mantis...'
    if (-not (LeerApi 'http://127.0.0.1:8000/up')) {
        Start-Process -FilePath $php -ArgumentList @('artisan','serve','--host=127.0.0.1','--port=8000') -WorkingDirectory $backend
    } else {
        Informar 'Laravel ya está iniciado en el puerto 8000.'
    }

    if (-not (LeerApi 'http://127.0.0.1:4200/')) {
        Start-Process -FilePath $npm -ArgumentList @('start','--','--host','127.0.0.1','--port','4200') -WorkingDirectory $frontend
    } else {
        Informar 'Angular ya está iniciado en el puerto 4200.'
    }

    $estado = $null
    for ($intento=0; $intento -lt 25; $intento++) {
        $estado = ObtenerEstadoBackend
        if ($null -ne $estado) { break }
        Start-Sleep -Seconds 1
    }
    if ($null -eq $estado) {
        Avisar 'Laravel no responde con la API Mallqui Gym. Comprueba la consola PHP y el puerto 8000.'
    } elseif ($estado.database -ne $true -or $estado.operativo -ne $true) {
        Avisar 'MySQL no está disponible o faltan tablas. Inicia MySQL desde XAMPP y revisa BACKEND/.env.'
        Avisar 'Si faltan tablas, usa -Migrar con respaldo previo: ejecuta sistema:preparar.'
    } else {
        Informar 'Backend y base de datos detectados.'
    }

    $angularDisponible = $false
    for ($intento=0; $intento -lt 45; $intento++) {
        if (LeerApi 'http://127.0.0.1:4200/') {
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
