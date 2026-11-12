# Reparacion local del inicio de sesion de Mallqui Gym (Windows PowerShell 5.1+).
# No elimina registros, no restablece contrasenas y no modifica el frontend.
param(
    [switch]$RepararEsquema
)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $raiz 'BACKEND'

function Titulo([string]$mensaje) {
    Write-Host ""
    Write-Host "=== $mensaje ===" -ForegroundColor Cyan
}

function Fallar([string]$mensaje) {
    Write-Host "ERROR: $mensaje" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $backend 'artisan'))) {
    Fallar 'No se encuentra BACKEND/artisan. Ejecuta el script desde la raiz del proyecto api-persona.'
}

Titulo '1. Buscando PHP 8.2 o superior'
$rutas = @(where.exe php 2>$null | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique)
$opciones = @()
foreach ($ruta in $rutas) {
    try {
        $version = (& $ruta -r 'echo PHP_VERSION;' 2>$null | Out-String).Trim()
        $numero = [version](($version -split '-')[0])
        if ($numero -ge [version]'8.2') {
            $opciones += [pscustomobject]@{ Ruta = $ruta; Numero = $numero }
        }
    } catch { }
}
if ($opciones.Count -eq 0) {
    Fallar 'No se encontro PHP >= 8.2. Comprueba where.exe php y la instalacion PHP 8.3.'
}
$elegido = $opciones | Sort-Object Numero -Descending | Select-Object -First 1
$php = $elegido.Ruta
Write-Host "PHP: $php ($($elegido.Numero))" -ForegroundColor Green

Titulo '2. Comprobando extensiones necesarias'
$base = Split-Path -Parent $php
$extDir = Join-Path $base 'ext'
$phpArgs = @()
if (Test-Path $extDir) {
    $phpArgs += @('-d', "extension_dir=$extDir")
}
$modulos = @(& $php -m 2>$null)
foreach ($modulo in @('pdo_mysql', 'mbstring', 'openssl', 'fileinfo')) {
    if ($modulos -contains $modulo) {
        Write-Host "OK: $modulo" -ForegroundColor Green
        continue
    }
    $dll = Join-Path $extDir ("php_" + $modulo + ".dll")
    if (-not (Test-Path $dll)) {
        Fallar "Falta la extension $modulo en PHP 8.3. Comprueba el directorio ext y php.ini del PHP seleccionado."
    }
    $phpArgs += @('-d', "extension=$modulo")
    Write-Host "Se habilitara $modulo solo para este proceso." -ForegroundColor Yellow
}
$modulosVerificados = @(& $php @phpArgs -m 2>&1)
if ($LASTEXITCODE -ne 0) {
    $modulosVerificados | Out-Host
    Fallar 'PHP no pudo cargar las extensiones.'
}
foreach ($modulo in @('pdo_mysql', 'mbstring', 'openssl', 'fileinfo')) {
    if ($modulosVerificados -notcontains $modulo) {
        Fallar "PHP todavia no carga $modulo. Revisa las advertencias de extension y php.ini."
    }
}

