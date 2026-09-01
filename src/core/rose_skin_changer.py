import os
import json
import time

class RoseSkinChanger:
    """
    Motor completo de Skin Changer do Betray Client.
    Gerencia skins personalizadas, armamento na memória, persistência em disco
    e injeção multi-vetor através da LCU (League Client Update API).
    """
    def __init__(self, lcu_client, settings):
        self.lcu = lcu_client
        self.settings = settings
        self.active_skins = {}
        self.last_applied_skin_per_champ = {}

        # Carrega skins pré-configuradas do arquivo settings.json
        saved_skins = (
            self.settings.get("rose_selected_skins") or 
            self.settings.get("roseSelectedSkins") or 
            {}
        )
        for key, data in saved_skins.items():
            if isinstance(data, dict) and data.get("skinId"):
                try:
                    c_id = int(data.get("skinId")) // 1000
                    self.active_skins[c_id] = {
                        "skin_id": int(data.get("skinId")),
                        "chroma_id": data.get("chromaId"),
                        "skin_name": data.get("skinName", ""),
                        "skin_num": data.get("skinNum", 0)
                    }
                except Exception:
                    pass

    def is_enabled(self):
        return bool(
            self.settings.get("rose_skin_changer_enabled", True) and 
            self.settings.get("roseSkinChangerEnabled", True)
        )

    def toggle(self, enabled=None):
        if enabled is None:
            enabled = not self.is_enabled()
        self.settings["rose_skin_changer_enabled"] = bool(enabled)
        self.settings["roseSkinChangerEnabled"] = bool(enabled)
        return {
            "success": True,
            "enabled": bool(enabled),
            "message": f"Skin Changer {'ativado' if enabled else 'desativado'} com sucesso."
        }

    def set_skin(self, champ_id, skin_id, chroma_id=None, skin_name=""):
        """
        Define e arma uma skin para um campeão.
        Salva na memória, persiste no arquivo de configurações e tenta aplicar imediatamente na LCU.
        """
        try:
            champ_id = int(champ_id)
            skin_id = int(skin_id)
            chroma_id = int(chroma_id) if (chroma_id is not None and str(chroma_id).isdigit()) else None
            skin_num = skin_id % 1000
        except Exception as e:
            return {
                "success": False,
                "message": f"IDs inválidos fornecidos: {str(e)}",
                "champ_id": champ_id,
                "skin_id": skin_id
            }

        skin_entry = {
            "skin_id": skin_id,
            "skin_num": skin_num,
            "chroma_id": chroma_id,
            "skin_name": skin_name or f"Skin #{skin_id}"
        }

        # Armazena na memória ativa
        self.active_skins[champ_id] = skin_entry

        # Persiste em settings
        if "rose_selected_skins" not in self.settings:
            self.settings["rose_selected_skins"] = {}
        if "roseSelectedSkins" not in self.settings:
            self.settings["roseSelectedSkins"] = {}

        save_dict = {
            "skinId": skin_id,
            "skinNum": skin_num,
            "skinName": skin_name or f"Skin #{skin_id}",
            "chromaId": chroma_id
        }
        self.settings["rose_selected_skins"][str(champ_id)] = save_dict
        self.settings["roseSelectedSkins"][str(champ_id)] = save_dict
        self.settings["rose_current_skin_id"] = skin_id
        self.settings["rose_current_chroma_id"] = chroma_id
        self.settings["rose_current_skin_name"] = skin_name

        # Injeta imediatamente na LCU caso o cliente esteja conectado
        applied_now = self.apply_skin_to_lcu(champ_id, skin_id, chroma_id)

        return {
            "success": True,
            "message": f"Skin '{skin_name}' (ID: {skin_id}) selecionada e armada com sucesso!",
            "champ_id": champ_id,
            "skin_id": skin_id,
            "chroma_id": chroma_id,
            "skin_name": skin_name,
            "applied_immediately": applied_now
        }

    def get_configured_skin_for_champion(self, champ_id):
        """Busca a skin configurada para um campeão."""
        champ_id = int(champ_id)
        if champ_id in self.active_skins:
            return self.active_skins[champ_id]

        saved_skins = (
            self.settings.get("rose_selected_skins") or 
            self.settings.get("roseSelectedSkins") or 
            {}
        )
        if str(champ_id) in saved_skins:
            data = saved_skins[str(champ_id)]
            return {
                "skin_id": data.get("skinId"),
                "skin_num": data.get("skinNum", 0),
                "chroma_id": data.get("chromaId"),
                "skin_name": data.get("skinName", "")
            }

        curr_skin_id = self.settings.get("rose_current_skin_id") or self.settings.get("roseCurrentSkinId")
        if curr_skin_id and (int(curr_skin_id) // 1000) == champ_id:
            return {
                "skin_id": int(curr_skin_id),
                "skin_num": int(curr_skin_id) % 1000,
                "chroma_id": self.settings.get("rose_current_chroma_id") or self.settings.get("roseCurrentChromaId"),
                "skin_name": self.settings.get("rose_current_skin_name", "")
            }

        return None

    def get_all_skins(self):
        """Retorna todas as skins salvas na memória."""
        return {
            "success": True,
            "skins": self.active_skins,
            "count": len(self.active_skins)
        }

    def remove_skin(self, champ_id):
        """Remove a skin personalizada de um campeão e restaura a skin clássica."""
        champ_id = int(champ_id)
        if champ_id in self.active_skins:
            del self.active_skins[champ_id]

        if "rose_selected_skins" in self.settings and str(champ_id) in self.settings["rose_selected_skins"]:
            del self.settings["rose_selected_skins"][str(champ_id)]
        if "roseSelectedSkins" in self.settings and str(champ_id) in self.settings["roseSelectedSkins"]:
            del self.settings["roseSelectedSkins"][str(champ_id)]

        # Aplica skin padrão na LCU
        default_skin_id = champ_id * 1000
        self.apply_skin_to_lcu(champ_id, default_skin_id, None)

        return {
            "success": True,
            "message": f"Skin personalizada removida para o campeão ID {champ_id}. Padrão restaurado.",
            "champ_id": champ_id
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
        Dispara a injeção da skin através de múltiplos vetores da API oficial da LCU:
        1. /lol-champ-select/v1/session/my-selection (PATCH - Seleção oficial do carrossel de skins)
        2. /lol-champ-select/v1/current-champion (PATCH)
        3. /lol-champ-select/v1/skin-carousel/skins/{id}/select (POST direto no carrossel)
        4. /lol-champ-select/v1/skin-selector (PATCH)
        5. /lol-loadouts/v4/loadouts/scope/inventory (PUT/PATCH com CHAMPION_SKIN)
        6. /lol-cosmetics/v1/selection/skin (PATCH)
        """
        target_skin_id = int(chroma_id) if chroma_id else int(skin_id)
        champ_id = int(champ_id)
        success = False

        # Vetor 1: Seleção em tempo real de Champ Select (Skin Carousel)
        try:
            res1 = self.lcu.patch("/lol-champ-select/v1/session/my-selection", {
                "selectedSkinId": target_skin_id
            })
            if res1 and res1.status_code in [200, 204]:
                success = True
        except Exception:
            pass

        # Vetor 2: Current Champion Selection
        try:
            res2 = self.lcu.patch("/lol-champ-select/v1/current-champion", {
                "championId": champ_id,
                "selectedSkinId": target_skin_id
            })
            if res2 and res2.status_code in [200, 204]:
                success = True
        except Exception:
            pass

        # Vetor 3: Skin Carousel Direto
        try:
            self.lcu.post(f"/lol-champ-select/v1/skin-carousel/skins/{target_skin_id}/select", {})
            if chroma_id:
                self.lcu.post(f"/lol-champ-select/v1/skin-carousel/skins/{skin_id}/chromas/{chroma_id}/select", {})
        except Exception:
            pass

        # Vetor 4: Skin Selector endpoint
        try:
            self.lcu.patch("/lol-champ-select/v1/skin-selector", {
                "selectedSkinId": target_skin_id
            })
        except Exception:
            pass

        # Vetor 5: Loadouts V4 (persiste cosméticos do inventário do cliente)
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
            self.lcu.patch("/lol-cosmetics/v1/selection/skin", {
                "skinId": target_skin_id
            })
        except Exception:
            pass

        self.last_applied_skin_per_champ[champ_id] = target_skin_id
        return success

    def check_and_apply_champ_select(self, session_data):
        """
        Monitor de Champ Select: Detecta quando um campeão foi escolhido, hovered ou bloqueado,
        identifica a fase (incluindo FINALIZATION / Seleção de Skins) e garante a seleção
        automática da skin e chroma configurados no Betray Client.
        """
        if not self.is_enabled():
            return False

        local_cell_id = session_data.get("localPlayerCellId", 0)
        my_team = session_data.get("myTeam", [])
        
        my_player = next((m for m in my_team if m.get("cellId") == local_cell_id), None)
        if not my_player:
            return False

        # Campeão travado ou intencionado
        champ_id = my_player.get("championId") or my_player.get("championPickIntent")
        if not champ_id or champ_id <= 0:
            return False

        champ_id = int(champ_id)
        configured_skin = self.get_configured_skin_for_champion(champ_id)
        if not configured_skin:
            return False

        skin_id = configured_skin.get("skin_id")
        chroma_id = configured_skin.get("chroma_id")
        skin_name = configured_skin.get("skin_name", f"Skin #{skin_id}")
        target_skin_id = int(chroma_id) if chroma_id else int(skin_id)

        timer = session_data.get("timer", {})
        phase = timer.get("phase", "")
        current_selected = my_player.get("selectedSkinId", 0)

        # Na fase FINALIZATION (carrossel de skins) ou se a skin atual no cliente for diferente da configurada:
        is_finalization = (phase == "FINALIZATION")
        needs_apply = (current_selected != target_skin_id) or (self.last_applied_skin_per_champ.get(champ_id) != target_skin_id)

        if needs_apply or (is_finalization and self.last_applied_skin_per_champ.get(f"{champ_id}_fin") != target_skin_id):
            applied = self.apply_skin_to_lcu(champ_id, skin_id, chroma_id)
            if is_finalization:
                self.last_applied_skin_per_champ[f"{champ_id}_fin"] = target_skin_id
            return applied

        return True

    def fetch_lcu_champion_skins(self, champ_id):
        """Busca catálogo de skins direto da API interna da LCU."""
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
        """Garante aplicação da skin na inicialização de partida."""
        if not self.is_enabled():
            return
        for champ_id, skin_data in self.active_skins.items():
            self.apply_skin_to_lcu(champ_id, skin_data.get("skin_id"), skin_data.get("chroma_id"))
