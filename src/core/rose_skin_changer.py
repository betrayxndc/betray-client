import os
import json
import time

class RoseSkinChanger:
    """
    Motor completo de Skin Changer do Betray Client (Rose Engine).
    Gerencia skins personalizadas, armamento na memória, persistência em disco
    e injeção multi-vetor através da LCU (League Client Update API) durante
    a seleção de campeões e no carrossel de skins.
    """
    def __init__(self, lcu_client, settings=None):
        self.lcu = lcu_client
        self.settings = settings if settings is not None else {}
        self.active_skins = {}
        self.last_applied_skin_per_champ = {}
        self.logs = []

        # Carrega skins pré-configuradas da memória/settings
        self.reload_saved_skins()

    def reload_saved_skins(self):
        saved_skins = (
            self.settings.get("rose_selected_skins") or 
            self.settings.get("roseSelectedSkins") or 
            {}
        )
        if isinstance(saved_skins, dict):
            for key, data in saved_skins.items():
                if isinstance(data, dict) and data.get("skinId"):
                    try:
                        s_id = int(data.get("skinId"))
                        c_id = s_id // 1000
                        entry = {
                            "skin_id": s_id,
                            "chroma_id": data.get("chromaId"),
                            "skin_name": data.get("skinName", ""),
                            "skin_num": data.get("skinNum", s_id % 1000)
                        }
                        self.active_skins[c_id] = entry
                        self.active_skins[str(key).lower()] = entry
                    except Exception:
                        pass

    def is_enabled(self):
        return bool(
            self.settings.get("rose_skin_changer_enabled", True) and 
            self.settings.get("roseSkinChangerEnabled", True) and
            self.settings.get("roseChangerEnabled", True)
        )

    def toggle(self, enabled=None):
        if enabled is None:
            enabled = not self.is_enabled()
        self.settings["rose_skin_changer_enabled"] = bool(enabled)
        self.settings["roseSkinChangerEnabled"] = bool(enabled)
        self.settings["roseChangerEnabled"] = bool(enabled)
        return {
            "success": True,
            "enabled": bool(enabled),
            "message": f"Skin Changer {'ativado' if enabled else 'desativado'} com sucesso."
        }

    def set_skin(self, champ_id, skin_id, chroma_id=None, skin_name=""):
        """
        Define e arma uma skin para um campeão.
        Salva na memória, persiste no arquivo de configurações e seleciona imediatamente na LCU.
        """
        try:
            champ_id_int = int(champ_id) if str(champ_id).isdigit() else 0
            skin_id_int = int(skin_id)
            chroma_id_int = int(chroma_id) if (chroma_id is not None and str(chroma_id).isdigit()) else None
            skin_num = skin_id_int % 1000
            if champ_id_int == 0:
                champ_id_int = skin_id_int // 1000
        except Exception as e:
            return {
                "success": False,
                "message": f"IDs inválidos fornecidos: {str(e)}",
                "champ_id": champ_id,
                "skin_id": skin_id
            }

        skin_entry = {
            "skin_id": skin_id_int,
            "skin_num": skin_num,
            "chroma_id": chroma_id_int,
            "skin_name": skin_name or f"Skin #{skin_id_int}"
        }

        # Armazena na memória ativa indexado por ID numérico e por chave string
        self.active_skins[champ_id_int] = skin_entry
        self.active_skins[str(champ_id).lower()] = skin_entry

        # Persiste em settings
        if "rose_selected_skins" not in self.settings:
            self.settings["rose_selected_skins"] = {}
        if "roseSelectedSkins" not in self.settings:
            self.settings["roseSelectedSkins"] = {}

        save_dict = {
            "skinId": skin_id_int,
            "skinNum": skin_num,
            "skinName": skin_name or f"Skin #{skin_id_int}",
            "chromaId": chroma_id_int
        }
        self.settings["rose_selected_skins"][str(champ_id_int)] = save_dict
        self.settings["rose_selected_skins"][str(champ_id)] = save_dict
        self.settings["roseSelectedSkins"][str(champ_id_int)] = save_dict
        self.settings["roseSelectedSkins"][str(champ_id)] = save_dict
        self.settings["rose_current_skin_id"] = skin_id_int
        self.settings["rose_current_chroma_id"] = chroma_id_int
        self.settings["rose_current_skin_name"] = skin_name

        # Injeta e seleciona imediatamente na LCU (se cliente estiver no Champ Select ou Lobby)
        applied_now = self.apply_skin_to_lcu(champ_id_int, skin_id_int, chroma_id_int)

        return {
            "success": True,
            "message": f"Skin '{skin_name}' (ID: {skin_id_int}) salva e selecionada na roda de skins!",
            "champ_id": champ_id_int,
            "skin_id": skin_id_int,
            "chroma_id": chroma_id_int,
            "skin_name": skin_name,
            "applied_immediately": applied_now
        }

    def get_configured_skin_for_champion(self, champ_id_or_key):
        """Busca a skin configurada para um campeão através de múltiplos métodos de indexação."""
        if not champ_id_or_key:
            return None

        # 1. Busca na memória ativa
        if isinstance(champ_id_or_key, int) and champ_id_or_key in self.active_skins:
            return self.active_skins[champ_id_or_key]
        
        key_str = str(champ_id_or_key).lower()
        if key_str in self.active_skins:
            return self.active_skins[key_str]

        try:
            champ_id_int = int(champ_id_or_key)
            if champ_id_int in self.active_skins:
                return self.active_skins[champ_id_int]
        except Exception:
            champ_id_int = None

        saved_skins = (
            self.settings.get("rose_selected_skins") or 
            self.settings.get("roseSelectedSkins") or 
            {}
        )
        
        # 2. Busca direta por string nos settings
        if str(champ_id_or_key) in saved_skins:
            data = saved_skins[str(champ_id_or_key)]
            if isinstance(data, dict):
                s_id = data.get("skinId") or data.get("skin_id")
                return {
                    "skin_id": int(s_id) if s_id else 0,
                    "skin_num": data.get("skinNum", 0) if data.get("skinNum") is not None else data.get("skin_num", 0),
                    "chroma_id": data.get("chromaId") if data.get("chromaId") is not None else data.get("chroma_id"),
                    "skin_name": data.get("skinName") or data.get("skin_name", "")
                }

        # 3. Busca iterativa por cálculo de ID
        if champ_id_int is not None:
            for key, data in saved_skins.items():
                if isinstance(data, dict):
                    s_id = data.get("skinId") or data.get("skin_id")
                    if s_id is not None:
                        try:
                            if (int(s_id) // 1000) == champ_id_int:
                                return {
                                    "skin_id": int(s_id),
                                    "skin_num": data.get("skinNum", 0) if data.get("skinNum") is not None else data.get("skin_num", 0),
                                    "chroma_id": data.get("chromaId") if data.get("chromaId") is not None else data.get("chroma_id"),
                                    "skin_name": data.get("skinName") or data.get("skin_name", "")
                                }
                        except Exception:
                            pass

        return None

    def get_all_skins(self):
        """Retorna todas as skins salvas na memória."""
        return {
            "success": True,
            "skins": self.active_skins,
            "count": len(self.active_skins)
        }

    def remove_skin(self, champ_id_or_key):
        """Remove a skin personalizada de um campeão e restaura a skin clássica."""
        champ_id_int = int(champ_id_or_key) if str(champ_id_or_key).isdigit() else None
        
        if champ_id_int is not None and champ_id_int in self.active_skins:
            del self.active_skins[champ_id_int]
        if str(champ_id_or_key).lower() in self.active_skins:
            del self.active_skins[str(champ_id_or_key).lower()]

        for key in ["rose_selected_skins", "roseSelectedSkins"]:
            if key in self.settings:
                if str(champ_id_or_key) in self.settings[key]:
                    del self.settings[key][str(champ_id_or_key)]
                if champ_id_int is not None and str(champ_id_int) in self.settings[key]:
                    del self.settings[key][str(champ_id_int)]

        if champ_id_int:
            default_skin_id = champ_id_int * 1000
            self.apply_skin_to_lcu(champ_id_int, default_skin_id, None)

        return {
            "success": True,
            "message": f"Skin personalizada removida para {champ_id_or_key}. Padrão restaurado.",
            "champ_id": champ_id_or_key
        }

    def clear_all_skins(self):
        """Limpa todas as configurações de skins."""
        self.active_skins.clear()
        self.settings["rose_selected_skins"] = {}
        self.settings["roseSelectedSkins"] = {}
        self.settings["rose_current_skin_id"] = None
        self.settings["rose_current_chroma_id"] = None
        return {
            "success": True,
            "message": "Todas as skins salvas foram redefinidas com sucesso."
        }

    def apply_skin_to_lcu(self, champ_id, skin_id, chroma_id=None):
        """
        Dispara a seleção da skin na roda de skins / Champ Select através de múltiplos vetores da LCU:
        1. /lol-champ-select/v1/session/my-selection (PATCH - Seleciona no carrossel do jogador)
        2. /lol-champ-select/v1/skin-carousel/skins/{target_skin_id}/select (POST direto no carrossel)
        3. /lol-champ-select/v1/current-champion (PATCH)
        4. /lol-champ-select/v1/skin-selector (PATCH)
        5. /lol-loadouts/v4/loadouts/scope/inventory (PUT/PATCH com CHAMPION_SKIN)
        6. /lol-cosmetics/v1/selection/skin (PATCH)
        """
        target_skin_id = int(chroma_id) if chroma_id else int(skin_id)
        try:
            champ_id = int(champ_id)
        except Exception:
            champ_id = target_skin_id // 1000

        success = False

        # Vetor 1: Seleção em tempo real de Champ Select (/lol-champ-select/v1/session/my-selection)
        try:
            res1 = self.lcu.patch("/lol-champ-select/v1/session/my-selection", {
                "selectedSkinId": target_skin_id
            })
            if res1 and res1.status_code in [200, 204]:
                success = True
        except Exception:
            pass

        # Vetor 2: Skin Carousel Direto (/lol-champ-select/v1/skin-carousel/skins/{id}/select)
        try:
            res2 = self.lcu.post(f"/lol-champ-select/v1/skin-carousel/skins/{target_skin_id}/select", {})
            if res2 and res2.status_code in [200, 204]:
                success = True
            if chroma_id:
                self.lcu.post(f"/lol-champ-select/v1/skin-carousel/skins/{skin_id}/chromas/{chroma_id}/select", {})
        except Exception:
            pass

        # Vetor 3: Current Champion Selection
        try:
            res3 = self.lcu.patch("/lol-champ-select/v1/current-champion", {
                "championId": champ_id,
                "selectedSkinId": target_skin_id
            })
            if res3 and res3.status_code in [200, 204]:
                success = True
        except Exception:
            pass

        # Vetor 4: Skin Selector endpoint
        try:
            res4 = self.lcu.patch("/lol-champ-select/v1/skin-selector", {
                "selectedSkinId": target_skin_id
            })
            if res4 and res4.status_code in [200, 204]:
                success = True
        except Exception:
            pass

        # Vetor 5: Loadouts V4 (persiste cosméticos no inventário do cliente)
        try:
            loadout_res = self.lcu.get("/lol-loadouts/v4/loadouts/scope/inventory")
            if loadout_res and loadout_res.status_code == 200:
                loadouts = loadout_res.json()
                if isinstance(loadouts, list) and len(loadouts) > 0:
                    loadout_id = loadouts[0].get("id")
                    if loadout_id:
                        payload = {
                            "loadout": {
                                "CHAMPION_SKIN": {
                                    "itemId": target_skin_id,
                                    "inventoryType": "CHAMPION_SKIN"
                                }
                            }
                        }
                        self.lcu.put(f"/lol-loadouts/v4/loadouts/{loadout_id}", payload)
                        self.lcu.patch(f"/lol-loadouts/v4/loadouts/{loadout_id}", payload)
                        success = True
        except Exception:
            pass

        # Vetor 6: Cosmetics Selection
        try:
            res6 = self.lcu.patch("/lol-cosmetics/v1/selection/skin", {
                "skinId": target_skin_id
            })
            if res6 and res6.status_code in [200, 204]:
                success = True
        except Exception:
            pass

        self.last_applied_skin_per_champ[champ_id] = target_skin_id
        return success

    def tick(self, settings=None, session_data=None):
        if settings is not None:
            self.settings = settings
        if session_data is None:
            session_data = self.lcu.get_champ_select_session()
        if session_data:
            self.check_and_apply_champ_select(session_data)

    def check_and_apply_champ_select(self, session_data):
        """
        Monitora a sessão do Champ Select em tempo real:
        Identifica o campeão escolhido pelo jogador local e automaticamente
        seleciona a skin pré-configurada na roda de skins.
        """
        if not self.is_enabled():
            return False

        local_cell_id = session_data.get("localPlayerCellId", 0)
        my_team = session_data.get("myTeam", [])
        
        my_player = next((m for m in my_team if m.get("cellId") == local_cell_id), None)
        if not my_player:
            return False

        # Campeão travado ou intencionado
        champ_id = my_player.get("championId") or my_player.get("championPickIntent") or 0
        
        # Se não achou em myTeam, inspeciona as ações da sessão
        if champ_id <= 0:
            actions = session_data.get("actions", [])
            for action_group in actions:
                for action in action_group:
                    if action.get("actorCellId") == local_cell_id and action.get("type") == "pick":
                        c_id = action.get("championId", 0)
                        if c_id > 0:
                            champ_id = c_id
                            break
                if champ_id > 0:
                    break

        if not champ_id or champ_id <= 0:
            return False

        champ_id = int(champ_id)
        configured_skin = self.get_configured_skin_for_champion(champ_id)
        if not configured_skin:
            return False

        skin_id = configured_skin.get("skin_id")
        chroma_id = configured_skin.get("chroma_id")
        target_skin_id = int(chroma_id) if chroma_id else int(skin_id)

        timer = session_data.get("timer", {})
        phase = timer.get("phase", "")
        current_selected = my_player.get("selectedSkinId", 0)

        # Na fase FINALIZATION (roda de skins ativa) ou se a skin atual no cliente for diferente:
        is_finalization = (phase == "FINALIZATION")
        needs_apply = (current_selected != target_skin_id) or (self.last_applied_skin_per_champ.get(champ_id) != target_skin_id)

        if needs_apply or is_finalization:
            applied = self.apply_skin_to_lcu(champ_id, skin_id, chroma_id)
            self.last_applied_skin_per_champ[champ_id] = target_skin_id
            if is_finalization:
                self.last_applied_skin_per_champ[f"{champ_id}_fin"] = target_skin_id
            return applied

        return True

    def fetch_lcu_champion_skins(self, champ_id):
        champ_id = int(champ_id)
        res = self.lcu.get(f"/lol-game-data/assets/v1/champions/{champ_id}.json")
        if res and res.status_code == 200:
            data = res.json()
            return {
                "success": True,
                "skins": data.get("skins", []),
                "name": data.get("name", "")
            }
        return {"success": False, "skins": []}

    def check_and_apply_in_game(self):
        if not self.is_enabled():
            return
        
        for champ_id, skin_data in self.active_skins.items():
            if isinstance(champ_id, int):
                self.apply_skin_to_lcu(champ_id, skin_data.get("skin_id"), skin_data.get("chroma_id"))

