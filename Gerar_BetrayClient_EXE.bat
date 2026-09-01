@echo off
chcp 65001 > nul
cls
echo ===================================================================
echo   COMPILADOR AUTOMATICO BETRAY CLIENT (.EXE STANDALONE)
echo   Desenvolvido por: betray
echo ===================================================================
echo.
echo [1/4] Verificando ambiente Python...
set PYTHON_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_CMD=py
    ) else (
        echo [ERRO] Python nao encontrado no PATH do Windows!
        echo Por favor instale o Python 3.10+ marcando a opcao "Add Python to PATH".
        pause
        exit /b 1
    )
)

echo [OK] Python detectado com sucesso.
echo.
echo [2/4] Instalando dependencias necessarias (PyWebView, Requests, PsUtil, PyInstaller)...
%PYTHON_CMD% -m pip install -r requirements.txt pyinstaller

echo.
echo [3/4] Compilando BetrayClient.exe (Interface Grafica Dark Standalone 100%% Independente)...
%PYTHON_CMD% -m PyInstaller --noconsole --onefile --clean --name="BetrayClient" --add-data="web;web" --add-data="config;config" main.py
if %errorlevel% neq 0 (
    echo Tentando fallback do modulo pyinstaller...
    %PYTHON_CMD% -m pyinstaller --noconsole --onefile --clean --name="BetrayClient" --add-data="web;web" --add-data="config;config" main.py
)

echo.
echo [4/4] Copiando o executavel standalone para a pasta principal...
if exist "dist\BetrayClient.exe" (
    copy /y "dist\BetrayClient.exe" "BetrayClient.exe" > nul
    echo.
    echo ===================================================================
    echo   [SUCESSO] O arquivo "BetrayClient.exe" FOI GERADO COM SUCESSO!
    echo ===================================================================
    echo.
    echo   COMO COMPARTILHAR COM OUTROS USUARIOS / AMIGOS:
    echo   - Voce pode pegar APENAS o arquivo "BetrayClient.exe" e enviar
    echo     diretamente para seus amigos (Discord, Google Drive, WhatsApp, etc).
    echo   - Eles NAO precisam de Python, NAO precisam instalar pastas e
    echo     NAO precisam rodar compiladores: basta abrir o .exe direto!
    echo.
) else (
    echo [ERRO] Falha ao compilar o executavel. Verifique as mensagens acima.
)

echo.
pause
