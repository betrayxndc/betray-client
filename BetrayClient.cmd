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

python --version >nul 2>&1
if %errorlevel% equ 0 (
    if exist "main.py" (
        echo [+] Executando motor nativo Python...
        start python main.py
        exit
    )
)

start msedge.exe --app="http://localhost:3000" --new-window --window-size=1280,820 2>nul || start http://localhost:3000
exit
