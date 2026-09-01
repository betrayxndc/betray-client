"""
Script Python para compilar o BetrayClient (.exe)
Autor: betray
"""
import os
import sys
import subprocess
import shutil

def build():
    print("=" * 65)
    print("  Iniciando compilação do BetrayClient (.exe)")
    print("  Feito por: betray")
    print("=" * 65)
    
    # 1. Instalar dependências
    print("\n[1/3] Instalando dependências...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "pyinstaller"])
    
    # 2. Executar PyInstaller
    print("\n[2/3] Compilando via PyInstaller...")
    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconsole",
        "--onefile",
        "--clean",
        "--name=BetrayClient",
        "--add-data=web;web" if os.name == 'nt' else "--add-data=web:web",
        "--add-data=config;config" if os.name == 'nt' else "--add-data=config:config",
        "main.py"
    ]
    subprocess.check_call(cmd)
    
    # 3. Copiar executável para a raiz
    print("\n[3/3] Movendo executável para o diretório raiz...")
    exe_name = "BetrayClient.exe" if os.name == 'nt' else "BetrayClient"
    dist_path = os.path.join("dist", exe_name)
    
    if os.path.exists(dist_path):
        shutil.copy2(dist_path, exe_name)
        print("\n" + "=" * 65)
        print(f"  SUCESSO! Arquivo executável gerado na raiz: {os.path.abspath(exe_name)}")
        print("=" * 65 + "\n")
    else:
        print("\n[ERRO] O arquivo não foi encontrado na pasta dist.")

if __name__ == '__main__':
    build()
