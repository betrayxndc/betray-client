import time

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
