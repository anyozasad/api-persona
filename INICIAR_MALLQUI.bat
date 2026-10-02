@echo off
setlocal
cd /d "%~dp0"
title Mallqui Gym - Backend + Frontend
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0.scripts\start-mallqui.ps1"
if errorlevel 1 pause
endlocal
