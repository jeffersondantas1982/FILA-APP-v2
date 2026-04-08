@echo off
echo ========================================
echo FILA-APP - Aplicar Migracao (Nome do Paciente)
echo ========================================
echo.
echo Este script aplica a migracao para adicionar
echo a funcionalidade de Nome do Paciente.
echo.
echo IMPORTANTE: Certifique-se de que o MySQL esta rodando!
echo.
pause

echo.
echo Aplicando migracao...
mysql -u root -p fila_app < migration_patient_name.sql

echo.
echo ========================================
echo Migracao concluida!
echo ========================================
echo.
echo Agora voce pode iniciar o servidor com 3-START.bat
echo.
pause
