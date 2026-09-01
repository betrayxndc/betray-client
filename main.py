"""
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
