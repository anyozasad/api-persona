# Mallqui Gym: ejecutar desde la raiz del repositorio api-persona.
# NO elimina bases, tablas, archivos .env ni fotos de productos.
# Hace respaldo SQL obligatorio antes de reparar gym_system.
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backend = Join-Path $raiz 'BACKEND'
$frontend = Join-Path $raiz 'FRONTEND\suma-angular'

function Paso([string]$mensaje) { Write-Host ('[MALLQUI] ' + $mensaje) -ForegroundColor Cyan }
function Detener([string]$mensaje) { throw $mensaje }
function Revisar([string]$accion) {
    if ($LASTEXITCODE -ne 0) { Detener ($accion + ' fallo. No se declarara la BD reparada.') }
}
function EstadoApi {
    try {
        return Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/estado-sistema' -TimeoutSec 4
    } catch {
        return $null
    }
}
function PuertoServidor {
    try {
        return (Get-NetTCPConnection -State Listen -LocalPort 8000 -ErrorAction Stop |
            Select-Object -First 1 -ExpandProperty OwningProcess)
    } catch {
        return $null
    }
}
function ArrancarBackend([string]$exe, [string]$carpeta) {
    Paso 'Iniciando el Laravel ACTUAL de esta carpeta (puerto 8000)...'
    Start-Process -FilePath $exe -ArgumentList @('artisan','serve','--host=127.0.0.1','--port=8000') -WorkingDirectory $carpeta
    for ($intento=0; $intento -lt 18; $intento++) {
        $estado = EstadoApi
        if ($null -ne $estado) { return $estado }
        Start-Sleep -Seconds 1
    }
    Detener 'Laravel no inicio en 8000. Revisa si otra aplicacion ocupa ese puerto.'
}