Titulo '3. Comprobando Laravel'
Push-Location $backend
try {
    if (-not (Test-Path '.env')) {
        Copy-Item '.env.example' '.env'
        Write-Host 'Creado BACKEND/.env desde .env.example.' -ForegroundColor Green
    }

    $envTexto = Get-Content '.env' -Raw
    $dbMatch = [regex]::Match($envTexto, '(?m)^\s*DB_DATABASE\s*=\s*["'']?([^"''\r\n#]+)')
    if (-not $dbMatch.Success) {
        Fallar 'Configura DB_DATABASE=gym_system en BACKEND/.env antes de continuar.'
    }
    $nombreBd = $dbMatch.Groups[1].Value.Trim()
    Write-Host "Base configurada: $nombreBd"
    if ($nombreBd -ne 'gym_system') {
        Fallar "La base no es gym_system. Comprueba el .env; por seguridad no se modificara la base $nombreBd."
    }

    $clave = [regex]::Match($envTexto, '(?m)^\s*APP_KEY\s*=\s*(.*)$')
    $claveActual = if ($clave.Success) { $clave.Groups[1].Value.Trim().Trim('"').Trim("'") } else { '' }
    if ([string]::IsNullOrWhiteSpace($claveActual)) {
        Write-Host 'Generando APP_KEY porque no existe...'
        & $php @phpArgs artisan key:generate --force
        if ($LASTEXITCODE -ne 0) { Fallar 'No se pudo generar APP_KEY.' }
    }
    & $php @phpArgs artisan optimize:clear
    if ($LASTEXITCODE -ne 0) {
        Fallar 'Laravel no pudo limpiar la cache de configuracion. Revisa el error anterior.'
    }

    Titulo '4. Verificando conexion y tablas'
    & $php @phpArgs artisan db:verificar
    $esquemaOk = $LASTEXITCODE -eq 0

    if (-not $esquemaOk) {
        if (-not $RepararEsquema) {
            Write-Host 'Hay objetos faltantes. Para respaldar y preparar el esquema, ejecuta:' -ForegroundColor Yellow
            Write-Host 'powershell -ExecutionPolicy Bypass -File .\REPARAR_LOGIN_MALLQUI.ps1 -RepararEsquema'
            exit 2
        }

        Titulo '5. Respaldando la base antes de modificar tablas'
        $dumpXampp = 'C:\xampp\mysql\bin\mysqldump.exe'
        if (Test-Path $dumpXampp) {
            $env:MYSQLDUMP_PATH = $dumpXampp
        } else {
            $dumpCmd = Get-Command mysqldump -ErrorAction SilentlyContinue
            if ($null -eq $dumpCmd) {
                Fallar 'No se encuentra mysqldump. Se cancela la migracion para proteger tus datos.'
            }
            $env:MYSQLDUMP_PATH = $dumpCmd.Source
        }
        & $php @phpArgs artisan backup:database
        if ($LASTEXITCODE -ne 0) {
            Fallar 'No se pudo crear el respaldo SQL. Se cancela la modificacion de la base.'
        }

        Titulo '6. Preparando tablas faltantes con el comando del proyecto'
        & $php @phpArgs artisan sistema:preparar
        if ($LASTEXITCODE -ne 0) {
            Fallar 'La preparacion encontro un error. Revisa el mensaje anterior y usa el respaldo creado.'
        }
        & $php @phpArgs artisan db:verificar
        if ($LASTEXITCODE -ne 0) {
            Fallar 'Todavia faltan objetos de la base. El login puede seguir fallando.'
        }
    }

    Titulo '7. Comprobando ruta de login'
    & $php @phpArgs artisan route:list --path=api/auth/login
    if ($LASTEXITCODE -ne 0) {
        Fallar 'No se puede leer la ruta de autenticacion.'
    }
    Write-Host ''
    Write-Host 'Configuracion y esquema verificados.' -ForegroundColor Green
    $servidorOcupado = $false
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $pendiente = $tcp.BeginConnect('127.0.0.1', 8000, $null, $null)
        if ($pendiente.AsyncWaitHandle.WaitOne(350)) {
            $tcp.EndConnect($pendiente)
            $servidorOcupado = $true
        }
        $pendiente.AsyncWaitHandle.Close()
    } catch { } finally {
        $tcp.Close()
    }
    if ($servidorOcupado) {
        Write-Host 'El puerto 8000 ya esta ocupado. Deten el Laravel anterior con Ctrl+C y ejecuta de nuevo este script.' -ForegroundColor Yellow
    } else {
        Write-Host 'Iniciando Laravel con PHP compatible en http://127.0.0.1:8000' -ForegroundColor Green
        Write-Host 'Mantén esta ventana abierta. Para detener el servidor usa Ctrl+C.'
        & $php @phpArgs artisan serve --host=127.0.0.1 --port=8000
    }
    Write-Host 'Si el login aun devuelve error 500, revisa BACKEND/storage/logs; el error concreto dependera de la base local.'
} finally {
    Pop-Location
}
