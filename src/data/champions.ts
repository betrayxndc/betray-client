import { Champion, Role, Skin } from '../types';
import { ALL_RAW_CHAMPIONS, buildSkins, DDRAGON_BASE, DDRAGON_IMG, DDRAGON_VERSION } from './rawChampions';

export { DDRAGON_BASE, DDRAGON_IMG, DDRAGON_VERSION };

export const CHAMPIONS_LIST: Champion[] = ALL_RAW_CHAMPIONS.map(champ => ({
  id: champ.id,
  key: champ.key,
  name: champ.name,
  title: champ.title,
  roles: champ.roles,
  difficulty: champ.difficulty,
  icon: `${DDRAGON_BASE}/img/champion/${champ.key}.png`,
  splash: `${DDRAGON_IMG}/champion/splash/${champ.key}_0.jpg`,
  skins: buildSkins(champ.key, champ.name, champ.skins)
}));

export const CHAMPIONS = CHAMPIONS_LIST;

export function getChampionById(id: number): Champion | undefined {
  return CHAMPIONS_LIST.find(c => c.id === id);
}

export function getChampionByKey(key: string): Champion | undefined {
  return CHAMPIONS_LIST.find(c => 
    c.key.toLowerCase() === key.toLowerCase() || 
    c.name.toLowerCase() === key.toLowerCase()
  );
}

export const ROLE_LABELS: Record<Role, { name: string; short: string; color: string; bg: string }> = {
  TOP: { name: 'Topo (Top)', short: 'TOP', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  JUNGLE: { name: 'Selva (Jungle)', short: 'JNG', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  MID: { name: 'Meio (Mid)', short: 'MID', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  ADC: { name: 'Atirador (Bot/ADC)', short: 'ADC', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  SUPPORT: { name: 'Suporte (Sup)', short: 'SUP', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' }
};
