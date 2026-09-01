const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function buildLauncher() {
  console.log('[*] Compilando BetrayClient.exe nativo e auto-contido para Windows...');

  // 1. Carregar arquivos do projeto diretamente do disco
  const filesToEmbed = {};

  // Package inits
  filesToEmbed['src/__init__.py'] = fs.readFileSync(path.join(__dirname, '../src/__init__.py'), 'utf-8');
  filesToEmbed['src/api/__init__.py'] = fs.readFileSync(path.join(__dirname, '../src/api/__init__.py'), 'utf-8');
  filesToEmbed['src/api/lcu_client.py'] = fs.readFileSync(path.join(__dirname, '../src/api/lcu_client.py'), 'utf-8');
  filesToEmbed['src/core/__init__.py'] = fs.readFileSync(path.join(__dirname, '../src/core/__init__.py'), 'utf-8');

  // Core files
  const coreDir = path.join(__dirname, '../src/core');
  if (fs.existsSync(coreDir)) {
    const coreFiles = fs.readdirSync(coreDir);
    for (const file of coreFiles) {
      if (file.endsWith('.py')) {
        filesToEmbed[`src/core/${file}`] = fs.readFileSync(path.join(coreDir, file), 'utf-8');
      }
    }
  }

  // Requirements
  filesToEmbed['requirements.txt'] = `requests>=2.28.0
urllib3>=1.26.0
psutil>=5.9.0
pywebview>=4.0.0
websockets>=11.0.0
rich>=13.0.0
`;

  // Default settings.json
  filesToEmbed['config/settings.json'] = `{
  "auto_accept": true,
  "auto_accept_delay": 1,
  "auto_pick_enabled": true,
  "auto_lock_pick": true,
  "auto_ban_enabled": true,
  "rose_skin_changer_enabled": true,
  "pre_pick_champions": { "TOP": [], "JUNGLE": [], "MID": [], "ADC": [], "SUPPORT": [] },
  "pre_ban_champions": [],
  "rose_selected_skins": {},
  "last_second_dodge_enabled": false,
  "last_second_dodge_seconds": 3
}`;

  // Robust main.py
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
from src.core.lobby_reveal import LobbyRevealer, LobbyRevealHandler
from src.core.dodge_handler import DodgeHandler

PORT = 3000
SETTINGS_FILE = os.path.join(BASE_DIR, "config", "settings.json")

# Instancias globais dos controladores
lcu = LCUClient()
settings_data = {}

def load_settings():
    global settings_data
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                settings_data = json.load(f)
                return settings_data
        except Exception:
            pass
    settings_data = {
        "auto_accept": True,
        "auto_accept_delay": 1,
        "auto_pick_enabled": True,
        "auto_lock_pick": True,
        "auto_ban_enabled": True,
        "rose_skin_changer_enabled": True,
        "pre_pick_champions": { "TOP": [], "JUNGLE": [], "MID": [], "ADC": [], "SUPPORT": [] },
        "pre_ban_champions": [],
        "rose_selected_skins": {}
    }
    return settings_data

def save_settings(data):
    global settings_data
    settings_data = data
    try:
        os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

# Inicializa controladores
settings_data = load_settings()
auto_accept = AutoAcceptHandler(lcu, settings_data)
auto_pick = AutoPickHandler(lcu, settings_data)
auto_ban = AutoBanHandler(lcu, settings_data)
rose_skins = RoseSkinChanger(lcu, settings_data)
lobby_reveal = LobbyRevealer(lcu, settings_data)
dodge_engine = DodgeHandler(lcu, settings_data)
bg_changer = BackgroundChanger(lcu, settings_data)

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        web_dir = os.path.join(BASE_DIR, "web")
        super().__init__(*args, directory=web_dir, **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path == "/api/status" or self.path == "/api/lcu_status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            status = {
                "connected": lcu.is_connected(),
                "port": lcu.port,
                "phase": lcu.get_gameflow_phase(),
                "client": "BetrayClient v2.4.0"
            }
            self.wfile.write(json.dumps(status).encode('utf-8'))
            return
        elif self.path == "/api/settings":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(load_settings()).encode('utf-8'))
            return
        elif self.path == "/api/reveal":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            data = lobby_reveal.reveal_lobby()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return
        elif self.path == "/api/summoner":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            summ = lcu.get_current_summoner()
            ranked = lcu.get_ranked_stats()
            self.wfile.write(json.dumps({"success": summ is not None, "summoner": summ, "ranked": ranked}).encode('utf-8'))
            return
        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if self.path == "/api/settings":
            save_settings(payload)
            # Atualiza referencias de settings em todos os handlers
            auto_accept.settings = payload
            auto_pick.settings = payload
            auto_ban.settings = payload
            rose_skins.settings = payload
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return
        elif self.path == "/api/dodge":
            method = payload.get("method", "auto")
            res = dodge_engine.dodge(method)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
            return
        elif self.path == "/api/rose_skin":
            champ_id = payload.get("champId")
            skin_id = payload.get("skinId")
            chroma_id = payload.get("chromaId")
            skin_name = payload.get("skinName", "")
            res = rose_skins.set_skin(champ_id, skin_id, chroma_id, skin_name)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode('utf-8'))
            return
        elif self.path == "/api/background_skin":
            skin_id = payload.get("skinId")
            res = bg_changer.set_background(skin_id)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": res}).encode('utf-8'))
            return

        super().do_POST()

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        httpd = socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler)
        httpd.serve_forever()
    except Exception as e:
        print(f"[!] Erro ao iniciar servidor HTTP: {e}")

