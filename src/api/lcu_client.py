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

    def find_lockfile(self):
        for proc in psutil.process_iter(['name', 'cmdline']):
            try:
                name = proc.info['name'] or ''
                if 'LeagueClientUx' in name:
                    cmdline = ' '.join(proc.info['cmdline'] or [])
                    port_match = re.search(r'--app-port=([0-9]+)', cmdline)
                    token_match = re.search(r'--remoting-auth-token=([\w-]+)', cmdline)
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
