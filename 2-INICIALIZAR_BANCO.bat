@echo off
title FILA-APP - Inicializar Banco de Dados
echo Configurando o banco de dados MySQL...
node migrate.js
echo.
echo Processo concluido.
pause
