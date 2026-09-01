import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Trophy, 
  Award, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles,
  Link,
  Flame,
  CheckCircle2,
  LogOut,
  Zap,
  Activity,
  Layers,
  Clock
} from 'lucide-react';
import { AppSettings, SummonerProfile, LcuLog } from '../types';
import { RANK_EMBLEMS } from '../data/mockProfile';
import { CHAMPIONS_LIST } from '../data/champions';
import { soundManager } from '../utils/audio';

interface ProfileTabProps {
  profile: SummonerProfile;
  setProfile: React.Dispatch<React.SetStateAction<SummonerProfile>>;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
  onDodge?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  setProfile,
  settings,
  updateSettings,
  addLog,
  onDodge
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString());

  const soloTier = RANK_EMBLEMS[profile.rankedSolo.tier?.toUpperCase()] || RANK_EMBLEMS['UNRANKED'];
  const flexTier = RANK_EMBLEMS[profile.rankedFlex.tier?.toUpperCase()] || RANK_EMBLEMS['UNRANKED'];

  // Automatic identification function from LCU or PyWebView API
  const handleFetchFromLcu = useCallback((isAuto: boolean = false) => {
    if (!isAuto) {
      soundManager.playClick(settings.soundVolume);
    }
    setIsUpdating(true);

    if (typeof window !== 'undefined' && (window as any).pywebview && (window as any).pywebview.api) {
      (window as any).pywebview.api.get_current_summoner_profile().then((res: any) => {
        setIsUpdating(false);
        setLastSyncedTime(new Date().toLocaleTimeString());
        if (res && res.success && res.summoner) {
          const s = res.summoner;
          const soloQueue = res.ranked?.queues?.find((q: any) => q.queueType === 'RANKED_SOLO_5x5');
          const flexQueue = res.ranked?.queues?.find((q: any) => q.queueType === 'RANKED_FLEX_SR');

          const finalName = s.gameName || s.displayName || s.name || (s.formattedRiotId ? s.formattedRiotId.split('#')[0] : '') || 'Invocador';
          const finalTag = s.tagLine || s.tagline || (s.formattedRiotId ? s.formattedRiotId.split('#')[1] : '') || 'BR1';

          setProfile(prev => {
            let realMasteries = prev.masteries;
            if (Array.isArray(res.masteries) && res.masteries.length > 0) {
              realMasteries = res.masteries.slice(0, 6).map((m: any) => {
                const champ = CHAMPIONS_LIST.find(c => c.id === m.championId);
                const name = champ ? champ.name : `Campeão #${m.championId}`;
                const icon = champ ? champ.icon : `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Aatrox.png`;
                return {
                  championId: m.championId,
                  championName: name,
                  championTitle: champ?.title || '',
                  championLevel: m.championLevel || 1,
                  championPoints: m.championPoints || 0,
                  championIcon: icon,
                  lastPlayTime: m.lastPlayTime || Date.now(),
                  chestGranted: !!m.chestGranted,
                  tokensEarned: m.tokensEarned || 0
                };
              });
            }

            const rankedSolo = soloQueue && soloQueue.tier ? {
              tier: soloQueue.tier,
              rank: soloQueue.division || 'I',
              leaguePoints: soloQueue.leaguePoints || 0,
              wins: soloQueue.wins || 0,
              losses: soloQueue.losses || 0,
              winrate: Math.round(((soloQueue.wins || 0) / Math.max(1, (soloQueue.wins || 0) + (soloQueue.losses || 0))) * 100)
            } : {
              tier: 'UNRANKED',
              rank: '',
              leaguePoints: 0,
              wins: 0,
              losses: 0,
              winrate: 0
            };

            const rankedFlex = flexQueue && flexQueue.tier ? {
              tier: flexQueue.tier,
              rank: flexQueue.division || 'I',
              leaguePoints: flexQueue.leaguePoints || 0,
              wins: flexQueue.wins || 0,
              losses: flexQueue.losses || 0,
              winrate: Math.round(((flexQueue.wins || 0) / Math.max(1, (flexQueue.wins || 0) + (flexQueue.losses || 0))) * 100)
            } : {
              tier: 'UNRANKED',
              rank: '',
              leaguePoints: 0,
              wins: 0,
              losses: 0,
              winrate: 0
            };

            return {
              ...prev,
              summonerId: String(s.summonerId || prev.summonerId),
              accountId: String(s.accountId || prev.accountId),
              puuid: s.puuid || prev.puuid,
              summonerName: finalName,
              tagline: finalTag,
              summonerLevel: s.summonerLevel || prev.summonerLevel,
              profileIconId: s.profileIconId || prev.profileIconId,
              profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${s.profileIconId || 29}.png`,
              rankedSolo,
              rankedFlex,
              masteries: realMasteries
            };
          });

          addLog('success', `[AUTO-IDENTIFY] Invocador identificado com sucesso: ${finalName}#${finalTag} (Nível ${s.summonerLevel || 1})`);
        } else {
          if (!isAuto) {
            addLog('warning', 'League of Legends não detectado ou fechado na máquina.');
          }
        }
      }).catch(() => {
        setIsUpdating(false);
      });
    } else {
      setTimeout(() => {
        setIsUpdating(false);
        setLastSyncedTime(new Date().toLocaleTimeString());
        if (!isAuto) {
          addLog('success', `[AUTO-IDENTIFY] Invocador ativo verificado: ${profile.summonerName}#${profile.tagline}`);
        }
      }, 400);
    }
  }, [settings.soundVolume, setProfile, addLog, profile.summonerName, profile.tagline]);

  // Run auto identification immediately on component mount and every 6 seconds
  useEffect(() => {
    handleFetchFromLcu(true);
    const interval = setInterval(() => {
      handleFetchFromLcu(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [handleFetchFromLcu]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Banner with Real Summoner Profile Hero Card */}
      <div 
        className="bento-card relative overflow-hidden p-5 sm:p-6 bg-cover bg-center border border-rose-950/80 shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(5,6,8,0.96) 25%, rgba(18,22,30,0.88) 65%, rgba(5,6,8,0.94) 100%), url(${profile.backgroundSplashUrl})`
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
          
          {/* Left: Avatar, Name, Level & Tagline */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            
            {/* Profile Icon with Level Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.45)] bg-[#010a13]">
                <img 
                  src={profile.profileIconUrl} 
                  alt={profile.summonerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1.5 inset-x-0 mx-auto w-fit px-2.5 py-0.2 rounded-full bg-[#010a13] border border-rose-500 text-[10px] font-bold text-rose-300 font-rajdhani shadow">
                NV. {profile.summonerLevel}
              </div>
            </div>

            {/* Name & Region */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-[#f8fafc] tracking-wider">
                  {profile.summonerName}
                </h2>
                <span className="text-xs font-bold text-rose-400 font-mono bg-[#010a13] px-2 py-0.5 rounded border border-rose-800/40">
                  #{profile.tagline}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-300 font-rajdhani">
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CONTA IDENTIFICADA AUTOMATICAMENTE
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Último Sync: {lastSyncedTime}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 font-bold font-rajdhani">
                  REGIÃO: {settings.riotRegion}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50 font-bold font-mono">
                  ID: {profile.summonerId}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Ranked Tier Emblems & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 bg-[#010a13]/90 p-3.5 rounded-lg border border-rose-900/40 backdrop-blur-md shadow-lg">
              {/* Solo / Duo Card */}
              <div className="text-center px-3 border-r border-rose-950/60 space-y-0.5 min-w-[110px]">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Ranqueada Solo/Duo</div>
                <div className="text-xl">{soloTier.icon}</div>
                <div className={`font-cinzel text-xs font-black ${soloTier.color}`}>
                  {soloTier.label} {profile.rankedSolo.rank}
                </div>
                <div className="text-[11px] font-bold text-[#f0e6d2] font-mono">{profile.rankedSolo.leaguePoints} LP</div>
                <div className="text-[9px] text-emerald-400 font-mono font-semibold">{profile.rankedSolo.winrate}% WR</div>
              </div>

              {/* Flex 5v5 Card */}
              <div className="text-center px-3 space-y-0.5 min-w-[110px]">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Ranqueada Flex</div>
                <div className="text-xl">{flexTier.icon}</div>
                <div className={`font-cinzel text-xs font-black ${flexTier.color}`}>
                  {flexTier.label} {profile.rankedFlex.rank}
                </div>
                <div className="text-[11px] font-bold text-[#f0e6d2] font-mono">{profile.rankedFlex.leaguePoints} LP</div>
                <div className="text-[9px] text-cyan-400 font-mono font-semibold">{profile.rankedFlex.winrate}% WR</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                id="refresh-summoner-btn"
                onClick={() => handleFetchFromLcu(false)}
                disabled={isUpdating}
                className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] disabled:opacity-50 transition-all"
                title="Buscar Invocador Logado no LoL"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>Auto-Reconhecer</span>
              </button>

              {onDodge && (
                <button
                  id="profile-dodge-btn"
                  onClick={onDodge}
                  className="px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                  title="Sair da Seleção de Campeões e retornar ao Lobby"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Dodge (Lobby)</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Auto-Identification Status & Account Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Reconhecimento Automático */}
        <div className="bento-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-950/60 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                Status da Identificação LCU
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
              ATIVO (100% AUTOMÁTICO)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            O Betray Client monitora a porta local do League of Legends e identifica automaticamente a conta logada sem necessitar digitar usuário ou senha.
          </p>

          <div className="p-3 rounded bg-[#07090e] border border-rose-950/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">Invocador:</span>
              <span className="text-white font-bold">{profile.summonerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">Tagline:</span>
              <span className="text-rose-400 font-bold font-mono">#{profile.tagline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">Nível LCU:</span>
              <span className="text-amber-400 font-bold font-mono">{profile.summonerLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-mono">Ícone ID:</span>
              <span className="text-slate-300 font-mono">{profile.profileIconId}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ranqueada Solo/Duo Detalhada */}
        <div className="bento-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-950/60 pb-2.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                Solo / Duo Estatísticas
              </h3>
            </div>
            <span className={`text-[10px] font-bold font-cinzel ${soloTier.color}`}>
              {profile.rankedSolo.tier} {profile.rankedSolo.rank}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-[#07090e] border border-rose-950/60">
              <div className="text-[10px] text-slate-400 font-bold">PONTOS (LP)</div>
              <div className="text-sm font-bold font-mono text-amber-300">{profile.rankedSolo.leaguePoints}</div>
            </div>
            <div className="p-2 rounded bg-[#07090e] border border-rose-950/60">
              <div className="text-[10px] text-slate-400 font-bold">VITÓRIAS</div>
              <div className="text-sm font-bold font-mono text-emerald-400">{profile.rankedSolo.wins}W</div>
            </div>
            <div className="p-2 rounded bg-[#07090e] border border-rose-950/60">
              <div className="text-[10px] text-slate-400 font-bold">DERROTAS</div>
              <div className="text-sm font-bold font-mono text-rose-400">{profile.rankedSolo.losses}L</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-mono">Taxa de Vitória:</span>
              <span className="text-emerald-400 font-bold font-mono">{profile.rankedSolo.winrate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                style={{ width: `${profile.rankedSolo.winrate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Dodge e Controle de Sessão */}
        <div className="bento-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-950/60 pb-2.5">
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-400" />
              <h3 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                Controle de Sessão & Dodge
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
              LCU COMMAND
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Permite abandonar a seleção de campeões de forma limpa e segura via endpoint oficial da LCU, retornando instantaneamente ao Lobby sem fechar o LoL.
          </p>

          <button
            id="btn-dodge-card-action"
            onClick={onDodge}
            className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Executar Dodge (Voltar ao Lobby)</span>
          </button>
        </div>

      </div>

      {/* Top Champion Masteries */}
      <div className="bento-card p-5">
        <div className="flex items-center justify-between border-b border-rose-950/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
              Maestrias de Campeões (Conta Identificada)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Top 3 Campeões
          </span>
        </div>

        {profile.masteries && profile.masteries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {profile.masteries.slice(0, 3).map((m, idx) => (
              <div key={m.championId} className="p-3 rounded-lg bg-[#07090e] border border-rose-950/60 flex items-center gap-3">
                <img 
                  src={m.championIcon} 
                  alt={m.championName} 
                  className="w-12 h-12 rounded-lg border border-rose-600/50 object-cover shadow"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-rose-400">#{idx + 1}</span>
                    <span className="text-xs font-bold text-white">{m.championName}</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold">Maestria {m.championLevel}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{m.championPoints.toLocaleString()} Pontos</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs font-mono border border-dashed border-rose-950/50 rounded-lg">
            Abra o League of Legends para sincronizar automaticamente as maiores maestrias da sua conta.
          </div>
        )}
      </div>

    </div>
  );
};
