@echo off
title FILA-APP - Iniciar Totem com Impressão Direta
echo Abrindo o Totem em modo de Impressão Direta...

:: Tenta localizar o Chrome e abrir no modo Kiosk Printing
start chrome.exe --kiosk-printing --app=http://localhost:3000/totem.html

exit
