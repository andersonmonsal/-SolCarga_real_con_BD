@echo off
chcp 65001 >nul
title RideNow — Lanzador

color 0A
echo.
echo  ================================
echo   RideNow - Iniciando App
echo  ================================
echo.

:: 1. Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js no esta instalado.
    echo  Descargalo en: https://nodejs.org
    pause
    exit /b 1
)

:: 2. Verificar Docker
where docker >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Docker no esta instalado o no esta en el PATH.
    echo  Descargalo en: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

:: 3. Intentar arrancar Docker Desktop si no está corriendo
echo  [INFO] Verificando Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] Docker Desktop no está activo. Intentando iniciarlo...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo  [INFO] Esperando 20 segundos a que Docker inicie...
    timeout /t 20 /nobreak >nul
)

:: 4. Verificar / instalar ngrok
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] ngrok no encontrado. Instalando...
    winget install ngrok.ngrok -e --silent 2>nul
)

:: 5. Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"192.168"') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP: =%

:: 6. Crear carpeta de logs si no existe
if not exist logs mkdir logs

:: 7. Apagar contenedores viejos y arrancar frescos
echo  [INFO] Levantando contenedores Docker (BD + App)...
docker-compose down >nul 2>&1
docker-compose up -d --build >> logs\docker.log 2>&1

if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] No se pudo iniciar Docker Compose.
    echo  Revisa logs\docker.log para detalles.
    pause
    exit /b 1
)

:: 8. Esperar a que el servidor esté listo (intentar hasta 30 seg)
echo  [INFO] Esperando a que el servidor esté listo...
set /a TRIES=0
:WAIT_LOOP
timeout /t 3 /nobreak >nul
curl -s http://localhost:3000/api/station >nul 2>&1
if %errorlevel% == 0 goto :READY
set /a TRIES+=1
if %TRIES% LSS 10 goto :WAIT_LOOP
echo  [WARN] El servidor tardó en responder. Continua de todas formas.
goto :READY

:READY
:: 9. Iniciar ngrok
echo  [INFO] Iniciando tunel HTTPS con ngrok...
start "ngrok Tunnel" /min cmd /c "ngrok http 3000"
timeout /t 5 /nobreak >nul

:: 10. Obtener URL de ngrok
for /f "usebackq delims=" %%U in (`curl -s http://localhost:4040/api/tunnels ^| node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const t=JSON.parse(d).tunnels;const h=t.find(x=>x.proto==='https');console.log(h?h.public_url:'NO_URL');}catch(e){console.log('NO_URL');}})"`) do set NGROK_URL=%%U

:: 11. Mostrar resultado
cls
color 0A
echo.
echo  ╔═══════════════════════════════════════════════════════╗
echo  ║          RideNow - Sistema Activo ✓                  ║
echo  ╠═══════════════════════════════════════════════════════╣
echo  ║                                                       ║
echo  ║  Red Local (PC / red WiFi):                           ║
echo  ║    http://%LOCAL_IP%:3000                       ║
echo  ║                                                       ║

if "%NGROK_URL%"=="NO_URL" (
    echo  ║  ngrok: Abre http://localhost:4040 en tu PC           ║
    echo  ║         para ver la URL HTTPS                         ║
) else (
    echo  ║  URL HTTPS para Android (camara QR habilitada):       ║
    echo  ║    %NGROK_URL%
    echo  ║                                                       ║
)

echo  ║                                                       ║
echo  ║  Panel Admin:  http://localhost:3000 (usuario admin) ║
echo  ║  Base de datos: PostgreSQL en Docker (puerto 5432)   ║
echo  ║                                                       ║
echo  ╠═══════════════════════════════════════════════════════╣
echo  ║  Presiona cualquier tecla para DETENER todo           ║
echo  ╚═══════════════════════════════════════════════════════╝
echo.

if not "%NGROK_URL%"=="NO_URL" (
    echo  Copia esta URL en Chrome de tu Android:
    echo    %NGROK_URL%
    echo.
)

pause >nul

:: Limpieza
echo  [INFO] Deteniendo servicios...
docker-compose down >nul 2>&1
taskkill /FI "WINDOWTITLE eq ngrok Tunnel" /F >nul 2>&1
taskkill /IM ngrok.exe /F >nul 2>&1
echo  [OK] Todo detenido. Hasta pronto!
timeout /t 2 /nobreak >nul
