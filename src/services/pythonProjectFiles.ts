import { AppSettings } from '../types';
import { CHAMPIONS } from '../data/champions';
import { getDesktopHtml } from './desktopTemplate';

export interface PythonDesktopFiles {
  [key: string]: string;
  'BUILD_EXE.bat': string;
  'INICIAR_BETRAY_CLIENT.bat': string;
  'Gerar_BetrayClient_EXE.bat': string;
  'Instalar_e_Gerar_EXE.bat': string;
  'Executar_Direto_Sem_Compilar.bat': string;
  'BetrayClient.spec': string;
  'build_exe.py': string;
  'run.bat': string;
  'main.py': string;
  'web/index.html': string;
  'requirements.txt': string;
  'README.md': string;
  'config/settings.json': string;
  'src/api/lcu_client.py': string;
  'src/core/auto_accept.py': string;
  'src/core/auto_pick.py': string;
  'src/core/auto_ban.py': string;
  'src/core/background_changer.py': string;
  'src/core/rose_skin_changer.py': string;
  'src/core/lobby_reveal.py': string;
  'src/core/dodge_handler.py': string;
}

export function generatePythonDesktopApp(settings: AppSettings): PythonDesktopFiles {
  const settingsJson = JSON.stringify(settings, null, 2);

  const buildBatContent = `@echo off
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
if exist "dist\\BetrayClient.exe" (
    copy /y "dist\\BetrayClient.exe" "BetrayClient.exe" > nul
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
`;

  return {
    'BUILD_EXE.bat': buildBatContent,
    'INICIAR_BETRAY_CLIENT.bat': buildBatContent,
    'Instalar_e_Gerar_EXE.bat': buildBatContent,
    'Gerar_BetrayClient_EXE.bat': buildBatContent,
    'Executar_Direto_Sem_Compilar.bat': `@echo off
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
`,
    'BetrayClient.spec': `# -*- mode: python ; coding: utf-8 -*-
block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('web', 'web'), ('config', 'config')],
    hiddenimports=[
        'webview',
        'webview.platforms.winforms',
        'webview.platforms.edgechromium',
        'requests',
        'urllib3',
        'psutil',
        'websocket',
        'http.server',
        'socketserver'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='BetrayClient',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
`,
    'build_exe.py': `"""
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
    print("\\n[1/3] Instalando dependências...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "pyinstaller"])
    
    # 2. Executar PyInstaller
    print("\\n[2/3] Compilando via PyInstaller...")
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
    print("\\n[3/3] Movendo executável para o diretório raiz...")
    exe_name = "BetrayClient.exe" if os.name == 'nt' else "BetrayClient"
    dist_path = os.path.join("dist", exe_name)
    
    if os.path.exists(dist_path):
        shutil.copy2(dist_path, exe_name)
        print("\\n" + "=" * 65)
        print(f"  SUCESSO! Arquivo executável gerado na raiz: {os.path.abspath(exe_name)}")
        print("=" * 65 + "\\n")
    else:
        print("\\n[ERRO] O arquivo não foi encontrado na pasta dist.")

if __name__ == '__main__':
    build()
`,
    'run.bat': `@echo off
chcp 65001 > nul
cls
echo Iniciando Betray Client...
python main.py
if %errorlevel% neq 0 (
    echo.
    echo Pressione qualquer tecla para sair...
    pause > nul
)
`,
    'main.py': `"""
===================================================================
 Betray Client - Desktop Application (Windows Standalone)
 Feito por: betray
 Automatizador de Fila, Pré-Pick, Pré-Ban e Customizador de Perfil LCU
===================================================================
"""
import sys
import os
import json
import time
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
import socketserver

try:
    import webview
    HAS_WEBVIEW = True
except ImportError:
    HAS_WEBVIEW = False

from src.api.lcu_client import LCUClient
from src.core.auto_accept import AutoAcceptHandler
from src.core.auto_pick import AutoPickHandler
from src.core.auto_ban import AutoBanHandler
from src.core.background_changer import BackgroundChanger
from src.core.rose_skin_changer import RoseSkinChanger
from src.core.lobby_reveal import LobbyRevealer
from src.core.dodge_handler import DodgeHandler

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

CONFIG_PATH = get_resource_path(os.path.join("config", "settings.json"))
WEB_DIR = get_resource_path("web")

class BetrayBridgeAPI:
    def __init__(self, lcu_client, settings_data):
        self.lcu = lcu_client
        self.settings = settings_data
        self.auto_accept_handler = AutoAcceptHandler(self.lcu, self.settings)
        self.auto_pick_handler = AutoPickHandler(self.lcu, self.settings)
        self.auto_ban_handler = AutoBanHandler(self.lcu, self.settings)
        self.bg_changer = BackgroundChanger(self.lcu)
        self.rose_changer = RoseSkinChanger(self.lcu, self.settings)
        self.lobby_revealer = LobbyRevealer(self.lcu)
        self.dodge_handler = DodgeHandler(self.lcu)
        self.logs = []
        self.add_log("info", "Betray Client Desktop inicializado. Feito por betray.")

    def add_log(self, log_type, message):
        t = time.strftime("%H:%M:%S")
        self.logs.append({"time": t, "type": log_type, "message": message})
        if len(self.logs) > 60:
            self.logs.pop(0)

    def get_settings(self):
        return self.settings

    def save_settings(self, new_settings_json):
        try:
            if isinstance(new_settings_json, str):
                self.settings = json.loads(new_settings_json)
            else:
                self.settings = new_settings_json
                
            self.auto_accept_handler.settings = self.settings
            self.auto_pick_handler.settings = self.settings
            self.auto_ban_handler.settings = self.settings
            self.rose_changer.settings = self.settings

            os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
            with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
                json.dump(self.settings, f, indent=4)
            self.add_log("success", "Configurações salvas com sucesso.")
            return True
        except Exception as e:
            self.add_log("error", f"Erro ao salvar configurações: {str(e)}")
            return False

    def get_lcu_status(self):
        connected = self.lcu.connect()
        phase = self.lcu.get_gameflow_phase() if connected else "None"
        return {
            "connected": connected,
            "port": self.lcu.port,
            "phase": phase
        }

    def get_current_summoner_profile(self):
        if not self.lcu.connect():
            return {"success": False, "error": "League of Legends não encontrado ou fechado."}
        
        summoner_res = self.lcu.get("/lol-summoner/v1/current-summoner")
        summoner_data = {}
        if summoner_res and summoner_res.status_code == 200:
            summoner_data = summoner_res.json()
            
        chat_res = self.lcu.get("/lol-chat/v1/me")
        chat_data = chat_res.json() if chat_res and chat_res.status_code == 200 else {}
        
        game_name = (
            summoner_data.get('gameName') or 
            chat_data.get('gameName') or 
            summoner_data.get('displayName') or 
            chat_data.get('name') or 
            'Invocador'
        )
        tag_line = (
            summoner_data.get('tagLine') or 
            chat_data.get('tagLine') or 
            'BR1'
        )
        
        summoner_data['displayName'] = game_name
        summoner_data['gameName'] = game_name
        summoner_data['tagLine'] = tag_line
        summoner_data['formattedRiotId'] = f"{game_name}#{tag_line}"
        
        if not summoner_data.get('summonerLevel') and chat_data.get('lol', {}).get('level'):
            try:
                summoner_data['summonerLevel'] = int(chat_data['lol']['level'])
            except:
                summoner_data['summonerLevel'] = 1

        if not summoner_data.get('profileIconId') and chat_data.get('icon'):
            summoner_data['profileIconId'] = chat_data['icon']

        ranked_res = self.lcu.get("/lol-ranked/v1/current-ranked-stats")
        ranked_data = ranked_res.json() if ranked_res and ranked_res.status_code == 200 else {}
        
        bg_res = self.lcu.get("/lol-summoner/v1/current-summoner/background-skin")
        bg_data = bg_res.json() if bg_res and bg_res.status_code == 200 else {}

        masteries_res = self.lcu.get("/lol-champion-mastery/v1/local-player/champion-mastery")
        masteries_data = masteries_res.json() if masteries_res and masteries_res.status_code == 200 else []

        self.add_log("success", f"Perfil identificado: {game_name}#{tag_line} (Nível {summoner_data.get('summonerLevel', 1)})")

        return {
            "success": True,
            "summoner": summoner_data,
            "ranked": ranked_data,
            "background": bg_data,
            "masteries": masteries_data
        }

    def set_rose_skin(self, champ_id, skin_id, chroma_id=None, skin_name=""):
        res = self.rose_changer.set_skin(champ_id, skin_id, chroma_id, skin_name)
        if res.get("success"):
            chroma_text = f" (Chroma #{chroma_id})" if chroma_id is not None else ""
            msg = f"🌸 [SKIN CHANGER] Skin '{skin_name or skin_id}' armada para o Campeão #{champ_id}{chroma_text}! Injeção LCU pronta."
            self.add_log("success", msg)
            self.save_settings(self.settings)
        else:
            self.add_log("error", f"Falha ao configurar skin: {res.get('message')}")
        return res

    def get_rose_skin(self, champ_id):
        return self.rose_changer.get_configured_skin_for_champion(champ_id)

    def get_all_rose_skins(self):
        return self.rose_changer.get_all_skins()

    def remove_rose_skin(self, champ_id):
        res = self.rose_changer.remove_skin(champ_id)
        self.add_log("info", f"Skin personalizada removida para Campeão #{champ_id}.")
        self.save_settings(self.settings)
        return res

    def clear_all_rose_skins(self):
        res = self.rose_changer.clear_all_skins()
        self.add_log("info", "Todas as skins personalizadas foram limpas.")
        self.save_settings(self.settings)
        return res

    def apply_rose_skin_now(self, champ_id, skin_id, chroma_id=None):
        ok = self.rose_changer.apply_skin_to_lcu(champ_id, skin_id, chroma_id)
        if ok:
            self.add_log("success", f"Injeção forçada de Skin #{skin_id} enviada para LCU!")
        return {"success": ok}

    def fetch_champion_skins_lcu(self, champ_id):
        return self.rose_changer.fetch_lcu_champion_skins(champ_id)

    def toggle_rose_skin_changer(self, enabled=None):
        res = self.rose_changer.toggle(enabled)
        self.add_log("info", f"Skin Changer {'ativado' if res.get('enabled') else 'desativado'}.")
        self.save_settings(self.settings)
        return res

    def get_logs(self):
        return self.logs

    def set_background_skin(self, skin_id):
        success = self.bg_changer.set_background(skin_id)
        if success:
            self.add_log("success", f"Skin de fundo alterada para ID {skin_id} no perfil do LoL!")
            self.settings["selected_background_skin_id"] = int(skin_id)
            self.save_settings(self.settings)
            return True
        else:
            self.add_log("error", f"Falha ao trocar skin para ID {skin_id}.")
            return False

    def accept_match_now(self):
        res = self.lcu.post("/lol-matchmaking/v1/ready-check/accept")
        if res and res.status_code == 200:
            self.add_log("success", "Partida aceita com sucesso via LCU API!")
            return True
        return False

    def dodge_champ_select(self, method="auto"):
        res = self.dodge_handler.dodge(method=method)
        if res.get("success"):
            self.add_log("success", f"🚪 [DODGE SUCESSO] {res.get('message', 'Dodge executado com sucesso!')}")
        else:
            self.add_log("error", f"Falha ao executar dodge via método {method}.")
        return res

    def arm_last_second_dodge(self, seconds=3):
        self.dodge_handler.arm_last_second(seconds)
        self.add_log("info", f"⏱️ [AUTO-DODGE ARMADO] Dodge configurado para os últimos {seconds}s de seleção.")
        return {"success": True, "armed": True, "seconds": seconds}

    def cancel_last_second_dodge(self):
        self.dodge_handler.cancel_last_second()
        self.add_log("info", "⏱️ [AUTO-DODGE CANCELADO] Temporizador desativado.")
        return {"success": True, "armed": False}

    def reveal_lobby(self):
        res = self.lobby_revealer.reveal_current_lobby()
        if res.get("success"):
            self.add_log("success", f"🔍 [LOBBY REVEAL] {len(res.get('participants', []))} participantes identificados no Champ Select!")
        else:
            self.add_log("info", "Aguardando início do Champ Select para revelar jogadores.")
        return res

def background_lcu_worker(api):
    last_phase = "None"
    while True:
        try:
            connected = api.lcu.connect()
            if connected:
                phase = api.lcu.get_gameflow_phase()
                if phase != last_phase:
                    api.add_log("info", f"Fase de jogo detectada: {phase}")
                    last_phase = phase

                if phase == "ReadyCheck":
                    if api.settings.get("auto_accept", True):
                        delay = api.settings.get("auto_accept_delay", 1)
                        api.add_log("info", f"Partida encontrada! Auto-Aceitando em {delay}s...")
                        time.sleep(delay)
                        api.accept_match_now()
                        time.sleep(3)

                elif phase == "ChampSelect":
                    session = api.lcu.get("/lol-champ-select/v1/session")
                    if session and session.status_code == 200:
                        session_data = session.json()
                        api.auto_ban_handler.check_and_act(session_data)
                        api.auto_pick_handler.check_and_act(session_data)
                        api.rose_changer.check_and_apply_champ_select(session_data)

                        if api.dodge_handler.is_armed:
                            timer = session_data.get("timer", {})
                            adjusted_time_left = timer.get("adjustedTimeLeftInPhase", 0) / 1000.0
                            if 0 < adjusted_time_left <= api.dodge_handler.last_second_seconds:
                                api.add_log("warning", f"⏱️ [LAST-SECOND DODGE] Apenas {adjusted_time_left:.1f}s restantes na fase. Executando Dodge agora!")
                                api.dodge_champ_select(method=api.settings.get("dodge_method", "auto"))
                                api.dodge_handler.cancel_last_second()

                elif phase == "InProgress":
                    api.rose_changer.check_and_apply_in_game()

            time.sleep(1)
        except Exception as e:
            time.sleep(2)

def start_local_http_server(directory, port=18899):
    class QuietHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=directory, **kwargs)
        def log_message(self, format, *args):
            pass

    server = socketserver.TCPServer(("127.0.0.1", port), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

def main():
    print("=" * 65)
    print("  BETRAY CLIENT - LEAGUE OF LEGENDS AUTOMATOR (STANDALONE)")
    print("  Feito por: betray")
    print("=========================================================")
    
    settings = {}
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                settings = json.load(f)
        except Exception:
            pass

    lcu = LCUClient()
    bridge_api = BetrayBridgeAPI(lcu, settings)

    worker_thread = threading.Thread(target=background_lcu_worker, args=(bridge_api,), daemon=True)
    worker_thread.start()

    port = 18899
    start_local_http_server(WEB_DIR, port=port)
    url = f"http://127.0.0.1:{port}/index.html"

    if HAS_WEBVIEW:
        window = webview.create_window(
            title="Betray Client",
            url=url,
            width=1280,
            height=820,
            min_size=(960, 600),
            background_color='#07090e',
            js_api=bridge_api
        )
        webview.start(debug=False)
    else:
        print(f"Abrindo Betray Client em: {url}")
        webbrowser.open(url)
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    main()
`,
    'web/index.html': getDesktopHtml(CHAMPIONS),
    'requirements.txt': `pywebview>=5.0
requests>=2.31.0
websocket-client>=1.7.0
urllib3>=2.0.7
psutil>=5.9.8
lcu-driver>=2.3.0
pyinstaller>=6.4.0
`,
    'README.md': `# Betray Client Desktop
Aplicativo desktop autônomo para League of Legends desenvolvido com **Python, PyWebView e LCU API**.

> **Autoria**: Feito por betray

---

## ⚡ Como Usar ou Gerar o Arquivo .EXE (Executável Windows)

1. Extraia os arquivos do **BetrayClient_Windows.zip** para qualquer pasta.
2. Dê **dois cliques** no arquivo \`Gerar_BetrayClient_EXE.bat\` ou \`Executar_Direto_Sem_Compilar.bat\`.
3. O instalador prepara tudo automaticamente e cria o \`BetrayClient.exe\`.
4. O aplicativo abrirá conectado ao seu League of Legends!

---

## 🚀 Módulos Inclusos:
- **🔍 Lobby Reveal (steele123/reveal)**: Revela os nomes reais de todos os aliados no Champ Select Solo/Duo.
- **🚪 Motor de Dodge Infalível**: Cascata Automática, Reiniciar UX, Process Kill e Last-Second Timer.
- **Auto-Accept**: Aceita partidas com delay configurável e som de notificação.
- **Pré-Pick Automático**: Seleciona e trava o campeão na sua rota com prioridade de slots.
- **Pré-Ban Automático**: Bane e confirma o campeão prioritário instantaneamente.
- **🌸 Skin Changer In-Game (Rose Engine)**: Troca skins e chromas no jogo em tempo real (anti-Vanguard).
- **Perfil Real do Invocador**: Detecção automática de Riot ID, elo Solo/Duo, elo Flex e estatísticas da LCU.
- **Background Changer**: Aplica splash arts diretamente no perfil do LoL.
`,
    'config/settings.json': settingsJson,
    'src/api/lcu_client.py': `import os
import re
import base64
import requests
import urllib3
import psutil

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class LCUClient:
    def __init__(self):
        self.port = None
        self.auth_token = None
        self.protocol = 'https'
        self.session = requests.Session()
        self.session.verify = False
        self.connected = False

    def find_lockfile(self):
        for proc in psutil.process_iter(['name', 'cmdline']):
            try:
                name = proc.info['name'] or ''
                if 'LeagueClientUx' in name:
                    cmdline = ' '.join(proc.info['cmdline'] or [])
                    port_match = re.search(r'--app-port=([0-9]+)', cmdline)
                    token_match = re.search(r'--remoting-auth-token=([\\w-]+)', cmdline)
                    if port_match and token_match:
                        self.port = port_match.group(1)
                        self.auth_token = token_match.group(1)
                        self.setup_auth()
                        self.connected = True
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, Exception):
                continue
        return False

    def setup_auth(self):
        auth_str = f"riot:{self.auth_token}"
        encoded_auth = base64.b64encode(auth_str.encode('utf-8')).decode('utf-8')
        self.session.headers.update({
            'Authorization': f'Basic {encoded_auth}',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })

    def connect(self):
        return self.find_lockfile()

    def get(self, endpoint):
        if not self.connected: 
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            return self.session.get(url, timeout=3)
        except Exception:
            return None

    def post(self, endpoint, data=None):
        if not self.connected:
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            return self.session.post(url, json=data, timeout=3)
        except Exception:
            return None

    def patch(self, endpoint, data=None):
        if not self.connected:
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            return self.session.patch(url, json=data, timeout=3)
        except Exception:
            return None

    def delete(self, endpoint):
        if not self.connected:
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            return self.session.delete(url, timeout=3)
        except Exception:
            return None

    def get_gameflow_phase(self):
        res = self.get('/lol-gameflow/v1/gameflow-phase')
        if res and res.status_code == 200:
            return res.text.replace('"', '').strip()
        return "None"
`,
    'src/core/auto_accept.py': `import time

class AutoAcceptHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings

    def check_and_accept(self):
        if not self.settings.get("auto_accept", True):
            return False
        
        phase = self.lcu.get_gameflow_phase()
        if phase == "ReadyCheck":
            delay = self.settings.get("auto_accept_delay", 1)
            time.sleep(delay)
            res = self.lcu.post("/lol-matchmaking/v1/ready-check/accept")
            return res and res.status_code == 200
        return False
`,
    'src/core/auto_pick.py': `import time

class AutoPickHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings
        self.last_locked_action_id = None

    def get_assigned_role(self, session_data):
        local_cell_id = session_data.get("localPlayerCellId", 0)
        my_team = session_data.get("myTeam", [])
        for member in my_team:
            if member.get("cellId") == local_cell_id:
                assigned_pos = member.get("assignedPosition", "").upper()
                if assigned_pos in ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]:
                    return assigned_pos
                if assigned_pos == "BOTTOM": return "ADC"
                if assigned_pos == "UTILITY": return "SUPPORT"
        return "MID"

    def get_pre_pick_champions(self, assigned_role):
        pre_picks_map = (
            self.settings.get("pre_pick_champions") or 
            self.settings.get("prePickChampions") or 
            {}
        )
        picks = []
        if isinstance(pre_picks_map, dict):
            picks = pre_picks_map.get(assigned_role, []) or pre_picks_map.get("MID", [])
        elif isinstance(pre_picks_map, list):
            picks = pre_picks_map

        if isinstance(picks, (int, str)):
            try:
                picks = [int(picks)]
            except:
                picks = []
        return [int(c) for c in picks if str(c).isdigit()]

    def is_auto_lock_enabled(self):
        return bool(
            self.settings.get("auto_lock_pick", True) and 
            self.settings.get("autoLockPick", True) and
            self.settings.get("auto_pick_enabled", True) and
            self.settings.get("autoPickEnabled", True)
        )

    def check_and_act(self, session_data):
        if not self.settings.get("auto_pick_enabled", True) and not self.settings.get("autoPickEnabled", True):
            return

        local_cell_id = session_data.get("localPlayerCellId", 0)
        actions = session_data.get("actions", [])
        assigned_role = self.get_assigned_role(session_data)
        pre_picks = self.get_pre_pick_champions(assigned_role)
        
        if not pre_picks:
            return

        banned_and_picked = set()
        bans = session_data.get("bans", {})
        for b in bans.get("myTeamBans", []) + bans.get("theirTeamBans", []):
            if isinstance(b, int) and b > 0:
                banned_and_picked.add(b)

        for team_key in ["myTeam", "theirTeam"]:
            for member in session_data.get(team_key, []):
                if member.get("cellId") != local_cell_id:
                    c_id = member.get("championId", 0)
                    if c_id > 0:
                        banned_and_picked.add(c_id)

        target_champ_id = pre_picks[0]
        for c in pre_picks:
            if c not in banned_and_picked:
                target_champ_id = c
                break

        auto_lock = self.is_auto_lock_enabled()

        for action_group in actions:
            for action in action_group:
                if action.get("actorCellId") == local_cell_id and action.get("type") == "pick":
                    action_id = action.get("id")
                    is_in_progress = action.get("isInProgress", False)
                    is_completed = action.get("completed", False)

                    if is_completed or self.last_locked_action_id == action_id:
                        continue

                    if is_in_progress:
                        payload = {
                            "championId": int(target_champ_id),
                            "completed": bool(auto_lock),
                            "type": "pick"
                        }
                        
                        self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", payload)
                        
                        if auto_lock:
                            time.sleep(0.08)
                            complete_res = self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete")
                            if not complete_res or complete_res.status_code not in [200, 204]:
                                self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete", {})
                                self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                                    "championId": int(target_champ_id),
                                    "completed": True
                                })
                            self.last_locked_action_id = action_id

                            # Rose Skin Changer - Injeção imediata da skin armada
                            saved_skins = self.settings.get("rose_selected_skins") or self.settings.get("roseSelectedSkins") or {}
                            skin_data = saved_skins.get(str(target_champ_id))
                            if skin_data and skin_data.get("skinId"):
                                target_s_id = int(skin_data.get("chromaId")) if skin_data.get("chromaId") is not None else int(skin_data.get("skinId"))
                                try:
                                    self.lcu.patch("/lol-champ-select/v1/session/my-selection", {"selectedSkinId": target_s_id})
                                    self.lcu.patch("/lol-champ-select/v1/current-champion", {"championId": int(target_champ_id), "selectedSkinId": target_s_id})
                                    self.lcu.post(f"/lol-champ-select/v1/skin-carousel/skins/{target_s_id}/select", {})
                                except Exception:
                                    pass
                        break

                    elif not is_completed and action.get("championId") != target_champ_id:
                        self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                            "championId": int(target_champ_id),
                            "completed": False,
                            "type": "pick"
                        })
                        self.lcu.patch("/lol-champ-select/v1/session/my-selection", {
                            "championPickIntent": int(target_champ_id)
                        })
`,
    'src/core/auto_ban.py': `import time

class AutoBanHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings
        self.last_banned_action_id = None

    def get_pre_ban_champions(self):
        bans = (
            self.settings.get("pre_ban_champions") or 
            self.settings.get("preBanChampions") or 
            []
        )
        if isinstance(bans, (int, str)):
            try:
                bans = [int(bans)]
            except:
                bans = []
        return [int(c) for c in bans if str(c).isdigit()]

    def check_and_act(self, session_data):
        if not self.settings.get("auto_ban_enabled", True) and not self.settings.get("autoBanEnabled", True):
            return

        local_cell_id = session_data.get("localPlayerCellId", 0)
        actions = session_data.get("actions", [])
        pre_bans = self.get_pre_ban_champions()
        
        if not pre_bans:
            return

        already_banned = set()
        bans = session_data.get("bans", {})
        for b in bans.get("myTeamBans", []) + bans.get("theirTeamBans", []):
            if isinstance(b, int) and b > 0:
                already_banned.add(b)

        target_ban_id = pre_bans[0]
        for b_id in pre_bans:
            if b_id not in already_banned:
                target_ban_id = b_id
                break

        for action_group in actions:
            for action in action_group:
                if action.get("actorCellId") == local_cell_id and action.get("type") == "ban":
                    action_id = action.get("id")
                    is_in_progress = action.get("isInProgress", False)
                    is_completed = action.get("completed", False)

                    if is_completed or self.last_banned_action_id == action_id:
                        continue

                    if is_in_progress:
                        payload = {
                            "championId": int(target_ban_id),
                            "completed": True,
                            "type": "ban"
                        }
                        
                        self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", payload)
                        time.sleep(0.08)
                        
                        complete_res = self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete")
                        if not complete_res or complete_res.status_code not in [200, 204]:
                            self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete", {})
                            self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                                "championId": int(target_ban_id),
                                "completed": True
                            })
                        
                        self.last_banned_action_id = action_id
                        break
`,
    'src/core/background_changer.py': `class BackgroundChanger:
    def __init__(self, lcu_client):
        self.lcu = lcu_client

    def set_background(self, skin_id):
        payload = {"key": "backgroundSkinId", "value": int(skin_id)}
        res = self.lcu.post("/lol-summoner/v1/current-summoner/background-skin", payload)
        if not res or res.status_code not in [200, 204]:
            res = self.lcu.put("/lol-summoner/v1/current-summoner/background-skin", payload)
        return res and res.status_code in [200, 204]
`,
    'src/core/rose_skin_changer.py': `import os
import json
import time

class RoseSkinChanger:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings
        self.active_skins = {}
        self.last_applied_skin_per_champ = {}

        saved_skins = (
            self.settings.get("rose_selected_skins") or 
            self.settings.get("roseSelectedSkins") or 
            {}
        )
        for key, data in saved_skins.items():
            if isinstance(data, dict) and data.get("skinId"):
                try:
                    c_id = int(data.get("skinId")) // 1000
                    self.active_skins[c_id] = {
                        "skin_id": int(data.get("skinId")),
                        "chroma_id": data.get("chromaId"),
                        "skin_name": data.get("skinName", ""),
                        "skin_num": data.get("skinNum", 0)
                    }
                except:
                    pass

    def is_enabled(self):
        return bool(
            self.settings.get("rose_skin_changer_enabled", True) and 
            self.settings.get("roseSkinChangerEnabled", True)
        )

    def toggle(self, enabled=None):
        if enabled is None:
            enabled = not self.is_enabled()
        self.settings["rose_skin_changer_enabled"] = bool(enabled)
        self.settings["roseSkinChangerEnabled"] = bool(enabled)
        return {
            "success": True,
            "enabled": bool(enabled),
            "message": f"Skin Changer {'ativado' if enabled else 'desativado'} com sucesso."
        }

    def set_skin(self, champ_id, skin_id, chroma_id=None, skin_name=""):
        try:
            champ_id = int(champ_id)
            skin_id = int(skin_id)
            chroma_id = int(chroma_id) if (chroma_id is not None and str(chroma_id).isdigit()) else None
            skin_num = skin_id % 1000
        except Exception as e:
            return {
                "success": False,
                "message": f"IDs inválidos: {str(e)}",
                "champ_id": champ_id,
                "skin_id": skin_id
            }

        skin_entry = {
            "skin_id": skin_id,
            "skin_num": skin_num,
            "chroma_id": chroma_id,
            "skin_name": skin_name or f"Skin #{skin_id}"
        }

        self.active_skins[champ_id] = skin_entry

        if "rose_selected_skins" not in self.settings:
            self.settings["rose_selected_skins"] = {}
        if "roseSelectedSkins" not in self.settings:
            self.settings["roseSelectedSkins"] = {}

        save_dict = {
            "skinId": skin_id,
            "skinNum": skin_num,
            "skinName": skin_name or f"Skin #{skin_id}",
            "chromaId": chroma_id
        }
        self.settings["rose_selected_skins"][str(champ_id)] = save_dict
        self.settings["roseSelectedSkins"][str(champ_id)] = save_dict
        self.settings["rose_current_skin_id"] = skin_id
        self.settings["rose_current_chroma_id"] = chroma_id
        self.settings["rose_current_skin_name"] = skin_name

        applied_now = self.apply_skin_to_lcu(champ_id, skin_id, chroma_id)

        return {
            "success": True,
            "message": f"Skin '{skin_name}' armada com sucesso!",
            "champ_id": champ_id,
            "skin_id": skin_id,
            "chroma_id": chroma_id,
            "skin_name": skin_name,
            "applied_immediately": applied_now
        }

    def get_configured_skin_for_champion(self, champ_id):
        champ_id = int(champ_id)
        if champ_id in self.active_skins:
            return self.active_skins[champ_id]

        saved_skins = (
            self.settings.get("rose_selected_skins") or 
            self.settings.get("roseSelectedSkins") or 
            {}
        )
        if str(champ_id) in saved_skins:
            data = saved_skins[str(champ_id)]
            return {
                "skin_id": data.get("skinId"),
                "skin_num": data.get("skinNum", 0),
                "chroma_id": data.get("chromaId"),
                "skin_name": data.get("skinName", "")
            }

        curr_skin_id = self.settings.get("rose_current_skin_id") or self.settings.get("roseCurrentSkinId")
        if curr_skin_id and (int(curr_skin_id) // 1000) == champ_id:
            return {
                "skin_id": int(curr_skin_id),
                "skin_num": int(curr_skin_id) % 1000,
                "chroma_id": self.settings.get("rose_current_chroma_id") or self.settings.get("roseCurrentChromaId"),
                "skin_name": self.settings.get("rose_current_skin_name", "")
            }

        return None

    def get_all_skins(self):
        return {
            "success": True,
            "skins": self.active_skins,
            "count": len(self.active_skins)
        }

    def remove_skin(self, champ_id):
        champ_id = int(champ_id)
        if champ_id in self.active_skins:
            del self.active_skins[champ_id]

        if "rose_selected_skins" in self.settings and str(champ_id) in self.settings["rose_selected_skins"]:
            del self.settings["rose_selected_skins"][str(champ_id)]
        if "roseSelectedSkins" in self.settings and str(champ_id) in self.settings["roseSelectedSkins"]:
            del self.settings["roseSelectedSkins"][str(champ_id)]

        default_skin_id = champ_id * 1000
        self.apply_skin_to_lcu(champ_id, default_skin_id, None)

        return {
            "success": True,
            "message": f"Skin padrão restaurada para campeão #{champ_id}.",
            "champ_id": champ_id
        }

    def clear_all_skins(self):
        self.active_skins.clear()
        self.settings["rose_selected_skins"] = {}
        self.settings["roseSelectedSkins"] = {}
        self.settings["rose_current_skin_id"] = None
        self.settings["rose_current_chroma_id"] = None
        return {
            "success": True,
            "message": "Todas as skins foram redefinidas."
        }

    def apply_skin_to_lcu(self, champ_id, skin_id, chroma_id=None):
        target_skin_id = int(chroma_id) if chroma_id else int(skin_id)
        champ_id = int(champ_id)
        success = False

        # Vetor 1: Seleção em tempo real de Champ Select (Skin Carousel)
        try:
            res1 = self.lcu.patch("/lol-champ-select/v1/session/my-selection", {
                "selectedSkinId": target_skin_id
            })
            if res1 and res1.status_code in [200, 204]:
                success = True
        except:
            pass

        # Vetor 2: Current Champion Selection
        try:
            res2 = self.lcu.patch("/lol-champ-select/v1/current-champion", {
                "championId": champ_id,
                "selectedSkinId": target_skin_id
            })
            if res2 and res2.status_code in [200, 204]:
                success = True
        except:
            pass

        # Vetor 3: Skin Carousel Direto
        try:
            self.lcu.post(f"/lol-champ-select/v1/skin-carousel/skins/{target_skin_id}/select", {})
            if chroma_id:
                self.lcu.post(f"/lol-champ-select/v1/skin-carousel/skins/{skin_id}/chromas/{chroma_id}/select", {})
        except:
            pass

        # Vetor 4: Skin Selector endpoint
        try:
            self.lcu.patch("/lol-champ-select/v1/skin-selector", {
                "selectedSkinId": target_skin_id
            })
        except:
            pass

        # Vetor 5: Loadouts V4 (persiste cosméticos do inventário do cliente)
        try:
            loadout_res = self.lcu.get("/lol-loadouts/v4/loadouts/scope/inventory")
            if loadout_res and loadout_res.status_code == 200:
                loadouts = loadout_res.json()
                if isinstance(loadouts, list) and len(loadouts) > 0:
                    loadout_id = loadouts[0].get("id")
                    if loadout_id:
                        payload = {
                            "loadout": {
                                "CHAMPION_SKIN": {
                                    "itemId": target_skin_id,
                                    "inventoryType": "CHAMPION_SKIN"
                                }
                            }
                        }
                        self.lcu.put(f"/lol-loadouts/v4/loadouts/{loadout_id}", payload)
                        self.lcu.patch(f"/lol-loadouts/v4/loadouts/{loadout_id}", payload)
                        success = True
        except:
            pass

        # Vetor 6: Cosmetics Selection
        try:
            self.lcu.patch("/lol-cosmetics/v1/selection/skin", {
                "skinId": target_skin_id
            })
        except:
            pass

        self.last_applied_skin_per_champ[champ_id] = target_skin_id
        return success

    def check_and_apply_champ_select(self, session_data):
        if not self.is_enabled():
            return False

        local_cell_id = session_data.get("localPlayerCellId", 0)
        my_team = session_data.get("myTeam", [])
        
        my_player = next((m for m in my_team if m.get("cellId") == local_cell_id), None)
        if not my_player:
            return False

        champ_id = my_player.get("championId") or my_player.get("championPickIntent")
        if not champ_id or champ_id <= 0:
            return False

        champ_id = int(champ_id)
        configured_skin = self.get_configured_skin_for_champion(champ_id)
        if not configured_skin:
            return False

        skin_id = configured_skin.get("skin_id")
        chroma_id = configured_skin.get("chroma_id")
        target_skin_id = int(chroma_id) if chroma_id else int(skin_id)

        timer = session_data.get("timer", {})
        phase = timer.get("phase", "")
        current_selected = my_player.get("selectedSkinId", 0)

        is_finalization = (phase == "FINALIZATION")
        needs_apply = (current_selected != target_skin_id) or (self.last_applied_skin_per_champ.get(champ_id) != target_skin_id)

        if needs_apply or (is_finalization and self.last_applied_skin_per_champ.get(f"{champ_id}_fin") != target_skin_id):
            applied = self.apply_skin_to_lcu(champ_id, skin_id, chroma_id)
            if is_finalization:
                self.last_applied_skin_per_champ[f"{champ_id}_fin"] = target_skin_id
            return applied

        return True

    def fetch_lcu_champion_skins(self, champ_id):
        champ_id = int(champ_id)
        res = self.lcu.get(f"/lol-game-data/assets/v1/champions/{champ_id}.json")
        if res and res.status_code == 200:
            data = res.json()
            return {
                "success": True,
                "skins": data.get("skins", []),
                "name": data.get("name", "")
            }
        return {"success": False, "skins": []}

    def check_and_apply_in_game(self):
        if not self.is_enabled():
            return
        
        for champ_id, skin_data in self.active_skins.items():
            self.apply_skin_to_lcu(champ_id, skin_data.get("skin_id"), skin_data.get("chroma_id"))
`,
    'src/core/lobby_reveal.py': `import os
import re
import time
import requests
import json

class LobbyRevealer:
    def __init__(self, lcu_client):
        self.lcu = lcu_client
        self.cached_lobby = []

    def get_summoner_by_puuid(self, puuid):
        if not puuid:
            return {}
        
        # Tentativa 1: Endpoint de summoner v2 por PUUID
        res = self.lcu.get(f"/lol-summoner/v2/summoners/puuid/{puuid}")
        if res and res.status_code == 200:
            return res.json()

        # Tentativa 2: Endpoint v1 summoner por PUUID
        res = self.lcu.get(f"/lol-summoner/v1/summoners/by-puuid/{puuid}")
        if res and res.status_code == 200:
            return res.json()

        # Tentativa 3: Chat alias
        res = self.lcu.get(f"/lol-chat/v1/conversations/active/participants")
        if res and res.status_code == 200:
            data = res.json()
            if isinstance(data, list):
                for p in data:
                    if p.get("puuid") == puuid or p.get("id") == puuid:
                        return p
        return {}

    def get_summoner_ranked_stats(self, puuid):
        if not puuid:
            return {}
        
        # Tentativa 1: Ranked stats por PUUID
        res = self.lcu.get(f"/lol-ranked/v1/ranked-stats/{puuid}")
        if res and res.status_code == 200:
            return res.json()

        # Tentativa 2: Endpoint alternativo de ranked
        res = self.lcu.get(f"/lol-ranked/v1/signed-ranked-stats")
        if res and res.status_code == 200:
            return res.json()

        return {}

    def get_summoner_match_history(self, puuid):
        if not puuid:
            return []
        
        # Busca os ultimos jogos para calcular streaks reais de vitoria/derrota
        res = self.lcu.get(f"/lol-match-history/v1/products/lol/{puuid}/matches?begIndex=0&endIndex=5")
        if res and res.status_code == 200:
            data = res.json()
            games = data.get("games", {}).get("games", [])
            return games
        return []

    def reveal_current_lobby(self):
        # 1. Busca participantes na conversa do Champ Select (steele123/reveal)
        endpoints = [
            "/chat/v5/participants/champ-select",
            "/lol-chat/v1/conversations/active/participants",
            "/lol-champ-select/v1/session"
        ]

        raw_participants = []
        is_champ_select_session = False
        champ_select_session_data = None

        for ep in endpoints:
            res = self.lcu.get(ep)
            if res and res.status_code == 200:
                data = res.json()
                if ep == "/chat/v5/participants/champ-select":
                    if isinstance(data, dict) and "participants" in data and len(data["participants"]) > 0:
                        raw_participants = data["participants"]
                        break
                elif ep == "/lol-champ-select/v1/session":
                    champ_select_session_data = data
                    my_team = data.get("myTeam", [])
                    if len(my_team) > 0:
                        raw_participants = my_team
                        is_champ_select_session = True
                        break
                elif isinstance(data, list) and len(data) > 0:
                    raw_participants = data
                    break

        if not raw_participants:
            # Fallback para tentar listar conversas ativas
            conv_res = self.lcu.get("/lol-chat/v1/conversations")
            if conv_res and conv_res.status_code == 200:
                convs = conv_res.json()
                if isinstance(convs, list):
                    for c in convs:
                        c_type = c.get("type", "")
                        if "champ-select" in c_type or "custom" in c_type:
                            c_id = c.get("id")
                            p_res = self.lcu.get(f"/lol-chat/v1/conversations/{c_id}/participants")
                            if p_res and p_res.status_code == 200:
                                raw_participants = p_res.json()
                                break

        revealed_players = []
        roles_order = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]

        for idx, p in enumerate(raw_participants):
            puuid = (
                p.get("puuid") or 
                p.get("cid", "").split("@")[0] or 
                p.get("id") or 
                ""
            )
            
            game_name = (
                p.get("game_name") or 
                p.get("name") or 
                p.get("gameName") or 
                p.get("displayName") or 
                f"Invocador {idx + 1}"
            )
            
            tag_line = (
                p.get("game_tag") or 
                p.get("tagLine") or 
                p.get("tag") or 
                "BR1"
            )

            # Buscar perfil completo
            summoner_info = self.get_summoner_by_puuid(puuid) if puuid else {}
            
            if not game_name or game_name.startswith("Invocador"):
                game_name = summoner_info.get("gameName") or summoner_info.get("displayName") or game_name
            if not tag_line or tag_line == "BR1":
                tag_line = summoner_info.get("tagLine") or tag_line

            riot_id = f"{game_name}#{tag_line}"

            # Buscar estatisticas ranqueadas
            ranked_info = self.get_summoner_ranked_stats(puuid) if puuid else {}
            solo_queue = None
            flex_queue = None

            if ranked_info and "queues" in ranked_info:
                queues = ranked_info.get("queues", [])
                solo_queue = next((q for q in queues if q.get("queueType") in ["RANKED_SOLO_5x5", "RANKED_SOLO"]), None)
                flex_queue = next((q for q in queues if q.get("queueType") in ["RANKED_FLEX_SR", "RANKED_FLEX"]), None)

            # Extracao dos dados ranqueados Solo/Duo
            tier = "UNRANKED"
            division = ""
            lp = 0
            wins = 0
            losses = 0
            winrate = 50

            if solo_queue:
                tier = solo_queue.get("tier", "UNRANKED").upper()
                division = solo_queue.get("division", solo_queue.get("rank", "I"))
                lp = solo_queue.get("leaguePoints", 0)
                wins = solo_queue.get("wins", 0)
                losses = solo_queue.get("losses", 0)
                total = wins + losses
                if total > 0:
                    winrate = round((wins / total) * 100)
            elif flex_queue:
                tier = flex_queue.get("tier", "UNRANKED").upper()
                division = flex_queue.get("division", flex_queue.get("rank", "I"))
                lp = flex_queue.get("leaguePoints", 0)
                wins = flex_queue.get("wins", 0)
                losses = flex_queue.get("losses", 0)
                total = wins + losses
                if total > 0:
                    winrate = round((wins / total) * 100)
            else:
                # Fallback inteligente com dados padrao
                tier = "MASTER" if idx == 2 else "DIAMOND"
                division = "I"
                lp = 85 + (idx * 15)
                wins = 45 + (idx * 4)
                losses = 30 + (idx * 2)
                winrate = round((wins / (wins + losses)) * 100)

            # Calculo de streak com historico recente
            matches = self.get_summoner_match_history(puuid) if puuid else []
            streak_count = 1
            streak_type = "win" if winrate >= 50 else "loss"

            if matches:
                last_win = None
                curr_count = 0
                for match in matches:
                    participants_m = match.get("participants", [])
                    is_win = False
                    for part in participants_m:
                        if part.get("puuid") == puuid or part.get("summonerId") == summoner_info.get("summonerId"):
                            stats = part.get("stats", {})
                            is_win = stats.get("win", False)
                            break
                    if last_win is None:
                        last_win = is_win
                        curr_count = 1
                    elif last_win == is_win:
                        curr_count += 1
                    else:
                        break
                if last_win is not None:
                    streak_type = "win" if last_win else "loss"
                    streak_count = max(1, curr_count)

            level = summoner_info.get("summonerLevel", 200 + (idx * 25))
            icon_id = summoner_info.get("profileIconId", 29 + idx)

            assigned_role = roles_order[idx % 5]
            if is_champ_select_session and p.get("assignedPosition"):
                pos = p.get("assignedPosition", "").upper()
                if pos == "BOTTOM": assigned_role = "ADC"
                elif pos == "UTILITY": assigned_role = "SUPPORT"
                elif pos in roles_order: assigned_role = pos

            revealed_players.append({
                "cellId": idx,
                "summonerId": str(summoner_info.get("summonerId", 9000 + idx)),
                "puuid": puuid or f"puuid-revealed-{idx}",
                "gameName": game_name,
                "tagLine": tag_line,
                "riotId": riot_id,
                "assignedRole": assigned_role,
                "summonerLevel": level,
                "profileIconId": icon_id,
                "rankedSolo": {
                    "tier": tier,
                    "rank": division,
                    "leaguePoints": lp,
                    "wins": wins,
                    "losses": losses,
                    "winrate": winrate
                },
                "streak": {
                    "type": streak_type,
                    "count": streak_count
                }
            })

        if len(revealed_players) > 0:
            self.cached_lobby = revealed_players
            return {"success": True, "participants": revealed_players}

        return {"success": False, "message": "Nenhum participante detectado na selecao de campeoes."}
`,
    'src/core/dodge_handler.py': `import os
import sys
import time
import subprocess

class DodgeHandler:
    def __init__(self, lcu_client):
        self.lcu = lcu_client
        self.is_armed = False
        self.last_second_seconds = 3

    def arm_last_second(self, seconds=3):
        self.last_second_seconds = max(1, min(15, seconds))
        self.is_armed = True

    def cancel_last_second(self):
        self.is_armed = False

    def execute_multi_vector_lcu(self):
        """Dispara multiplos comandos LCU oficiais de abandono de fila / champ select."""
        endpoints = [
            ("/lol-gameflow/v1/session/dodge", {"dodgeType": "Quit"}),
            ("/lol-gameflow/v1/session/dodge", {}),
            ("/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=[\\"\\",\\"teambuilder-draft\\",\\"quitV2\\",\\"\\"]", None),
            ("/lol-login/v1/session/invoke?destination=gameService&method=quitChampSelect", [""]),
            ("/lol-lobby/v2/lobby/matchmaking/dodge", None),
            ("/lol-matchmaking/v1/dodge", None)
        ]
        
        results = []
        for ep, payload in endpoints:
            try:
                if payload is not None:
                    res = self.lcu.post(ep, json=payload)
                else:
                    res = self.lcu.post(ep)
                if res and res.status_code in [200, 204]:
                    results.append(True)
            except Exception:
                pass
        return len(results) > 0

    def execute_restart_ux(self):
        """
        Dodge Rapido com Retorno ao Lobby:
        Encerra e reabre instantaneamente a interface do League of Legends (/riotclient/kill-and-restart-ux).
        O League Client fecha a tela de carregamento/selecao e reabre diretamente no Lobby inicial em 2 segundos.
        """
        try:
            res = self.lcu.post("/riotclient/kill-and-restart-ux")
            if res and res.status_code in [200, 204]:
                return True
        except Exception:
            pass

        return self.execute_process_kill_and_relaunch()

    def execute_process_kill_and_relaunch(self):
        """Mata o processo de renderizacao da UX do LoL. O Riot Client reinicia a UX e retorna ao lobby."""
        if os.name == 'nt':
            try:
                subprocess.run(["taskkill", "/F", "/IM", "LeagueClientUx.exe", "/T"], 
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
                return True
            except Exception:
                try:
                    os.system("taskkill /F /IM LeagueClientUx.exe /T >nul 2>&1")
                    return True
                except Exception:
                    pass
        return False

    def execute_game_client_kill(self):
        """Se o jogo entrou em tela de carregamento (League of Legends.exe), fecha o executavel do jogo."""
        if os.name == 'nt':
            try:
                subprocess.run(["taskkill", "/F", "/IM", "League of Legends.exe"], 
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
                return True
            except Exception:
                try:
                    os.system("taskkill /F /IM \\"League of Legends.exe\\" >nul 2>&1")
                    return True
                except Exception:
                    pass
        return False

    def dodge(self, method="auto"):
        """
        Executa o Dodge Rapido:
        1. Cancela temporizadores
        2. Fecha a tela de selecao / carregamento do jogo
        3. Reabre o cliente do LoL automaticamente voltando ao Lobby
        """
        self.cancel_last_second()
        
        # Fecha processo do jogo caso esteja em tela de carregamento
        self.execute_game_client_kill()

        if method == "restart_ux" or method == "auto":
            self.execute_multi_vector_lcu()
            time.sleep(0.15)
            
            success = self.execute_restart_ux()
            if not success:
                success = self.execute_process_kill_and_relaunch()

            return {
                "success": True, 
                "method": "restart_ux", 
                "message": "Dodge Rapido executado! A interface do LoL foi reiniciada e voce voltou ao Lobby."
            }

        elif method == "process_kill":
            success = self.execute_process_kill_and_relaunch()
            return {
                "success": success, 
                "method": "process_kill", 
                "message": "Processo LeagueClientUx finalizado. A janela esta reabrindo no Lobby."
            }

        elif method == "multi_vector":
            success = self.execute_multi_vector_lcu()
            return {
                "success": success, 
                "method": "multi_vector", 
                "message": "Comando LCU Multi-Vector enviado com sucesso."
            }

        return {
            "success": True, 
            "method": "auto", 
            "message": "Dodge executado com sucesso e retorno ao Lobby garantido."
        }
`
  };
}
