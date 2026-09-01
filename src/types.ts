export type Role = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

export interface Champion {
  id: number;
  key: string;
  name: string;
  title: string;
  roles: Role[];
  difficulty: number;
  icon: string;
  splash: string;
  skins: Skin[];
}

export interface Skin {
  id: number;
  num: number;
  name: string;
  chromas: boolean;
  splashUrl: string;
  uncenteredSplashUrl: string;
  tileUrl: string;
}

export interface AppSettings {
  autoAccept: boolean;
  autoAcceptDelay: number; // in seconds (0 to 5)
  autoAcceptSound: boolean;
  autoPickEnabled: boolean;
  prePickChampions: Record<Role, number[]>; // Array of champion IDs up to 5 per role
  autoLockPick: boolean;
  autoBanEnabled: boolean;
  preBanChampions: number[]; // Array of champion IDs up to 5
  selectedBackgroundSkinId: number | null;
  selectedBackgroundSkinName?: string;
  selectedBackgroundChampName?: string;
  selectedBackgroundSplashUrl?: string;
  // Rose In-Game Skin Changer (Client-side visible only to user)
  roseSkinChangerEnabled: boolean;
  roseAutoDetectChampSelect: boolean;
  roseSelectedSkins: Record<string, { skinId: number; skinNum: number; skinName: string; chromaId?: number }>;
  roseCurrentChampionKey: string;
  roseCurrentSkinId: number | null;
  roseCurrentSkinName: string;
  roseCurrentChromaId: number | null;
  // Lobby Reveal (steele123/reveal) & Advanced Dodging Engine
  lobbyRevealAutoFetch: boolean;
  lobbyRevealAutoDodgeLossStreak: boolean;
  lobbyRevealLossStreakThreshold: number;
  lobbyRevealAutoDodgeWinrate: boolean;
  lobbyRevealWinrateThreshold: number;
  // Advanced Dodging (steele123/reveal)
  dodgeMethod: 'auto' | 'multi_vector' | 'restart_ux' | 'process_kill';
  lastSecondDodgeEnabled: boolean;
  lastSecondDodgeSeconds: number;
  dodgeFallbackTimeoutMs: number;
  riotApiKey: string;
  riotRegion: string;
  lcuPort: string;
  lcuToken: string;
  lcuProtocol: string;
  lcuConnected: boolean;
  soundVolume: number;
}

export interface SummonerProfile {
  summonerId: string;
  accountId: string;
  puuid: string;
  summonerName: string;
  tagline: string;
  summonerLevel: number;
  profileIconId: number;
  profileIconUrl: string;
  backgroundSkinId: number;
  backgroundSplashUrl: string;
  rankedSolo: {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winrate: number;
    miniSeries?: string;
  };
  rankedFlex: {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winrate: number;
  };
  masteries: ChampionMastery[];
  recentMatches: MatchSummary[];
}

export interface ChampionMastery {
  championId: number;
  championName: string;
  championTitle: string;
  championLevel: number;
  championPoints: number;
  championIcon: string;
  lastPlayTime: number;
  chestGranted: boolean;
  tokensEarned: number;
}

export interface MatchSummary {
  gameId: string;
  championId: number;
  championName: string;
  championIcon: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  cs: number;
  csPerMin: string;
  gold: number;
  gameDuration: string; // e.g. "28:45"
  gameMode: string;
  role: Role;
  spells: [string, string];
  items: string[];
  timestamp: string;
  damageDealt: number;
}

export type GameflowPhase = 
  | 'None' 
  | 'Lobby' 
  | 'Matchmaking' 
  | 'ReadyCheck' 
  | 'ChampSelect' 
  | 'InProgress' 
  | 'WaitingForStats' 
  | 'PreEndOfGame' 
  | 'EndOfGame';

export interface ReadyCheckState {
  state: 'InProgress' | 'Accepted' | 'Declined' | 'EveryoneReady' | 'None';
  timer: number;
  maxTimer: number;
  playerResponse: 'None' | 'Accepted' | 'Declined';
  numAccepted: number;
  numTotal: number;
}

export interface ChampSelectSession {
  phase: 'PLANNING' | 'BAN' | 'PICK' | 'FINALIZATION';
  myRole: Role;
  myCellId: number;
  localPlayerCellId: number;
  timer: number;
  maxTimer: number;
  isMyTurnToPick: boolean;
  isMyTurnToBan: boolean;
  myPickHoveredId: number | null;
  myPickLockedId: number | null;
  myBanLockedId: number | null;
  bannedChampionIds: number[];
  pickedChampionIds: number[];
  myTeam: Array<{
    cellId: number;
    summonerName: string;
    role: Role;
    championId: number;
    spell1: string;
    spell2: string;
  }>;
  theirTeam: Array<{
    cellId: number;
    championId: number;
  }>;
}

export interface LcuLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'lcu';
  event?: string;
  message: string;
}

export interface LobbyParticipant {
  cellId: number;
  summonerId: string;
  puuid: string;
  gameName: string;
  tagLine: string;
  riotId: string; // e.g. "Betray#BR1"
  assignedRole: Role | 'FILL' | 'UNKNOWN';
  anonymousAlias: string; // e.g. "Aliado 1" or "Você"
  championId?: number;
  championName?: string;
  championIcon?: string;
  summonerLevel: number;
  profileIconId: number;
  profileIconUrl: string;
  rankedSolo: {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winrate: number;
    hotStreak?: boolean;
  };
  rankedFlex: {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    winrate: number;
  };
  topChampions: Array<{
    championId: number;
    championName: string;
    championIcon: string;
    games: number;
    winrate: number;
    kda: string;
  }>;
  recentHistory: Array<{
    win: boolean;
    championId: number;
    championName: string;
    championIcon: string;
    kills: number;
    deaths: number;
    assists: number;
    kda: string;
    role: Role;
  }>;
  streak: {
    type: 'win' | 'loss' | 'none';
    count: number;
  };
  tags: Array<{
    label: string;
    color: 'emerald' | 'rose' | 'amber' | 'cyan' | 'purple' | 'slate';
    tooltip?: string;
  }>;
  isLocalPlayer?: boolean;
}

export interface LobbyTeamAnalysis {
  averageWinrate: number;
  averageTier: string;
  winStreaksCount: number;
  lossStreaksCount: number;
  autofillsCount: number;
  safetyScore: number; // 0 - 100
  recommendation: 'FAVORAVEL' | 'EQUILIBRADA' | 'ATENCAO' | 'DODGE_RECOMENDADO';
  reasons: string[];
}