def start_lcu_worker():
    print("[+] Betray Client Worker LCU iniciado em segundo plano.")
    while True:
        try:
            if not lcu.is_connected():
                lcu.find_and_connect()
            
            if lcu.is_connected():
                st = load_settings()
                phase = lcu.get_gameflow_phase()

                # 1. Auto-Accept
                if st.get("auto_accept", True) and phase == "ReadyCheck":
                    auto_accept.check_and_accept()

                # 2. Champ Select Handling (Auto-Pick, Auto-Ban, Skin Injection)
                if phase == "ChampSelect":
                    session = lcu.get_champ_select_session()
                    if session:
                        if st.get("auto_pick_enabled", True):
                            auto_pick.check_and_act(session)
                        if st.get("auto_ban_enabled", True):
                            auto_ban.check_and_act(session)
                        if st.get("rose_skin_changer_enabled", True):
                            rose_skins.check_and_apply_champ_select(session)

            time.sleep(0.8)
        except Exception:
            time.sleep(1.5)

def main():
    print("=" * 65)
    print("       BETRAY CLIENT v2.4.0 - LEAGUE OF LEGENDS SUITE")
    print("       Auto-Accept | Rose Skin Changer | Lobby Reveal")
    print("===================================================================")
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    worker_thread = threading.Thread(target=start_lcu_worker, daemon=True)
    worker_thread.start()

    time.sleep(0.4)
    url = f"http://127.0.0.1:{PORT}"
    print(f"[*] Abrindo interface do Betray Client: {url}")
    
    # Inicia com pywebview se disponivel, ou abre no Edge / Chrome / Browser
    if HAS_WEBVIEW:
        try:
            webview.create_window(
                "Betray Client - League of Legends Suite",
                url,
                width=1280,
                height=820,
                background_color='#07090e',
                resizable=True,
                easy_drag=True
            )
            webview.start()
            return
        except Exception:
            pass
            
    os.system(f'start msedge.exe --app="{url}" --window-size=1280,820 2>nul || start {url}')
    while True:
        time.sleep(1)

if __name__ == "__main__":
    main()
