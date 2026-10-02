$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function PortOpen([int]$port) {
    try { return [bool](Test-NetConnection 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue) }
    catch { return $false }
}

function FindPhp {
    $candidates = @()
    $wingetRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
    if (Test-Path $wingetRoot) {
        $candidates += Get-ChildItem $wingetRoot -Directory -Filter 'PHP.PHP.8.*' -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { Get-ChildItem $_.FullName -Recurse -Filter php.exe -ErrorAction SilentlyContinue } |
            Select-Object -ExpandProperty FullName
    }
    $cmd = Get-Command php.exe -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) { $candidates += $cmd.Source }
    if (Test-Path 'C:\xampp\php\php.exe') { $candidates += 'C:\xampp\php\php.exe' }

    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        try {
            $versionText = (& $candidate -r 'echo PHP_VERSION;' 2>&1 | Out-String).Trim()
            if ($LASTEXITCODE -eq 0 -and $versionText -match '^\d+\.\d+\.\d+') {
                $v = [version]($Matches[0])
                if ($v -ge [version]'8.2.0') { return $candidate }
            }
        } catch {}
    }
    return $null
}

function ConfigurePhp([string]$phpExe) {
    $phpDir = Split-Path $phpExe
    $ini = Join-Path $phpDir 'php.ini'
    if (!(Test-Path $ini)) {
        $dev = Join-Path $phpDir 'php.ini-development'
        $prod = Join-Path $phpDir 'php.ini-production'
        if (Test-Path $dev) { Copy-Item $dev $ini -Force }
        elseif (Test-Path $prod) { Copy-Item $prod $ini -Force }
    }
    if (!(Test-Path $ini)) { return }

    $txt = Get-Content $ini -Raw
    if ($txt -match '(?m)^\s*;?\s*extension_dir\s*=') {
        $txt = [regex]::Replace($txt,'(?m)^\s*;?\s*extension_dir\s*=.*$','extension_dir = "ext"')
    } else {
        $txt += "`r`nextension_dir = `"ext`"`r`n"
    }

    foreach ($ext in @('curl','fileinfo','gd','intl','mbstring','mysqli','openssl','pdo_mysql','zip')) {
        $pattern = '(?m)^\s*;?\s*extension\s*=\s*' + [regex]::Escape($ext) + '\s*$'
        if ([regex]::IsMatch($txt,$pattern)) {
            $txt = [regex]::Replace($txt,$pattern,"extension=$ext")
        } elseif (Test-Path (Join-Path $phpDir "ext\php_$ext.dll")) {
            $txt += "`r`nextension=$ext"
        }
    }
    Set-Content $ini $txt -Encoding ASCII
}

function SetEnv([string]$path,[string]$key,[string]$value) {
    $txt = Get-Content $path -Raw
    $escaped = [regex]::Escape($key)
    if ($txt -match "(?m)^$escaped=") {
        $txt = [regex]::Replace($txt,"(?m)^$escaped=.*$","$key=$value")
    } else {
        if (!$txt.EndsWith("`n")) { $txt += "`r`n" }
        $txt += "$key=$value`r`n"
    }
    Set-Content $path $txt -Encoding UTF8
}

