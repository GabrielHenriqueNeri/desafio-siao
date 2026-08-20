@echo off
rem Atalho de desenvolvimento (Windows): sobe API e frontend em janelas separadas.
rem Pre-requisitos: PostgreSQL local rodando e backend\.env configurado.
cd /d "%~dp0"
start "API - NestJS (localhost:3000)" cmd /k "cd backend && npm run start:dev"
start "WEB - Vite (localhost:5173)" cmd /k "cd frontend && npm run dev"
echo Servidores iniciando... API: http://localhost:3000/api/docs ^| Front: http://localhost:5173
