import os
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

    def is_connected(self):
        if not self.connected or not self.port or not self.auth_token:
            return self.find_lockfile()
        try:
            res = self.session.get(f"{self.protocol}://127.0.0.1:{self.port}/lol-gameflow/v1/gameflow-phase", timeout=1.5)
            if res and res.status_code == 200:
                return True
        except Exception:
            pass
        return self.find_lockfile()

    def find_and_connect(self):
        return self.find_lockfile()

    def find_lockfile(self):
        # Estratégia 1: Process command-line args via psutil
        try:
            for proc in psutil.process_iter(['name', 'cmdline', 'exe']):
                try:
                    name = proc.info.get('name') or ''
                    if 'LeagueClientUx' in name or 'LeagueClient' in name:
                        cmdline_list = proc.info.get('cmdline') or []
                        cmdline = ' '.join(cmdline_list)
                        port_match = re.search(r'--app-port=([0-9]+)', cmdline)
                        token_match = re.search(r'--remoting-auth-token=([\w-]+)', cmdline)
                        if port_match and token_match:
                            self.port = port_match.group(1)
                            self.auth_token = token_match.group(1)
                            self.setup_auth()
                            self.connected = True
                            return True
                        
                        # Estratégia 2: Lockfile na pasta do executável do processo
                        exe_path = proc.info.get('exe')
                        if exe_path:
                            exe_dir = os.path.dirname(exe_path)
                            lock_candidate = os.path.join(exe_dir, "lockfile")
                            if self.try_read_lockfile(lock_candidate):
                                return True
                except (psutil.NoSuchProcess, psutil.AccessDenied, Exception):
                    continue
        except Exception:
            pass

        # Estratégia 3: Caminhos comuns do League of Legends no Windows
        common_paths = [
            r"C:\Riot Games\League of Legends\lockfile",
            r"D:\Riot Games\League of Legends\lockfile",
            r"E:\Riot Games\League of Legends\lockfile",
            r"F:\Riot Games\League of Legends\lockfile",
            r"C:\Program Files\Riot Games\League of Legends\lockfile",
            r"C:\Program Files (x86)\Riot Games\League of Legends\lockfile"
        ]
        for p in common_paths:
            if self.try_read_lockfile(p):
                return True

        self.connected = False
        return False

    def try_read_lockfile(self, file_path):
        if not file_path or not os.path.exists(file_path):
            return False
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            parts = content.split(':')
            if len(parts) >= 5:
                # Format: ProcessName:PID:Port:Password:Protocol
                self.port = parts[2]
                self.auth_token = parts[3]
                self.protocol = parts[4] if len(parts) > 4 else 'https'
                self.setup_auth()
                self.connected = True
                return True
        except Exception:
            pass
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

    def request(self, method, endpoint, data=None, json=None, timeout=3):
        if not self.connected: 
            if not self.connect(): return None
        url = f"{self.protocol}://127.0.0.1:{self.port}{endpoint}"
        try:
            if json is not None:
                return self.session.request(method, url, json=json, timeout=timeout)
            elif data is not None and isinstance(data, (dict, list)):
                return self.session.request(method, url, json=data, timeout=timeout)
            elif data is not None:
                return self.session.request(method, url, data=data, timeout=timeout)
            else:
                return self.session.request(method, url, timeout=timeout)
        except Exception:
            return None

    def get(self, endpoint):
        return self.request("GET", endpoint)

    def post(self, endpoint, data=None, json=None):
        return self.request("POST", endpoint, data=data, json=json)

    def put(self, endpoint, data=None, json=None):
        return self.request("PUT", endpoint, data=data, json=json)

    def patch(self, endpoint, data=None, json=None):
        return self.request("PATCH", endpoint, data=data, json=json)

    def delete(self, endpoint):
        return self.request("DELETE", endpoint)

    def get_gameflow_phase(self):
        res = self.get('/lol-gameflow/v1/gameflow-phase')
        if res and res.status_code == 200:
            return res.text.replace('"', '').strip()
        return "None"

    def get_champ_select_session(self):
        res = self.get('/lol-champ-select/v1/session')
        if res and res.status_code == 200:
            try:
                return res.json()
            except Exception:
                pass
        return None

    def get_current_summoner(self):
        res = self.get('/lol-summoner/v1/current-summoner')
        if res and res.status_code == 200:
            try:
                return res.json()
            except Exception:
                pass
        return None

    def get_ranked_stats(self, puuid=None):
        if puuid:
            res = self.get(f'/lol-ranked/v1/ranked-stats/{puuid}')
        else:
            res = self.get('/lol-ranked/v1/current-ranked-stats')
        if res and res.status_code == 200:
            try:
                return res.json()
            except Exception:
                pass
        return None