try {
    Write-Host '=== MALLQUI GYM ===' -ForegroundColor Cyan

    $php = FindPhp
    if (!$php) {
        Write-Host 'Reparando PHP 8.4...' -ForegroundColor Yellow
        if (!(Get-Command winget.exe -ErrorAction SilentlyContinue)) {
            throw 'No se encontro winget para reparar PHP.'
        }
        & winget install --id Microsoft.VCRedist.2015+.x64 -e --silent --accept-package-agreements --accept-source-agreements | Out-Host
        & winget uninstall --id PHP.PHP.8.4 -e --silent --accept-source-agreements 2>$null | Out-Host
        & winget install --id PHP.PHP.8.4 -e --silent --accept-package-agreements --accept-source-agreements | Out-Host
        Start-Sleep -Seconds 2
        $php = FindPhp
    }
    if (!$php) { throw 'PHP 8.4 sigue sin funcionar. Reinicia Windows y ejecuta INICIAR_MALLQUI.bat otra vez.' }

    ConfigurePhp $php
    $phpDir = Split-Path $php
    $env:Path = "$phpDir;$env:Path"
    $phpVersion = (& $php -r 'echo PHP_VERSION;' 2>&1 | Out-String).Trim()
    Write-Host "PHP $phpVersion OK" -ForegroundColor Green

    $mysql = 'C:\xampp\mysql\bin\mysql.exe'
    if (!(Test-Path $mysql)) { throw 'No encuentro MySQL de XAMPP.' }

    if (!(PortOpen 3306)) {
        if (Test-Path 'C:\xampp\mysql_start.bat') {
            Start-Process 'C:\xampp\mysql_start.bat' -WindowStyle Minimized
            for ($i=0; $i -lt 15 -and !(PortOpen 3306); $i++) { Start-Sleep -Seconds 1 }
        }
    }
    if (!(PortOpen 3306)) { throw 'Enciende MySQL en XAMPP y vuelve a ejecutar el archivo.' }

    Set-Location (Join-Path $root 'BACKEND')
    if (!(Get-Command composer -ErrorAction SilentlyContinue)) { throw 'Composer no esta instalado.' }

    & composer install --no-interaction --prefer-dist
    if ($LASTEXITCODE -ne 0) { throw 'Composer install fallo.' }

    if (!(Test-Path '.env')) { Copy-Item '.env.example' '.env' }

    SetEnv '.env' 'DB_CONNECTION' 'mysql'
    SetEnv '.env' 'DB_HOST' '127.0.0.1'
    SetEnv '.env' 'DB_PORT' '3306'
    SetEnv '.env' 'DB_DATABASE' 'gym_system'
    SetEnv '.env' 'DB_USERNAME' 'root'
    SetEnv '.env' 'DB_PASSWORD' ''
    SetEnv '.env' 'GYM_DB_HOST' '127.0.0.1'
    SetEnv '.env' 'GYM_DB_PORT' '3306'
    SetEnv '.env' 'GYM_DB_DATABASE' 'gym_system'
    SetEnv '.env' 'GYM_DB_USERNAME' 'root'
    SetEnv '.env' 'GYM_DB_PASSWORD' ''

    $envText = Get-Content '.env' -Raw
    if ($envText -notmatch '(?m)^APP_KEY=base64:.+') {
        & $php artisan key:generate --force
    }

    & $mysql -u root -e 'CREATE DATABASE IF NOT EXISTS gym_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
    if ($LASTEXITCODE -ne 0) { throw 'No pude crear la base gym_system.' }

    & $php artisan optimize:clear
    & $php artisan migrate --seed --force
    if ($LASTEXITCODE -ne 0) { throw 'Fallo la migracion de Laravel.' }

    Set-Location (Join-Path $root 'FRONTEND\suma-angular')
    if (!(Get-Command npm.cmd -ErrorAction SilentlyContinue)) { throw 'Node.js/npm no esta instalado.' }

    if (!(Test-Path 'node_modules\.bin\ng.cmd')) {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) {
            & npm.cmd install
            if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar las dependencias Angular.' }
        }
    }

    if (!(PortOpen 8000)) {
        $backendDir = Join-Path $root 'BACKEND'
        $backendCmd = "Set-Location '$backendDir'; & '$php' artisan serve --host=127.0.0.1 --port=8000"
        Start-Process powershell.exe -ArgumentList '-NoExit','-NoProfile','-ExecutionPolicy','Bypass','-Command',$backendCmd
    }

    if (!(PortOpen 4200)) {
        $frontendDir = Join-Path $root 'FRONTEND\suma-angular'
        $frontendCmd = "Set-Location '$frontendDir'; npm.cmd start"
        Start-Process powershell.exe -ArgumentList '-NoExit','-NoProfile','-ExecutionPolicy','Bypass','-Command',$frontendCmd
    }

    for ($i=0; $i -lt 35 -and !(PortOpen 8000); $i++) { Start-Sleep -Seconds 1 }
    for ($i=0; $i -lt 60 -and !(PortOpen 4200); $i++) { Start-Sleep -Seconds 1 }

    if (!(PortOpen 8000)) { throw 'Laravel no pudo iniciar en el puerto 8000.' }
    if (!(PortOpen 4200)) { throw 'Angular no pudo iniciar en el puerto 4200.' }

    Write-Host ''
    Write-Host 'BACKEND  http://127.0.0.1:8000  OK' -ForegroundColor Green
    Write-Host 'FRONTEND http://localhost:4200     OK' -ForegroundColor Green
    Write-Host 'LOS DOS ESTAN FUNCIONANDO.' -ForegroundColor Cyan

    Start-Process 'http://localhost:4200'
}
catch {
    Write-Host ''
    Write-Host 'ERROR:' -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ''
    Read-Host 'Presiona ENTER para cerrar'
    exit 1
}
