@echo off
rem Atalho de desenvolvimento (Windows): sobe API + frontend e abre o navegador
rem assim que a API estiver respondendo.
rem Pre-requisitos: PostgreSQL local rodando e backend\.env configurado.
cd /d "%~dp0"
start "API - NestJS (localhost:3000)" cmd /k "cd backend && npm run start:dev"
start "WEB - Vite (localhost:5173)" cmd /k "cd frontend && npm run dev"
echo.
echo Aguardando a API compilar e subir (normalmente 10 a 30 segundos)...
:espera
timeout /t 2 /nobreak >nul
curl -s -o nul http://localhost:3000/api/health 2>nul || goto espera
echo API no ar! Abrindo o sistema no navegador...
start "" http://localhost:5173
