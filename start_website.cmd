@echo off
setlocal EnableExtensions
title Joo Move Website Launcher

cd /d "%~dp0"
set "PORT=7777"
set "SITE_URL=http://localhost:%PORT%"

echo.
echo ========================================
echo          JOO MOVE WEBSITE
echo ========================================
echo.

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or is not in PATH.
  echo Install Node.js 22 and run this file again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found.
  pause
  exit /b 1
)

if not exist "node_modules\next\dist\bin\next" (
  echo [1/3] Installing project packages...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERROR] Package installation failed.
    pause
    exit /b 1
  )
) else (
  echo [1/3] Project packages are ready.
)

powershell.exe -NoProfile -Command "$c=Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue; if($c){exit 0}else{exit 1}" >nul 2>nul
if not errorlevel 1 (
  echo [2/3] Joo Move is already running on port %PORT%.
  echo [3/3] Opening %SITE_URL% ...
  start "" "%SITE_URL%"
  exit /b 0
)

echo [2/3] Starting Joo Move on port %PORT%...
start "Joo Move Development Server" cmd.exe /k "cd /d ""%~dp0"" && call npm.cmd run dev -- -p %PORT%"

echo [3/3] Waiting for the website to become ready...
set /a ATTEMPTS=0

:wait_for_site
set /a ATTEMPTS+=1
powershell.exe -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -Uri '%SITE_URL%' -TimeoutSec 2; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){exit 0} } catch {}; exit 1" >nul 2>nul
if not errorlevel 1 goto site_ready

if %ATTEMPTS% GEQ 90 (
  echo.
  echo [WARNING] The server is still starting or encountered an error.
  echo Check the "Joo Move Development Server" window for details.
  echo You can open the website manually at %SITE_URL%
  pause
  exit /b 1
)

timeout /t 1 /nobreak >nul
goto wait_for_site

:site_ready
echo.
echo Joo Move is ready:
echo Website: %SITE_URL%
echo Admin:   %SITE_URL%/scpanel/dashboard
echo.
start "" "%SITE_URL%"
timeout /t 3 /nobreak >nul
exit /b 0
