class BackgroundChanger:
    def __init__(self, lcu_client):
        self.lcu = lcu_client

    def set_background(self, skin_id):
        payload = {"key": "backgroundSkinId", "value": int(skin_id)}
        res = self.lcu.post("/lol-summoner/v1/current-summoner/background-skin", payload)
        if not res or res.status_code not in [200, 204]:
            res = self.lcu.put("/lol-summoner/v1/current-summoner/background-skin", payload)
        return res and res.status_code in [200, 204]
