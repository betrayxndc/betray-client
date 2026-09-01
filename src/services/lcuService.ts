import { AppSettings } from '../types';
import { generatePythonDesktopApp as generateApp, PythonDesktopFiles } from './pythonProjectFiles';

export const LCU_ENDPOINTS = {
  // Gameflow
  GAMEFLOW_PHASE: '/lol-gameflow/v1/gameflow-phase',
  GAMEFLOW_SESSION: '/lol-gameflow/v1/session',

  // Matchmaking / Ready Check
  READY_CHECK: '/lol-matchmaking/v1/ready-check',
  READY_CHECK_ACCEPT: '/lol-matchmaking/v1/ready-check/accept',
  READY_CHECK_DECLINE: '/lol-matchmaking/v1/ready-check/decline',

  // Champ Select
  CHAMP_SELECT_SESSION: '/lol-champ-select/v1/session',
  CHAMP_SELECT_HOVER: (actionId: number) => `/lol-champ-select/v1/session/actions/${actionId}`,
  CHAMP_SELECT_PICK: (actionId: number) => `/lol-champ-select/v1/session/actions/${actionId}/complete`,
  CHAMP_SELECT_BAN: (actionId: number) => `/lol-champ-select/v1/session/actions/${actionId}`,
  CHAMP_SELECT_DODGE: '/lol-login/v1/session/invoke?destination=gameService&method=quitChampSelect',
  GAMEFLOW_DODGE: '/lol-gameflow/v1/session/dodge',
  MATCHMAKING_DODGE: '/lol-matchmaking/v1/dodge',

  // Summoner & Profile
  CURRENT_SUMMONER: '/lol-summoner/v1/current-summoner',
  SUMMONER_PROFILE: (summonerId: number | string) => `/lol-summoner/v1/summoners/${summonerId}`,
  BACKGROUND_SKIN: '/lol-summoner/v1/current-summoner/background-skin',
  OWNED_CHAMPIONS: '/lol-champions/v1/owned-champions-minimal',
  RANKED_STATS: '/lol-ranked/v1/current-ranked-stats',
  CHAMPION_MASTERY: (puuid: string) => `/lol-champion-mastery/v1/${puuid}/champion-mastery`,

  // Chat & Client
  CHAT_STATUS: '/lol-chat/v1/me',
  CHAT_PARTICIPANTS_CHAMP_SELECT: '/chat/v5/participants/champ-select',
  CHAT_CONVERSATIONS: '/lol-chat/v1/conversations',
  RESTART_UX: '/riotclient/kill-and-restart-ux'
};

// Generates the complete, production-ready Python desktop project with real LCU integration
export function generatePythonDesktopApp(settings: AppSettings): PythonDesktopFiles {
  return generateApp(settings);
}
