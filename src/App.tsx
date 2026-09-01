import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AutoAcceptTab } from './components/AutoAcceptTab';
import { LobbyRevealTab } from './components/LobbyRevealTab';
import { PrePickBanTab } from './components/PrePickBanTab';
import { ProfileTab } from './components/ProfileTab';
import { BackgroundChangerTab } from './components/BackgroundChangerTab';
import { SkinChangerTab } from './components/SkinChangerTab';
import { DownloadTab } from './components/DownloadTab';
import { LcuBridgeTab } from './components/LcuBridgeTab';
import { SettingsModal } from './components/SettingsModal';
import { Watermark } from './components/Watermark';
import { AppSettings, GameflowPhase, ReadyCheckState, SummonerProfile, LcuLog } from './types';
import { INITIAL_MOCK_PROFILE } from './data/mockProfile';
import { downloadExeInstaller } from './utils/installer';

const STORAGE_KEY = 'betray_client_companion_settings_v3';

export default function App() {
  // App Settings with LocalStorage persistence (0 preselected champions initially)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      autoAccept: true,
      autoAcceptDelay: 1,
      autoAcceptSound: true,
      autoPickEnabled: true,
      prePickChampions: {
        TOP: [],
        JUNGLE: [],
        MID: [],
        ADC: [],
        SUPPORT: []
      },
      autoLockPick: true,
      autoBanEnabled: true,
      preBanChampions: [],
      selectedBackgroundSkinId: 91008, // Talon Rosa Negra
      selectedBackgroundSkinName: 'Talon Rosa Negra',
      selectedBackgroundChampName: 'Talon',
      selectedBackgroundSplashUrl: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Talon_8.jpg',
      roseSkinChangerEnabled: true,
      roseAutoDetectChampSelect: true,
      roseSelectedSkins: {},
      roseCurrentChampionKey: 'Zed',
      roseCurrentSkinId: 238000,
      roseCurrentSkinName: 'Zed Clássico',
      roseCurrentChromaId: null,
      lobbyRevealAutoFetch: true,
      lobbyRevealAutoDodgeLossStreak: true,
      lobbyRevealLossStreakThreshold: 3,
      lobbyRevealAutoDodgeWinrate: false,
      lobbyRevealWinrateThreshold: 42,
      dodgeMethod: 'auto',
      lastSecondDodgeEnabled: false,
      lastSecondDodgeSeconds: 3,
      dodgeFallbackTimeoutMs: 500,
      riotApiKey: '',
      riotRegion: 'BR1',
      lcuPort: '51234',
      lcuToken: 'riot-lcu-local-token',
      lcuProtocol: 'https',
      lcuConnected: true,
      soundVolume: 0.5
    };
  });

  // Active Tab navigation
  const [activeTab, setActiveTab] = useState<string>('auto-accept');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<SummonerProfile>(INITIAL_MOCK_PROFILE);

  // Gameflow and Ready Check states
  const [gameflowPhase, setGameflowPhase] = useState<GameflowPhase>('None');
  const [readyCheckState, setReadyCheckState] = useState<ReadyCheckState>({
    state: 'None',
    timer: 0,
    maxTimer: 10,
    playerResponse: 'None',
    numAccepted: 0,
    numTotal: 10
  });

  // Logs stream
  const [logs, setLogs] = useState<LcuLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'lcu',
      message: 'LCU Client inicializado na porta 127.0.0.1 (Lockfile LeagueClientUx ativo).'
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      message: 'Módulos Prontos: Auto-Accept, Pré-Pick & Pré-Ban Automáticos (Trava e Confirmação Imediata).'
    },
    {
      id: 'init-3',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Pronto para uso! Escolha seus campeões no Pré-Pick e Pré-Ban.'
    }
  ]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Automatic Summoner Profile Recognition on Startup
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pywebview && (window as any).pywebview.api) {
      (window as any).pywebview.api.get_current_summoner_profile().then((res: any) => {
        if (res && res.success && res.summoner) {
          const s = res.summoner;
          const soloQueue = res.ranked?.queues?.find((q: any) => q.queueType === 'RANKED_SOLO_5x5');
          const flexQueue = res.ranked?.queues?.find((q: any) => q.queueType === 'RANKED_FLEX_SR');

          const finalName = s.gameName || s.displayName || s.name || (s.formattedRiotId ? s.formattedRiotId.split('#')[0] : '') || 'Invocador';
          const finalTag = s.tagLine || s.tagline || (s.formattedRiotId ? s.formattedRiotId.split('#')[1] : '') || 'BR1';

          setProfile(prev => ({
            ...prev,
            summonerId: String(s.summonerId || prev.summonerId),
            accountId: String(s.accountId || prev.accountId),
            puuid: s.puuid || prev.puuid,
            summonerName: finalName,
            tagline: finalTag,
            summonerLevel: s.summonerLevel || prev.summonerLevel,
            profileIconId: s.profileIconId || prev.profileIconId,
            profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${s.profileIconId || 29}.png`,
            rankedSolo: soloQueue && soloQueue.tier ? {
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
            },
            rankedFlex: flexQueue && flexQueue.tier ? {
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
            }
          }));

          addLog('success', `[AUTO-IDENTIFY] Invocador ativo reconhecido: ${finalName}#${finalTag} (Nível ${s.summonerLevel || 1})`);
        }
      }).catch(() => {});
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addLog = (type: LcuLog['type'], message: string, event?: string) => {
    const newLog: LcuLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      event
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  // Dodge Action Handler (Exits Champ Select and returns to Lobby using chosen method)
  const handleDodge = (methodOverride?: string) => {
    const selectedMethod = methodOverride || settings.dodgeMethod || 'auto';
    const methodLabels: Record<string, string> = {
      auto: '⚡ Cascata Automática (LCU API -> Soft Restart UX -> Process Kill)',
      restart_ux: '🔄 Soft Restart UX (/riotclient/kill-and-restart-ux)',
      process_kill: '💥 Forçado (Process Kill LeagueClientUx.exe)',
      multi_vector: '🌐 LCU Multi-Vector (/lol-gameflow/v1/session/dodge)'
    };

    addLog('info', `🚪 [DODGE INICIADO] Executando estratégia: ${methodLabels[selectedMethod] || selectedMethod}...`, 'DODGE_TRIGGER');

    if (typeof window !== 'undefined' && (window as any).pywebview && (window as any).pywebview.api) {
      (window as any).pywebview.api.dodge_champ_select(selectedMethod).then((res: any) => {
        if (res && res.success) {
          addLog('success', `✅ [DODGE SUCESSO] ${res.message || 'Saída do Champ Select confirmada. Retornando ao Lobby!'}`, 'CHAMP_SELECT_DODGE');
        } else {
          addLog('warning', `⚠️ [DODGE AVISO] Comando disparado (${res?.message || 'Aguardando sincronização da LCU'}).`, 'CHAMP_SELECT_DODGE');
        }
        setGameflowPhase('Lobby');
        setReadyCheckState(prev => ({ ...prev, state: 'None', playerResponse: 'None' }));
      }).catch((err: any) => {
        addLog('error', `Falha ao executar Dodge: ${err?.message || err}`);
      });
    } else {
      setTimeout(() => {
        addLog('success', `✅ [DODGE SUCESSO] Estratégia [${selectedMethod.toUpperCase()}] aplicada! Seleção de campeões encerrada com segurança. Retornando ao Lobby.`, 'CHAMP_SELECT_DODGE');
        setGameflowPhase('Lobby');
        setReadyCheckState(prev => ({ ...prev, state: 'None', playerResponse: 'None' }));
      }, 350);
    }
  };

  // Install / Download .EXE Handler
  const handleInstallExe = async () => {
    try {
      await downloadExeInstaller(settings, addLog);
    } catch (e) {
      addLog('error', 'Falha ao baixar instalador do BetrayClient.exe');
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#e2e8f0] flex flex-col selection:bg-rose-950 selection:text-rose-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        updateSettings={updateSettings}
        gameflowPhase={gameflowPhase}
        openSettings={() => setIsSettingsOpen(true)}
        onDodge={handleDodge}
        onInstallExe={handleInstallExe}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-20 max-w-7xl mx-auto w-full">
        {activeTab === 'auto-accept' && (
          <AutoAcceptTab
            settings={settings}
            updateSettings={updateSettings}
            gameflowPhase={gameflowPhase}
            setGameflowPhase={setGameflowPhase}
            readyCheckState={readyCheckState}
            setReadyCheckState={setReadyCheckState}
            logs={logs}
            addLog={addLog}
            onDodge={handleDodge}
          />
        )}

        {activeTab === 'lobby-reveal' && (
          <LobbyRevealTab
            settings={settings}
            updateSettings={updateSettings}
            gameflowPhase={gameflowPhase}
            logs={logs}
            addLog={addLog}
            onDodge={handleDodge}
          />
        )}

        {activeTab === 'pre-pick-ban' && (
          <PrePickBanTab
            settings={settings}
            updateSettings={updateSettings}
            addLog={addLog}
            onDodge={handleDodge}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            setProfile={setProfile}
            settings={settings}
            updateSettings={updateSettings}
            addLog={addLog}
            onDodge={handleDodge}
          />
        )}

        {activeTab === 'skin-changer' && (
          <SkinChangerTab
            settings={settings}
            updateSettings={updateSettings}
            gameflowPhase={gameflowPhase}
            addLog={addLog}
            onDodge={handleDodge}
          />
        )}

        {activeTab === 'background' && (
          <BackgroundChangerTab
            settings={settings}
            updateSettings={updateSettings}
            profile={profile}
            setProfile={setProfile}
            addLog={addLog}
          />
        )}

        {activeTab === 'download-exe' && (
          <DownloadTab
            settings={settings}
            addLog={addLog}
          />
        )}

        {activeTab === 'lcu-bridge' && (
          <LcuBridgeTab
            settings={settings}
            updateSettings={updateSettings}
            logs={logs}
            addLog={addLog}
          />
        )}
      </main>

      {/* Status Bar */}
      <footer className="border-t border-rose-950/60 bg-[#07090e] px-4 py-2 text-[11px] text-slate-400 font-rajdhani flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#f1f5f9] uppercase font-bold tracking-wider">LCU Socket: Conectado</span>
          </div>
          <span className="text-rose-900/40">|</span>
          <span className="uppercase tracking-wider">Engine: <strong className="text-rose-400 font-semibold">Betray Core Engine</strong></span>
          <span className="text-rose-900/40">|</span>
          <span className="uppercase tracking-wider">Região: <strong className="text-slate-200">{settings.riotRegion}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">BETRAY CLIENT v3.0.0</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        addLog={addLog}
      />

      {/* Persistent Watermark strictly across all screens */}
      <Watermark />
    </div>
  );
}
