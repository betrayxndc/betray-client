import time

class AutoAcceptHandler:
    def __init__(self, lcu_client, settings=None):
        self.lcu = lcu_client
        self.settings = settings if settings is not None else {}

    def check_and_accept(self, delay=None):
        enabled = self.settings.get("auto_accept", True) if isinstance(self.settings, dict) else True
        if not enabled and self.settings.get("autoAcceptEnabled", True) is False:
            return False
        
        phase = self.lcu.get_gameflow_phase()
        if phase == "ReadyCheck":
            if delay is None:
                delay = self.settings.get("auto_accept_delay", 1) or self.settings.get("autoAcceptDelay", 1)
            try:
                time.sleep(float(delay))
            except Exception:
                time.sleep(1.0)
            res = self.lcu.post("/lol-matchmaking/v1/ready-check/accept")
            return res and res.status_code == 200
        return False
