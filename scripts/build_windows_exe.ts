import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { CHAMPIONS } from '../src/data/champions';
import { getDesktopHtml } from '../src/services/desktopTemplate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildWindowsExe() {
  console.log('[*] Iniciando compilação do BetrayClient.exe Standalone para Windows...');

  const filesToEmbed: Record<string, string | Buffer> = {};

  // 1. Gera o HTML rico e completo da interface com todos os campeões, skins, cromas e abas
  console.log('[*] Gerando interface web completa (web/index.html)...');
  const fullHtml = getDesktopHtml(CHAMPIONS);
  filesToEmbed['web/index.html'] = fullHtml;
  console.log(`[+] Interface web gerada: ${fullHtml.length} bytes com todas as abas e funcionalidades.`);

  // 2. Coletar arquivos Python da API e do Core
  filesToEmbed['src/__init__.py'] = fs.readFileSync(path.join(__dirname, '../src/__init__.py'), 'utf-8');
  filesToEmbed['src/api/__init__.py'] = fs.readFileSync(path.join(__dirname, '../src/api/__init__.py'), 'utf-8');
  filesToEmbed['src/api/lcu_client.py'] = fs.readFileSync(path.join(__dirname, '../src/api/lcu_client.py'), 'utf-8');
  filesToEmbed['src/core/__init__.py'] = fs.readFileSync(path.join(__dirname, '../src/core/__init__.py'), 'utf-8');

  const coreDir = path.join(__dirname, '../src/core');
  if (fs.existsSync(coreDir)) {
    const coreFiles = fs.readdirSync(coreDir);
    for (const file of coreFiles) {
      if (file.endsWith('.py')) {
        filesToEmbed[`src/core/${file}`] = fs.readFileSync(path.join(coreDir, file), 'utf-8');
      }
    }
  }

  // 3. requirements.txt
  filesToEmbed['requirements.txt'] = `requests>=2.28.0
urllib3>=1.26.0
psutil>=5.9.0
pywebview>=4.0.0
websockets>=11.0.0
rich>=13.0.0
`;

  // 4. Default settings.json
  filesToEmbed['config/settings.json'] = JSON.stringify({
    auto_accept: true,
    auto_accept_delay: 1,
    auto_pick_enabled: true,
    auto_lock_pick: true,
    auto_ban_enabled: true,
    rose_skin_changer_enabled: true,
    pre_pick_champions: { TOP: [], JUNGLE: [], MID: [], ADC: [], SUPPORT: [] },
    pre_ban_champions: [],
    rose_selected_skins: {},
    selected_background_skin_id: 91008,
    last_second_dodge_enabled: false,
    last_second_dodge_seconds: 3,
    dodge_method: "auto"
  }, null, 2);

  // 5. Python backend main.py
  filesToEmbed['main.py'] = `"""
===================================================================
 Betray Client - Desktop Application (Windows Standalone)
 Feito por: betray
 Auto-Accept | Rose Skin Changer | Auto-Pick/Ban | Lobby Reveal
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

# Adiciona o diretorio base ao sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

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

PORT = 3000
CONFIG_PATH = os.path.join(BASE_DIR, "config", "settings.json")
WEB_DIR = os.path.join(BASE_DIR, "web")

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
        self.add_log("info", "Betray Client Desktop v3.0.0 inicializado. Feito por betray.")

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
                json.dump(self.settings, f, indent=2)
            self.add_log("success", "Configurações sincronizadas com sucesso.")
            return True
        except Exception as e:
            self.add_log("error", f"Erro ao salvar configurações: {str(e)}")
            return False

    def get_lcu_status(self):
        connected = self.lcu.is_connected()
        if not connected:
            connected = self.lcu.connect()
        phase = self.lcu.get_gameflow_phase() if connected else "None"
        return {
            "connected": connected,
            "port": self.lcu.port,
            "phase": phase
        }

    def get_current_summoner_profile(self):
        if not self.lcu.is_connected() and not self.lcu.connect():
            return {"success": False, "error": "League of Legends não encontrado ou fechado."}
        
        summoner_res = self.lcu.get("/lol-summoner/v1/current-summoner")
        summoner_data = summoner_res.json() if summoner_res and summoner_res.status_code == 200 else {}
            
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

        self.add_log("success", f"Invocador identificado: {game_name}#{tag_line}")

        return {
            "success": True,
            "summoner": summoner_data,
            "ranked": ranked_data,
            "background": bg_data
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

# Global instance
lcu_global = LCUClient()
settings_global = {}
if os.path.exists(CONFIG_PATH):
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            settings_global = json.load(f)
    except Exception:
        pass

bridge_api = BetrayBridgeAPI(lcu_global, settings_global)

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def log_message(self, format, *args):
        pass

    def send_json(self, data, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path in ["/api/status", "/api/lcu_status"]:
            return self.send_json(bridge_api.get_lcu_status())
        elif self.path == "/api/settings":
            return self.send_json(bridge_api.get_settings())
        elif self.path == "/api/reveal":
            return self.send_json(bridge_api.reveal_lobby())
        elif self.path == "/api/summoner":
            return self.send_json(bridge_api.get_current_summoner_profile())
        elif self.path == "/api/logs":
            return self.send_json(bridge_api.get_logs())
        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if self.path == "/api/settings":
            ok = bridge_api.save_settings(payload)
            return self.send_json({"success": ok})
        elif self.path == "/api/dodge":
            method = payload.get("method", "auto")
            res = bridge_api.dodge_champ_select(method)
            return self.send_json(res)
        elif self.path == "/api/rose_skin":
            champ_id = payload.get("champId")
            skin_id = payload.get("skinId")
            chroma_id = payload.get("chromaId")
            skin_name = payload.get("skinName", "")
            res = bridge_api.set_rose_skin(champ_id, skin_id, chroma_id, skin_name)
            return self.send_json(res)
        elif self.path == "/api/background_skin":
            skin_id = payload.get("skinId")
            ok = bridge_api.set_background_skin(skin_id)
            return self.send_json({"success": ok})
        elif self.path == "/api/arm_dodge":
            sec = payload.get("seconds", 3)
            res = bridge_api.arm_last_second_dodge(sec)
            return self.send_json(res)
        elif self.path == "/api/cancel_dodge":
            res = bridge_api.cancel_last_second_dodge()
            return self.send_json(res)
        elif self.path == "/api/accept_match":
            ok = bridge_api.accept_match_now()
            return self.send_json({"success": ok})

        super().do_POST()

def background_lcu_worker(api):
    last_phase = "None"
    while True:
        try:
            connected = api.lcu.connect()
            if connected:
                phase = api.lcu.get_gameflow_phase()
                if phase != last_phase:
                    api.add_log("info", f"Fase de jogo LCU: {phase}")
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
                                api.add_log("warning", f"⏱️ [LAST-SECOND DODGE] Restam {adjusted_time_left:.1f}s. Executando Dodge!")
                                api.dodge_champ_select(method=api.settings.get("dodge_method", "auto"))
                                api.dodge_handler.cancel_last_second()

                elif phase == "InProgress":
                    api.rose_changer.check_and_apply_in_game()

            time.sleep(1)
        except Exception:
            time.sleep(2)

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        httpd = socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler)
        httpd.serve_forever()
    except Exception as e:
        print(f"[!] Erro ao iniciar servidor HTTP: {e}")

def main():
    print("=" * 65)
    print("       BETRAY CLIENT v3.0.0 - LEAGUE OF LEGENDS SUITE")
    print("       Auto-Accept | Rose Skin Changer | Lobby Reveal | Dodge")
    print("       Feito por: betray")
    print("===================================================================")
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    worker_thread = threading.Thread(target=background_lcu_worker, args=(bridge_api,), daemon=True)
    worker_thread.start()

    time.sleep(0.4)
    url = f"http://127.0.0.1:{PORT}"
    print(f"[*] Abrindo interface do Betray Client: {url}")
    
    if HAS_WEBVIEW:
        try:
            webview.create_window(
                "Betray Client - League of Legends Suite",
                url,
                width=1280,
                height=820,
                min_size=(960, 600),
                background_color='#07090e',
                js_api=bridge_api
            )
            webview.start(debug=False)
            return
        except Exception:
            pass
            
    os.system(f'start msedge.exe --app="{url}" --window-size=1280,820 2>nul || start {url}')
    while True:
        time.sleep(1)

if __name__ == "__main__":
    main()
`;

  // 6. Gerar arrays C byte-a-byte para cada arquivo embutido
  console.log('[*] Construindo arrays binários em C...');
  let embeddedFileStructs = '';
  let fileTable = 'static const struct { const char* path; const unsigned char* data; size_t len; } EMBEDDED_FILES[] = {\n';
  let fileCount = 0;

  for (const [relPath, content] of Object.entries(filesToEmbed)) {
    const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');
    const varName = `file_bytes_${fileCount}`;
    
    // Converte para hex array
    const hexBytes: string[] = [];
    for (let i = 0; i < buf.length; i++) {
      hexBytes.push('0x' + buf[i].toString(16).padStart(2, '0'));
    }

    embeddedFileStructs += `static const unsigned char ${varName}[] = { ${hexBytes.join(',')} };\n`;
    fileTable += `    { "${relPath.replace(/\//g, '\\\\')}", ${varName}, sizeof(${varName}) },\n`;
    fileCount++;
  }

  fileTable += '};\n';
  fileTable += `#define NUM_EMBEDDED_FILES ${fileCount}\n`;

  const cCode = `#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <direct.h>
#include <process.h>

${embeddedFileStructs}
${fileTable}

void create_directories_for_file(const char* full_path) {
    char dir_path[MAX_PATH];
    strcpy(dir_path, full_path);
    char* last_slash = strrchr(dir_path, '\\\\');
    if (!last_slash) return;
    *last_slash = '\\0';

    char tmp[MAX_PATH];
    char* p = NULL;
    size_t len;

    snprintf(tmp, sizeof(tmp), "%s", dir_path);
    len = strlen(tmp);
    if (tmp[len - 1] == '\\\\') tmp[len - 1] = 0;
    for (p = tmp + 1; *p; p++) {
        if (*p == '\\\\') {
            *p = 0;
            _mkdir(tmp);
            *p = '\\\\';
        }
    }
    _mkdir(tmp);
}

int extract_files(const char* base_dir) {
    printf("[*] Extraindo suite Betray Client para: %s\\n", base_dir);
    _mkdir(base_dir);

    // Limpa __pycache__ antigo
    char pycache_cmd[MAX_PATH + 64];
    snprintf(pycache_cmd, sizeof(pycache_cmd), "rmdir /s /q \\"%s\\\\__pycache__\\" >nul 2>&1", base_dir);
    system(pycache_cmd);
    snprintf(pycache_cmd, sizeof(pycache_cmd), "rmdir /s /q \\"%s\\\\src\\\\core\\\\__pycache__\\" >nul 2>&1", base_dir);
    system(pycache_cmd);
    snprintf(pycache_cmd, sizeof(pycache_cmd), "rmdir /s /q \\"%s\\\\src\\\\api\\\\__pycache__\\" >nul 2>&1", base_dir);
    system(pycache_cmd);

    for (int i = 0; i < NUM_EMBEDDED_FILES; i++) {
        char full_path[MAX_PATH];
        snprintf(full_path, sizeof(full_path), "%s\\\\%s", base_dir, EMBEDDED_FILES[i].path);
        
        create_directories_for_file(full_path);

        FILE* fp = fopen(full_path, "wb");
        if (fp) {
            fwrite(EMBEDDED_FILES[i].data, 1, EMBEDDED_FILES[i].len, fp);
            fclose(fp);
        } else {
            printf("[!] Aviso: Nao foi possivel escrever %s\\n", full_path);
        }
    }
    return 1;
}

int check_python_installed() {
    int res = system("python --version >nul 2>&1");
    if (res == 0) return 1;
    res = system("py -3 --version >nul 2>&1");
    if (res == 0) return 2;
    return 0;
}

void install_embedded_python(const char* base_dir) {
    printf("\\n[+] Python nao detectado no sistema.\\n");
    printf("[+] Instalando automaticamente o ambiente Python 3 e todas as dependencias...\\n");
    printf("[*] Isso pode levar alguns segundos na primeira execucao...\\n\\n");

    char cmd[4096];
    snprintf(cmd, sizeof(cmd),
        "powershell -ExecutionPolicy Bypass -Command \\""
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; "
        "$dest = Join-Path '%s' 'python.zip'; "
        "$pydir = Join-Path '%s' 'python'; "
        "if (!(Test-Path $pydir)) { "
        "  Write-Host '[*] Baixando Python Standalone Runtime...'; "
        "  (New-Object Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip', $dest); "
        "  Write-Host '[*] Extraindo Python...'; "
        "  Expand-Archive -Path $dest -DestinationPath $pydir -Force; "
        "  Remove-Item $dest -Force; "
        "  $pth = Join-Path $pydir 'python311._pth'; "
        "  if (Test-Path $pth) { (Get-Content $pth) | ForEach-Object { if ($_ -eq '#import site') { 'import site' } else { $_ } } | Set-Content $pth }; "
        "  $pip = Join-Path $pydir 'get-pip.py'; "
        "  (New-Object Net.WebClient).DownloadFile('https://bootstrap.pypa.io/get-pip.py', $pip); "
        "  & (Join-Path $pydir 'python.exe') $pip --no-warn-script-location; "
        "} "
        "Write-Host '[*] Instalando dependencias da suite (Requests, Urllib3, PyWebView, WebSockets)...'; "
        "& (Join-Path $pydir 'python.exe') -m pip install --no-warn-script-location -q requests urllib3 psutil pywebview websockets rich; "
        "Write-Host '[+] Todas as dependencias foram instaladas com sucesso!';\\"",
        base_dir, base_dir
    );

    system(cmd);
}

int main(int argc, char* argv[]) {
    SetConsoleOutputCP(65001);
    SetConsoleTitleA("Betray Client v3.0.0 - League of Legends Suite");

    printf("===================================================================\\n");
    printf("     BETRAY CLIENT v3.0.0 - LEAGUE OF LEGENDS UTILITY SUITE\\n");
    printf("     Auto-Accept | Rose Skin Changer | Auto-Pick/Ban | Lobby Reveal\\n");
    printf("===================================================================\\n\\n");

    char appdata[MAX_PATH];
    if (!GetEnvironmentVariableA("LOCALAPPDATA", appdata, sizeof(appdata))) {
        strcpy(appdata, "C:\\\\");
    }

    char base_dir[MAX_PATH];
    snprintf(base_dir, sizeof(base_dir), "%s\\\\BetrayClient", appdata);

    // 1. Extrair e atualizar todos os arquivos embutidos
    extract_files(base_dir);

    // 2. Verificar Python
    int py_status = check_python_installed();
    char py_exe[MAX_PATH];
    snprintf(py_exe, sizeof(py_exe), "%s\\\\python\\\\python.exe", base_dir);

    char run_cmd[4096];
    _chdir(base_dir);

    if (GetFileAttributesA(py_exe) != INVALID_FILE_ATTRIBUTES) {
        printf("[+] Usando ambiente Python embutido em %s\\n", py_exe);
        snprintf(run_cmd, sizeof(run_cmd), "\\"%s\\" main.py", py_exe);
    } else if (py_status == 1) {
        printf("[+] Python nativo detectado no PATH do Windows.\\n");
        printf("[*] Verificando dependencias necessarias...\\n");
        system("python -m pip install -q --no-warn-script-location -r requirements.txt");
        snprintf(run_cmd, sizeof(run_cmd), "python main.py");
    } else if (py_status == 2) {
        printf("[+] Python Launcher (py) detectado no Windows.\\n");
        printf("[*] Verificando dependencias necessarias...\\n");
        system("py -3 -m pip install -q --no-warn-script-location -r requirements.txt");
        snprintf(run_cmd, sizeof(run_cmd), "py -3 main.py");
    } else {
        install_embedded_python(base_dir);
        snprintf(run_cmd, sizeof(run_cmd), "\\"%s\\" main.py", py_exe);
    }

    printf("\\n[*] Iniciando o Betray Client e conectando a LCU do League of Legends...\\n");
    printf("[*] Interface grafica sendo inicializada...\\n\\n");

    int exit_code = system(run_cmd);
    if (exit_code != 0) {
        printf("\\n[!] O processo foi finalizado com codigo %d.\\n", exit_code);
        printf("Pressione qualquer tecla para fechar esta janela...\\n");
        getchar();
    }

    return 0;
}
`;

  const cFilePath = '/tmp/betray_launcher.c';
  fs.writeFileSync(cFilePath, cCode);

  const publicDir = path.join(process.cwd(), 'public');
  const publicExePath = path.join(publicDir, 'BetrayClient.exe');

  console.log('[*] Compilando codigo C com x86_64-w64-mingw32-gcc...');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  execSync(`x86_64-w64-mingw32-gcc -O2 -s -mconsole "${cFilePath}" -o "${publicExePath}"`);

  // Limpa o arquivo temporario em C
  try { fs.unlinkSync(cFilePath); } catch {}

  const exeStat = fs.statSync(publicExePath);
  console.log(`[+] BetrayClient.exe gerado com sucesso em ${publicExePath} (${(exeStat.size / (1024 * 1024)).toFixed(2)} MB)!`);

  // Remove any redundant .exe files in other directories
  const rootExe = path.join(process.cwd(), 'BetrayClient.exe');
  if (fs.existsSync(rootExe)) fs.unlinkSync(rootExe);
  const distExe = path.join(process.cwd(), 'dist', 'BetrayClient.exe');
  if (fs.existsSync(distExe)) fs.unlinkSync(distExe);

  // Atualizar asset base64 para downloads in-browser
  console.log('[*] Gerando representacao base64 para suporte offline...');
  const exeBuffer = fs.readFileSync(publicExePath);
  const base64String = exeBuffer.toString('base64');
  const base64TsContent = `// Arquivo compilado BetrayClient.exe standalone para Windows x86_64
export const BETRAY_CLIENT_EXE_BASE64 = "${base64String}";
`;
  fs.writeFileSync(path.join(process.cwd(), 'src/assets/betrayClientExeBase64.ts'), base64TsContent);
  console.log('[+] Asset base64 atualizado com sucesso!');
}

buildWindowsExe();
