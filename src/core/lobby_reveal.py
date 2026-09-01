import os
import sys
import json
import base64
import urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class LobbyRevealer:
    """
    Módulo Lobby Reveal (steele123/reveal)
    Identifica os participantes do Lobby / Champ Select de Solo/Duo através do chat da LCU.
    """
    def __init__(self, lcu_client, settings=None):
        self.lcu = lcu_client
        self.settings = settings if settings is not None else {}
        self.revealed_players = []

    def get_champ_select_session(self):
        res = self.lcu.get("/lol-champ-select/v1/session")
        if res and res.status_code == 200:
            return res.json()
        return None

    def get_chat_conversations(self):
        res = self.lcu.get("/lol-chat/v1/conversations")
        if res and res.status_code == 200:
            return res.json()
        return []

    def get_conversation_messages(self, conversation_id):
        res = self.lcu.get(f"/lol-chat/v1/conversations/{conversation_id}/messages")
        if res and res.status_code == 200:
            return res.json()
        return []

    def get_summoner_by_puuid(self, puuid):
        res = self.lcu.get(f"/lol-summoner/v2/summoners/puuid/{puuid}")
        if res and res.status_code == 200:
            return res.json()
        return None

    def get_ranked_stats_by_puuid(self, puuid):
        res = self.lcu.get(f"/lol-ranked/v1/ranked-stats/{puuid}")
        if res and res.status_code == 200:
            return res.json()
        return None

    def scan(self):
        return self.reveal_lobby()

    def get_participants(self):
        return self.reveal_lobby()

    def reveal_lobby(self):
        conversations = self.get_chat_conversations()
        champ_select_conv = None

        for conv in conversations:
            c_type = conv.get("type", "")
            c_id = conv.get("id", "")
            if "champion-select" in c_type or "champ-select" in c_id or "champ-select" in c_type:
                champ_select_conv = conv
                break

        revealed_players = []
        seen_puuids = set()

        if champ_select_conv:
            c_id = champ_select_conv.get("id")
            messages = self.get_conversation_messages(c_id)
            for msg in messages:
                from_id = msg.get("fromId")
                from_sum_id = msg.get("fromSummonerId")
                body = msg.get("body", "")
                
                puuid = None
                if from_id and len(str(from_id)) > 20:
                    puuid = from_id
                
                if puuid and puuid not in seen_puuids:
                    seen_puuids.add(puuid)
                    summoner = self.get_summoner_by_puuid(puuid)
                    if summoner:
                        game_name = summoner.get("gameName") or summoner.get("displayName") or "Aliado"
                        tag_line = summoner.get("tagLine") or "BR1"
                        icon_id = summoner.get("profileIconId", 29)
                        level = summoner.get("summonerLevel", 30)

                        ranked = self.get_ranked_stats_by_puuid(puuid)
                        solo_queue = None
                        if ranked and "queues" in ranked:
                            for q in ranked["queues"]:
                                if q.get("queueType") == "RANKED_SOLO_5x5":
                                    solo_queue = q
                                    break

                        tier = solo_queue.get("tier", "UNRANKED") if solo_queue else "UNRANKED"
                        division = solo_queue.get("division", "") if solo_queue else ""
                        lp = solo_queue.get("leaguePoints", 0) if solo_queue else 0
                        wins = solo_queue.get("wins", 0) if solo_queue else 0
                        losses = solo_queue.get("losses", 0) if solo_queue else 0
                        total = wins + losses
                        wr = int((wins / total) * 100) if total > 0 else 50

                        revealed_players.append({
                            "puuid": puuid,
                            "riot_id": f"{game_name}#{tag_line}",
                            "game_name": game_name,
                            "tag_line": tag_line,
                            "level": level,
                            "icon_id": icon_id,
                            "tier": tier,
                            "division": division,
                            "lp": lp,
                            "wins": wins,
                            "losses": losses,
                            "winrate": wr
                        })

        # Fallback para myTeam da sessão de Champ Select
        if not revealed_players:
            session = self.get_champ_select_session()
            if session and "myTeam" in session:
                for member in session["myTeam"]:
                    puuid = member.get("puuid")
                    if puuid and puuid not in seen_puuids:
                        seen_puuids.add(puuid)
                        summoner = self.get_summoner_by_puuid(puuid)
                        if summoner:
                            game_name = summoner.get("gameName") or summoner.get("displayName") or f"Aliado {member.get('cellId')}"
                            tag_line = summoner.get("tagLine") or "BR1"
                            icon_id = summoner.get("profileIconId", 29)
                            level = summoner.get("summonerLevel", 30)

                            ranked = self.get_ranked_stats_by_puuid(puuid)
                            solo_queue = None
                            if ranked and "queues" in ranked:
                                for q in ranked["queues"]:
                                    if q.get("queueType") == "RANKED_SOLO_5x5":
                                        solo_queue = q
                                        break

                            tier = solo_queue.get("tier", "UNRANKED") if solo_queue else "UNRANKED"
                            division = solo_queue.get("division", "") if solo_queue else ""
                            lp = solo_queue.get("leaguePoints", 0) if solo_queue else 0
                            wins = solo_queue.get("wins", 0) if solo_queue else 0
                            losses = solo_queue.get("losses", 0) if solo_queue else 0
                            total = wins + losses
                            wr = int((wins / total) * 100) if total > 0 else 50

                            revealed_players.append({
                                "puuid": puuid,
                                "riot_id": f"{game_name}#{tag_line}",
                                "game_name": game_name,
                                "tag_line": tag_line,
                                "level": level,
                                "icon_id": icon_id,
                                "tier": tier,
                                "division": division,
                                "lp": lp,
                                "wins": wins,
                                "losses": losses,
                                "winrate": wr
                            })

        self.revealed_players = revealed_players
        return {
            "success": len(revealed_players) > 0,
            "participants": revealed_players,
            "count": len(revealed_players)
        }

# Aliases de compatibilidade
LobbyRevealHandler = LobbyRevealer
