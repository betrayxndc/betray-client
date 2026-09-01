@echo off
title Betray Client - League of Legends Suite
chcp 65001 > nul
cls
cd /d "%~dp0"

echo ===================================================================
echo     BETRAY CLIENT v2.4.0 - LEAGUE OF LEGENDS UTILITY SUITE
echo     Auto-Accept ^| Rose Skin Changer ^| Auto-Pick/Ban ^| Lobby Reveal
echo ===================================================================
echo.
echo [*] Conectando ao cliente do League of Legends (LCU)...
echo [*] Verificando ambiente Python e dependencias...

:: 1. Se existir python.exe no sistema ou virtualenv
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [+] Python detectado. Verificando dependencias necessarias...
    pip install requests urllib3 pywebview websockets >nul 2>&1
    if exist "main.py" (
        echo [+] Iniciando Betray Client via Python Desktop Engine...
        start python main.py
        exit
    )
)

:: 2. Fallback para navegador nativo / Edge App Mode
echo [*] Abrindo interface nativa do Betray Client...
start msedge.exe --app="http://localhost:3000" --new-window --window-size=1280,820 2>nul || start http://localhost:3000

echo [+] Betray Client ativo com sucesso!
exit
