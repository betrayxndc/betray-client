@echo off
chcp 65001 > nul
cls
echo Iniciando Betray Client diretamente via Python...
set PYTHON_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    set PYTHON_CMD=py
)
%PYTHON_CMD% -m pip install -r requirements.txt >nul 2>&1
%PYTHON_CMD% main.py