try {
    if (!(Test-Path -LiteralPath (Join-Path $backend 'artisan')) -or
        !(Test-Path -LiteralPath (Join-Path $frontend 'package.json'))) {
        Detener 'Esta no es la carpeta del proyecto Mallqui Gym con BACKEND y FRONTEND.'
    }
    Push-Location $raiz
    try {
        $remoto = (& git remote get-url origin).Trim()
        Revisar 'Lectura de git origin'
        if ($remoto -notmatch '(?i)github\.com[:/]anyozasad/api-persona(?:\.git)?/?$') {
            Detener ('No se actualizara otro proyecto. Repositorio detectado: ' + $remoto)
        }
        $rama = (& git branch --show-current).Trim()
        Revisar 'Lectura de rama Git'
        if ($rama -ne 'main') { Detener 'Cambia primero a la rama main de Mallqui Gym.' }

        $modificados = @(& git status --porcelain --untracked-files=no)
        Revisar 'Lectura de cambios locales'
        if ($modificados.Count -gt 0) {
            Paso 'Respaldando cambios de codigo locales con git stash (sin tocar datos o .env)...'
            & git stash push -m ('mallqui-respaldo-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
            Revisar 'Respaldo de cambios Git'
        }
        Paso 'Actualizando desde GitHub...'
        & git pull --ff-only origin main
        Revisar 'Actualizacion de GitHub'
        $revision = (& git rev-parse --short HEAD).Trim()
        Revisar 'Verificacion de version'
        Paso ('Codigo actualizado: ' + $revision)
    } finally {
        Pop-Location
    }

    $php = $null
    foreach ($candidato in @('C:\xampp\php\php.exe','D:\xampp\php\php.exe')) {
        if (Test-Path -LiteralPath $candidato -PathType Leaf) { $php=$candidato;break }
    }
    if (!$php) {
        $cmd = Get-Command php.exe,php -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($cmd) { $php = $cmd.Source }
    }
    if (!$php) { Detener 'No se encontro php.exe. Verifica XAMPP instalado en C: o D:.' }
    if (!(Test-Path -LiteralPath (Join-Path $backend '.env'))) {
        Detener 'Falta BACKEND/.env: primero configura la conexion MySQL existente.'
    }
    if (!(Test-Path -LiteralPath (Join-Path $backend 'vendor\autoload.php'))) {
        Detener 'Falta BACKEND/vendor. Ejecuta composer install antes de continuar.'
    }

    # Una captura indica gym_system. No cambiar datos en una base diferente.
    $lineaDb = @(Get-Content -LiteralPath (Join-Path $backend '.env') |
       Where-Object { $_ -match '^\s*DB_DATABASE\s*=' } | Select-Object -Last 1)
    if ($lineaDb.Count -eq 0) { Detener 'No se encontro DB_DATABASE en BACKEND/.env.' }
    $baseEnv = ($lineaDb[0] -replace '^\s*DB_DATABASE\s*=\s*','').Trim().Trim('"').Trim("'")
    if ($baseEnv -ne 'gym_system') {
        Detener ('La captura muestra gym_system, pero este .env indica "'+$baseEnv+'". No se modificara otra base.')
    }
    Paso ('Base que se va a verificar: ' + $baseEnv)

    Push-Location $backend
    try {
        & $php artisan optimize:clear
        Revisar 'Limpiar cache Laravel'

        Paso 'Comprobando tablas, IDs de cajas y ventas y vistas SQL...'
        $salidaInicial = @(& $php artisan db:verificar 2>&1)
        $problema = ($LASTEXITCODE -ne 0)
        $textoInicial = ($salidaInicial | Out-String)
        $salidaInicial | ForEach-Object { Write-Host $_ }
        # Aunque .env indique gym_system, DB_URL u otra configuracion podrian
        # apuntar a una BD diferente. Comprobar la conexion Laravel real.
        if ($textoInicial -notmatch 'BASE_ACTIVA:\s*gym_system\s*\|') {
            Detener 'Laravel NO esta usando gym_system. No se respaldara ni se modificara otra base. Revisa BACKEND/.env, DB_URL y el cache de configuracion.'
        }

        if ($problema) {
            Write-Host ''
            Write-Host 'MySQL necesita correccion. Se creara primero un respaldo SQL; si falla NO se modifica ningun registro.' -ForegroundColor Yellow
            $respuesta = Read-Host 'Escribe SI para autorizar el respaldo de gym_system y reparar sus datos'
            if ($respuesta -cne 'SI') { Detener 'Cancelado. MySQL no fue modificado.' }
            Paso 'Respaldando y reparando MySQL mediante Laravel actualizado...'
            & $php artisan db:reparar-gym --confirmar
            Revisar 'Respaldo SQL y reparacion'
            & $php artisan optimize:clear
            Revisar 'Recargar configuracion Laravel'
        } else {
            Paso 'No hay tablas ni identificadores pendientes; no se requiere modificar MySQL.'
        }

        Paso 'Comprobacion final en MySQL...'
        & $php artisan db:verificar
        Revisar 'Verificacion final de MySQL'
    } finally {
        Pop-Location
    }

    # Evitar que el dashboard abra el backend desactualizado de otra carpeta.
    $actual = EstadoApi
    if ($null -eq $actual) {
        $actual = ArrancarBackend $php $backend
    } elseif ($actual.sistema -ne 'Mallqui Gym') {
        Detener 'El puerto 8000 pertenece a otra API. Cierra ese servidor para iniciar Mallqui Gym.'
    }
    $shaLocal=(Get-FileHash -LiteralPath (Join-Path $backend 'app\Http\Controllers\VentaController.php') -Algorithm SHA256).Hash
    $shaRespaldo=(Get-FileHash -LiteralPath (Join-Path $backend 'app\Console\Commands\BackupDatabase.php') -Algorithm SHA256).Hash
    $shaReparador=(Get-FileHash -LiteralPath (Join-Path $backend 'app\Console\Commands\RepararMallquiLocal.php') -Algorithm SHA256).Hash
    if ([string]$actual.revision_ventas -ine $shaLocal -or
        [string]$actual.revision_respaldo -ine $shaRespaldo -or
        [string]$actual.revision_reparador -ine $shaReparador) {
        $pidServidor = PuertoServidor
        if (!$pidServidor) {
            Detener 'Hay un Laravel viejo en 8000. Cierra su terminal y vuelve a ejecutar este script.'
        }
        $proceso=Get-CimInstance Win32_Process -Filter ('ProcessId='+[int]$pidServidor) -ErrorAction SilentlyContinue
        $linea=[string]$proceso.CommandLine
        if ($linea -notmatch '(?i)(?:php(?:\.exe)?|artisan)(?:.|\s)*(?:artisan\s+serve|(?:-S|--port=8000)\s*127\.0\.0\.1)' ) {
            Detener ('Hay un backend antiguo en el puerto 8000 (PID '+$pidServidor+'). Cierra esa terminal y vuelve a ejecutar el script.')
        }
        Paso ('Cerrando SOLO el servidor PHP anterior de Mallqui Gym (PID '+$pidServidor+')...')
        Stop-Process -Id $pidServidor -ErrorAction Stop
        Start-Sleep -Milliseconds 900
        if (PuertoServidor) {
            Detener 'El servidor PHP antiguo se reinicio o el puerto sigue ocupado. Cierra el Laravel viejo manualmente.'
        }
        $actual = ArrancarBackend $php $backend
    }

    # Exigir que la API nueva sirva realmente el backup portable y el
    # reparador; no basta con que el login y Ventas esten actualizados.
    if ([string]$actual.revision_respaldo -ine $shaRespaldo -or
        [string]$actual.revision_reparador -ine $shaReparador -or
        [string]$actual.revision_ventas -ine $shaLocal) {
        Detener 'El backend sigue ejecutando codigo viejo de respaldo o ventas. Cierra los Laravel abiertos y ejecuta este script desde la carpeta actualizada.'
    }

    if ([string]$actual.base_datos -ne 'gym_system' -or
        $actual.database -ne $true -or
        $actual.operativo -ne $true -or
        @($actual.faltantes).Count -gt 0) {
        $razones=@($actual.faltantes | Where-Object { $_ })
        Detener ('La API del puerto 8000 no confirma MySQL correcto. Base: '+
            $actual.base_datos+'. Pendientes: '+($razones -join ', ')+'.')
    }

    Write-Host ''
    Write-Host 'VERIFICADO: LARAVEL Y MYSQL GYM_SYSTEM OPERATIVOS' -ForegroundColor Green
    Write-Host ('VERSION LOCAL: '+$revision) -ForegroundColor Green
    Write-Host 'Se conservaron los registros y el respaldo SQL de la reparacion.' -ForegroundColor Green
    Write-Host 'Abre http://localhost:4200/admin y presiona Ctrl+F5.' -ForegroundColor Green
} catch {
    Write-Host ('[MALLQUI ERROR] '+$_.Exception.Message) -ForegroundColor Red
    exit 1
}
