@echo off
chcp 65001 > nul
cls
echo Iniciando Betray Client...
python main.py
if %errorlevel% neq 0 (
    echo.
    echo Pressione qualquer tecla para sair...
    pause > nul
)
