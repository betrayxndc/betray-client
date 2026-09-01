import { SummonerProfile } from '../types';
import { CHAMPIONS_LIST } from './champions';

export const INITIAL_MOCK_PROFILE: SummonerProfile = {
  summonerId: '0',
  accountId: '0',
  puuid: '',
  summonerName: 'Invocador',
  tagline: 'BR1',
  summonerLevel: 1,
  profileIconId: 29, // Poro icon
  profileIconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png',
  backgroundSkinId: 0,
  backgroundSplashUrl: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg',
  rankedSolo: {
    tier: 'UNRANKED',
    rank: '',
    leaguePoints: 0,
    wins: 0,
    losses: 0,
    winrate: 0
  },
  rankedFlex: {
    tier: 'UNRANKED',
    rank: '',
    leaguePoints: 0,
    wins: 0,
    losses: 0,
    winrate: 0
  },
  masteries: [],
  recentMatches: []
};

export const RANK_EMBLEMS: Record<string, { label: string; color: string; border: string; bg: string; icon: string }> = {
  UNRANKED: { label: 'Sem Ranque (Unranked)', color: 'text-slate-400', border: 'border-slate-700', bg: 'from-slate-950 to-stone-900', icon: '🛡️' },
  NONE: { label: 'Sem Ranque (Unranked)', color: 'text-slate-400', border: 'border-slate-700', bg: 'from-slate-950 to-stone-900', icon: '🛡️' },
  IRON: { label: 'Ferro', color: 'text-stone-400', border: 'border-stone-500', bg: 'from-stone-900 to-stone-800', icon: '🛡️' },
  BRONZE: { label: 'Bronze', color: 'text-amber-700', border: 'border-amber-700', bg: 'from-amber-950 to-stone-900', icon: '🥉' },
  SILVER: { label: 'Prata', color: 'text-slate-300', border: 'border-slate-400', bg: 'from-slate-800 to-stone-900', icon: '🥈' },
  GOLD: { label: 'Ouro', color: 'text-amber-400', border: 'border-amber-500', bg: 'from-amber-900/60 to-stone-900', icon: '🥇' },
  PLATINUM: { label: 'Platina', color: 'text-emerald-400', border: 'border-emerald-500', bg: 'from-emerald-950 to-stone-900', icon: '💎' },
  EMERALD: { label: 'Esmeralda', color: 'text-green-400', border: 'border-green-500', bg: 'from-green-950 to-stone-900', icon: '✨' },
  DIAMOND: { label: 'Diamante', color: 'text-cyan-400', border: 'border-cyan-500', bg: 'from-cyan-950 to-stone-900', icon: '🔷' },
  MASTER: { label: 'Mestre', color: 'text-purple-400', border: 'border-purple-500', bg: 'from-purple-950 to-stone-900', icon: '👑' },
  GRANDMASTER: { label: 'Grão-Mestre', color: 'text-rose-500', border: 'border-rose-500', bg: 'from-rose-950 to-stone-900', icon: '🔥' },
  CHALLENGER: { label: 'Desafiante', color: 'text-yellow-300', border: 'border-yellow-400', bg: 'from-yellow-950 to-stone-900', icon: '🏆' }
};
