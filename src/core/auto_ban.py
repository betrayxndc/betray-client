import time

class AutoBanHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings
        self.last_banned_action_id = None

    def get_pre_ban_champions(self):
        bans = (
            self.settings.get("pre_ban_champions") or 
            self.settings.get("preBanChampions") or 
            []
        )
        if isinstance(bans, (int, str)):
            try:
                bans = [int(bans)]
            except:
                bans = []
        return [int(c) for c in bans if str(c).isdigit()]

    def check_and_act(self, session_data):
        if not self.settings.get("auto_ban_enabled", True) and not self.settings.get("autoBanEnabled", True):
            return

        local_cell_id = session_data.get("localPlayerCellId", 0)
        actions = session_data.get("actions", [])
        pre_bans = self.get_pre_ban_champions()
        
        if not pre_bans:
            return

        already_banned = set()
        bans = session_data.get("bans", {})
        for b in bans.get("myTeamBans", []) + bans.get("theirTeamBans", []):
            if isinstance(b, int) and b > 0:
                already_banned.add(b)

        target_ban_id = pre_bans[0]
        for b_id in pre_bans:
            if b_id not in already_banned:
                target_ban_id = b_id
                break

        for action_group in actions:
            for action in action_group:
                if action.get("actorCellId") == local_cell_id and action.get("type") == "ban":
                    action_id = action.get("id")
                    is_in_progress = action.get("isInProgress", False)
                    is_completed = action.get("completed", False)

                    if is_completed or self.last_banned_action_id == action_id:
                        continue

                    if is_in_progress:
                        payload = {
                            "championId": int(target_ban_id),
                            "completed": True,
                            "type": "ban"
                        }
                        
                        self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", payload)
                        time.sleep(0.08)
                        
                        complete_res = self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete")
                        if not complete_res or complete_res.status_code not in [200, 204]:
                            self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete", {})
                            self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                                "championId": int(target_ban_id),
                                "completed": True
                            })
                        
                        self.last_banned_action_id = action_id
                        break
