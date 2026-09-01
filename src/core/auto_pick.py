import time

class AutoPickHandler:
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings
        self.last_locked_action_id = None

    def get_assigned_role(self, session_data):
        local_cell_id = session_data.get("localPlayerCellId", 0)
        my_team = session_data.get("myTeam", [])
        for member in my_team:
            if member.get("cellId") == local_cell_id:
                assigned_pos = member.get("assignedPosition", "").upper()
                if assigned_pos in ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"]:
                    return assigned_pos
                if assigned_pos == "BOTTOM": return "ADC"
                if assigned_pos == "UTILITY": return "SUPPORT"
        return "MID"

    def get_pre_pick_champions(self, assigned_role):
        pre_picks_map = (
            self.settings.get("pre_pick_champions") or 
            self.settings.get("prePickChampions") or 
            {}
        )
        picks = []
        if isinstance(pre_picks_map, dict):
            picks = pre_picks_map.get(assigned_role, []) or pre_picks_map.get("MID", [])
        elif isinstance(pre_picks_map, list):
            picks = pre_picks_map

        if isinstance(picks, (int, str)):
            try:
                picks = [int(picks)]
            except:
                picks = []
        return [int(c) for c in picks if str(c).isdigit()]

    def is_auto_lock_enabled(self):
        return bool(
            self.settings.get("auto_lock_pick", True) and 
            self.settings.get("autoLockPick", True) and
            self.settings.get("auto_pick_enabled", True) and
            self.settings.get("autoPickEnabled", True)
        )

    def check_and_act(self, session_data):
        if not self.settings.get("auto_pick_enabled", True) and not self.settings.get("autoPickEnabled", True):
            return

        local_cell_id = session_data.get("localPlayerCellId", 0)
        actions = session_data.get("actions", [])
        assigned_role = self.get_assigned_role(session_data)
        pre_picks = self.get_pre_pick_champions(assigned_role)
        
        if not pre_picks:
            return

        banned_and_picked = set()
        bans = session_data.get("bans", {})
        for b in bans.get("myTeamBans", []) + bans.get("theirTeamBans", []):
            if isinstance(b, int) and b > 0:
                banned_and_picked.add(b)

        for team_key in ["myTeam", "theirTeam"]:
            for member in session_data.get(team_key, []):
                if member.get("cellId") != local_cell_id:
                    c_id = member.get("championId", 0)
                    if c_id > 0:
                        banned_and_picked.add(c_id)

        target_champ_id = pre_picks[0]
        for c in pre_picks:
            if c not in banned_and_picked:
                target_champ_id = c
                break

        auto_lock = self.is_auto_lock_enabled()

        for action_group in actions:
            for action in action_group:
                if action.get("actorCellId") == local_cell_id and action.get("type") == "pick":
                    action_id = action.get("id")
                    is_in_progress = action.get("isInProgress", False)
                    is_completed = action.get("completed", False)

                    if is_completed or self.last_locked_action_id == action_id:
                        continue

                    if is_in_progress:
                        payload = {
                            "championId": int(target_champ_id),
                            "completed": bool(auto_lock),
                            "type": "pick"
                        }
                        
                        self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", payload)
                        
                        if auto_lock:
                            time.sleep(0.08)
                            complete_res = self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete")
                            if not complete_res or complete_res.status_code not in [200, 204]:
                                self.lcu.post(f"/lol-champ-select/v1/session/actions/{action_id}/complete", {})
                                self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                                    "championId": int(target_champ_id),
                                    "completed": True
                                })
                            self.last_locked_action_id = action_id
                        break

                    elif not is_completed and action.get("championId") != target_champ_id:
                        self.lcu.patch(f"/lol-champ-select/v1/session/actions/{action_id}", {
                            "championId": int(target_champ_id),
                            "completed": False,
                            "type": "pick"
                        })
                        self.lcu.patch("/lol-champ-select/v1/session/my-selection", {
                            "championPickIntent": int(target_champ_id)
                        })
