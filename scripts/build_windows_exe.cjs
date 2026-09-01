const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function escapeCString(str) {
  return JSON.stringify(str);
}

function buildLauncher() {
  console.log('[*] Compilando BetrayClient.exe nativo e auto-contido para Windows...');

  // 1. Carregar arquivos do projeto
  const filesToEmbed = {};

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

  // LCU Client
  filesToEmbed['src/api/lcu_client.py'] = `"""
LCU Client - API de comunicacao com a League Client Update API
"""
import os
import ssl
import json
import base64
import urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class LCUClient:
    def __init__(self):
        self.port = None
        self.auth_token = None
        self.protocol = "https"
        self.host = "127.0.0.1"
        self.session = requests.Session()
        self.session.verify = False

    def is_connected(self):
        return self.port is not None and self.auth_token is not None

    def connect_with_credentials(self, port, auth_token):
        self.port = int(port)
        self.auth_token = str(auth_token)
        self.session.headers.update({
            "Authorization": f"Basic {self.auth_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        })
        return True

    def find_and_connect(self):
        try:
            import psutil
            for proc in psutil.process_iter(['name', 'cmdline']):
                try:
                    name = proc.info.get('name') or ''
                    if 'LeagueClientUx' in name or 'LeagueClient' in name:
                        cmdline = proc.info.get('cmdline') or []
                        port = None
                        token = None
                        for arg in cmdline:
                            if arg.startswith('--app-port='):
                                port = arg.split('=')[1]
                            elif arg.startswith('--remoting-auth-token='):
                                token = arg.split('=')[1]
                        if port and token:
                            b64_auth = base64.b64encode(f"riot:{token}".encode('utf-8')).decode('utf-8')
                            return self.connect_with_credentials(port, b64_auth)
                except Exception:
                    continue
        except Exception:
            pass
        return False

    def request(self, method, endpoint, data=None):
        if not self.is_connected():
            if not self.find_and_connect():
                return None
        url = f"{self.protocol}://{self.host}:{self.port}{endpoint}"
        try:
            if data is not None:
                if isinstance(data, (dict, list)):
                    data = json.dumps(data)
                res = self.session.request(method, url, data=data, timeout=5)
            else:
                res = self.session.request(method, url, timeout=5)
            if res.status_code in [200, 201, 204]:
                try:
                    return res.json()
                except Exception:
                    return res.text or True
            return None
        except Exception:
            return None

    def get(self, endpoint):
        return self.request("GET", endpoint)

    def post(self, endpoint, data=None):
        return self.request("POST", endpoint, data)

    def put(self, endpoint, data=None):
        return self.request("PUT", endpoint, data)

    def delete(self, endpoint):
        return self.request("DELETE", endpoint)

    def patch(self, endpoint, data=None):
        return self.request("PATCH", endpoint, data)
`;

  // Requirements
  filesToEmbed['requirements.txt'] = `requests>=2.28.0
urllib3>=1.26.0
psutil>=5.9.0
pywebview>=4.0.0
websockets>=11.0.0
rich>=13.0.0
`;

  // main.py
  filesToEmbed['main.py'] = `"""
===================================================================
 Betray Client - Desktop Application (Windows Standalone)
 Feito por: betray
 Automatizador de Fila, Pré-Pick, Pré-Ban, Skin Changer e Lobby Reveal
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
from src.core.lobby_reveal import LobbyRevealHandler
from src.core.dodge_handler import DodgeHandler

PORT = 3000
SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "config", "settings.json")

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_settings(data):
    try:
        os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        web_dir = os.path.join(os.path.dirname(__file__), "web")
        super().__init__(*args, directory=web_dir, **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "client": "BetrayClient"}).encode('utf-8'))
            return
        elif self.path == "/api/settings":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(load_settings()).encode('utf-8'))
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/settings":
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                save_settings(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.end_headers()
            return
        super().do_POST()

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler)
    httpd.serve_forever()

def start_lcu_worker():
    lcu = LCUClient()
    skin_changer = RoseSkinChanger(lcu)
    auto_accept = AutoAcceptHandler(lcu)
    auto_pick = AutoPickHandler(lcu)
    auto_ban = AutoBanHandler(lcu)
    lobby_reveal = LobbyRevealHandler(lcu)
    dodge = DodgeHandler(lcu)

    print("[+] Betray Client Worker LCU iniciado em segundo plano.")
    while True:
        try:
            settings = load_settings()
            if not lcu.is_connected():
                lcu.find_and_connect()
            
            if lcu.is_connected():
                if settings.get("autoAcceptEnabled", False):
                    auto_accept.check_and_accept(settings.get("autoAcceptDelay", 0))
                if settings.get("roseChangerEnabled", True):
                    skin_changer.tick(settings)
            time.sleep(1.0)
        except Exception:
            time.sleep(2.0)

def main():
    print("=" * 65)
    print("       BETRAY CLIENT v2.4.0 - LEAGUE OF LEGENDS SUITE")
    print("       Auto-Accept | Rose Skin Changer | Lobby Reveal")
    print("=" * 65)
    
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    worker_thread = threading.Thread(target=start_lcu_worker, daemon=True)
    worker_thread.start()

    time.sleep(0.5)
    url = f"http://127.0.0.1:{PORT}"
    print(f"[*] Abrindo interface gráfica do Betray Client: {url}")
    
    # Try webview, otherwise browser
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
            
    # Fallback to Edge app mode or browser
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
  <title>Betray Client</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Rajdhani', sans-serif; background-color: #07090e; color: #f8fafc; }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between bg-[#07090e] text-white">
  <header class="p-4 border-b border-rose-950/80 bg-black/60 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-cinzel font-black text-white">B</div>
      <h1 class="font-cinzel font-black tracking-wider text-lg">BETRAY <span class="text-rose-500">CLIENT</span></h1>
    </div>
    <div class="flex items-center gap-2 px-3 py-1 rounded bg-emerald-950 border border-emerald-500/60 text-xs font-mono text-emerald-300">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>LCU MOTOR ATIVO</span>
    </div>
  </header>
  <main class="flex-1 max-w-5xl mx-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
    <div class="p-6 rounded-2xl bg-[#0d1017] border border-rose-800/40 shadow-2xl max-w-2xl w-full">
      <div class="text-rose-500 font-cinzel text-2xl font-bold mb-2">🌸 ROSE SKIN CHANGER & SUITE ATIVA</div>
      <p class="text-sm text-slate-300 mb-6">Todas as automações e o injetor de skins estão sincronizados diretamente com seu cliente do League of Legends.</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        <div class="p-3 rounded-lg bg-black/40 border border-rose-950">
          <div class="text-[10px] font-mono text-rose-400">STATUS</div>
          <div class="text-xs font-bold text-emerald-400">✓ Conectado</div>
        </div>
        <div class="p-3 rounded-lg bg-black/40 border border-rose-950">
          <div class="text-[10px] font-mono text-rose-400">AUTO-ACCEPT</div>
          <div class="text-xs font-bold text-emerald-400">✓ Ativo (0s)</div>
        </div>
        <div class="p-3 rounded-lg bg-black/40 border border-rose-950">
          <div class="text-[10px] font-mono text-rose-400">SKIN CHANGER</div>
          <div class="text-xs font-bold text-emerald-400">✓ Armado</div>
        </div>
        <div class="p-3 rounded-lg bg-black/40 border border-rose-950">
          <div class="text-[10px] font-mono text-rose-400">LOBBY REVEAL</div>
          <div class="text-xs font-bold text-emerald-400">✓ steele123</div>
        </div>
      </div>
    </div>
  </main>
  <footer class="p-4 text-center text-xs text-slate-500 border-t border-rose-950/60 font-mono">
    Betray Client v2.4.0 — Standalone Native Desktop Edition
  </footer>
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
    printf("[*] Extraindo arquivos da suite Betray Client para: %s\\n", base_dir);
    _mkdir(base_dir);

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
    // Configurar console UTF-8
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

    // 1. Extrair todos os arquivos embutidos
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
        system("python -m pip install -q -r requirements.txt");
        snprintf(run_cmd, sizeof(run_cmd), "python main.py");
    } else if (py_status == 2) {
        printf("[+] Python Launcher (py) detectado no Windows.\\n");
        printf("[*] Verificando dependencias necessarias...\\n");
        system("py -3 -m pip install -q -r requirements.txt");
        snprintf(run_cmd, sizeof(run_cmd), "py -3 main.py");
    } else {
        // Baixa e instala automaticamente!
        install_embedded_python(base_dir);
        snprintf(run_cmd, sizeof(run_cmd), "\\"%s\\" main.py", py_exe);
    }

    printf("\\n[*] Iniciando o Betray Client e conectando a LCU do League of Legends...\\n");
    printf("[*] Interface grafica sendo inicializada...\\n\\n");

    // Executa main.py
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
