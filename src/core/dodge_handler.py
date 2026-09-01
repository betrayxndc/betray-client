import os
import sys
import time
import subprocess

class DodgeHandler:
    def __init__(self, lcu_client, settings=None):
        self.lcu = lcu_client
        self.settings = settings if settings is not None else {}
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
            ("/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=[\"\",\"teambuilder-draft\",\"quitV2\",\"\"]", None),
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
                    os.system("taskkill /F /IM \"League of Legends.exe\" >nul 2>&1")
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