`;

  // HTML index
  filesToEmbed['web/index.html'] = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Betray Client v2.4.0</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Rajdhani', sans-serif; background-color: #07090e; color: #f8fafc; user-select: none; }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between bg-[#07090e] text-white">
  <header class="p-4 border-b border-rose-950/80 bg-black/60 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center font-cinzel font-black text-white shadow-[0_0_15px_rgba(225,29,72,0.6)]">B</div>
      <div>
        <h1 class="font-cinzel font-black tracking-wider text-lg leading-none">BETRAY <span class="text-rose-500">CLIENT</span></h1>
        <span class="text-[9px] font-mono text-slate-400">Desktop Suite • v2.4.0</span>
      </div>
    </div>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-xs font-mono text-emerald-300">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span id="header-status">LCU CONECTADO (127.0.0.1:3000)</span>
    </div>
  </header>

  <main class="flex-1 max-w-5xl mx-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
    <div class="p-8 rounded-2xl bg-[#0d1017] border border-rose-800/40 shadow-2xl max-w-3xl w-full">
      <div class="text-rose-500 font-cinzel text-3xl font-bold mb-2">🌸 ROSE SKIN CHANGER & UTILITY SUITE</div>
      <p class="text-sm text-slate-300 mb-8 max-w-xl mx-auto">O Betray Client está ativo em segundo plano e sincronizado diretamente com o cliente do League of Legends.</p>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
        <div class="p-4 rounded-xl bg-black/60 border border-rose-950/80 shadow">
          <div class="text-[10px] font-mono text-rose-400 font-bold uppercase">STATUS LCU</div>
          <div class="text-sm font-bold text-emerald-400 mt-1">✓ Conectado</div>
        </div>
        <div class="p-4 rounded-xl bg-black/60 border border-rose-950/80 shadow">
          <div class="text-[10px] font-mono text-rose-400 font-bold uppercase">AUTO-ACCEPT</div>
          <div class="text-sm font-bold text-emerald-400 mt-1">✓ Ativo (1s)</div>
        </div>
        <div class="p-4 rounded-xl bg-black/60 border border-rose-950/80 shadow">
          <div class="text-[10px] font-mono text-rose-400 font-bold uppercase">SKIN CHANGER</div>
          <div class="text-sm font-bold text-emerald-400 mt-1">✓ Rose Engine</div>
        </div>
        <div class="p-4 rounded-xl bg-black/60 border border-rose-950/80 shadow">
          <div class="text-[10px] font-mono text-rose-400 font-bold uppercase">LOBBY REVEAL</div>
          <div class="text-sm font-bold text-emerald-400 mt-1">✓ steele123</div>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-rose-950/60 flex flex-wrap items-center justify-center gap-4">
        <button onclick="triggerDodge()" class="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer">
          🚪 Executar Dodge Rápido
        </button>
        <button onclick="fetchReveal()" class="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-cinzel font-bold text-xs uppercase tracking-wider shadow cursor-pointer">
          🔍 Escanear Lobby (Revelar Nomes)
        </button>
      </div>

      <div id="action-feedback" class="mt-4 text-xs font-mono text-slate-400 min-h-[1.5rem]"></div>
    </div>
  </main>

  <footer class="p-4 text-center text-xs text-slate-500 border-t border-rose-950/60 font-mono">
    Betray Client v2.4.0 — Standalone Native Desktop Edition • Feito por betray
  </footer>

  <script>
    function triggerDodge() {
      const fb = document.getElementById('action-feedback');
      fb.innerText = 'Enviando comando de Dodge...';
      fetch('/api/dodge', { method: 'POST', body: JSON.stringify({ method: 'auto' }), headers: { 'Content-Type': 'application/json' } })
        .then(r => r.json())
        .then(d => { fb.innerText = '✓ ' + (d.message || 'Dodge executado!'); })
        .catch(e => { fb.innerText = '✕ Erro ao executar dodge.'; });
    }

    function fetchReveal() {
      const fb = document.getElementById('action-feedback');
      fb.innerText = 'Buscando participantes do Champ Select...';
      fetch('/api/reveal')
        .then(r => r.json())
        .then(d => {
          if (d.participants && d.participants.length > 0) {
            fb.innerText = '✓ ' + d.participants.length + ' jogadores identificados no lobby!';
          } else {
            fb.innerText = 'Aguardando entrada em uma sala de Champ Select...';
          }
        })
        .catch(e => { fb.innerText = '✕ Erro ao escanear lobby.'; });
    }

    setInterval(() => {
      fetch('/api/status')
        .then(r => r.json())
        .then(s => {
          const el = document.getElementById('header-status');
          if (s.connected) {
            el.innerText = 'LCU: Conectado • Fase: ' + s.phase;
          } else {
            el.innerText = 'Aguardando League of Legends...';
          }
        })
        .catch(() => {});
    }, 2500);
  </script>
</body>
</html>`;

  // 2. Gerar launcher.c com arquivos embutidos
  let embeddedFileStructs = '';
  let fileCount = 0;

  for (const [relPath, content] of Object.entries(filesToEmbed)) {
    const varName = `file_data_${fileCount}`;
    const escapedContent = JSON.stringify(content);
    embeddedFileStructs += `static const char ${varName}[] = ${escapedContent};\n`;
    fileCount++;
  }

  let fileTable = 'static const struct { const char* path; const char* data; size_t len; } EMBEDDED_FILES[] = {\n';
  let idx = 0;
  for (const [relPath, content] of Object.entries(filesToEmbed)) {
    fileTable += `    { "${relPath.replace(/\//g, '\\\\')}", file_data_${idx}, sizeof(file_data_${idx}) - 1 },\n`;
    idx++;
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

    // Limpa __pycache__ e arquivos bytecode antigos para evitar conflitos de cache
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
    SetConsoleTitleA("Betray Client v2.4.0 - League of Legends Suite");

    printf("===================================================================\\n");
    printf("     BETRAY CLIENT v2.4.0 - LEAGUE OF LEGENDS UTILITY SUITE\\n");
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

  const outExePath = path.join(process.cwd(), 'BetrayClient.exe');
  const publicDir = path.join(process.cwd(), 'public');
  const publicExePath = path.join(publicDir, 'BetrayClient.exe');

  console.log('[*] Compilando codigo C com x86_64-w64-mingw32-gcc...');
  execSync(`x86_64-w64-mingw32-gcc -O2 -s -mconsole "${cFilePath}" -o "${outExePath}"`);
  
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.copyFileSync(outExePath, publicExePath);

  console.log(`[+] BetrayClient.exe gerado com sucesso em ${outExePath} e ${publicExePath}!`);
}

buildLauncher();
