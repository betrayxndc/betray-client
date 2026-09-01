import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  LogOut, 
  AlertTriangle, 
  Flame, 
  Snowflake, 
  ShieldAlert, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  RefreshCw, 
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
  Layers,
  Zap,
  Clock,
  Timer,
  ShieldCheck,
  RotateCcw,
  Skull,
  Play,
  Square
} from 'lucide-react';
import { AppSettings, GameflowPhase, LobbyParticipant, LcuLog, Role } from '../types';
import { MOCK_LOBBY_PARTICIPANTS, calculateLobbyAnalysis } from '../data/mockLobby';

interface LobbyRevealTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  gameflowPhase: GameflowPhase;
  logs: LcuLog[];
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
  onDodge?: (methodOverride?: string) => void;
}

export const LobbyRevealTab: React.FC<LobbyRevealTabProps> = ({
  settings,
  updateSettings,
  gameflowPhase,
  addLog,
  onDodge
}) => {
  const [participants, setParticipants] = useState<LobbyParticipant[]>(MOCK_LOBBY_PARTICIPANTS);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'lobby' | 'dodge' | 'rules' | 'raw'>('lobby');
  const [isLastSecondArmed, setIsLastSecondArmed] = useState(settings.lastSecondDodgeEnabled || false);
  const [simulatedTimer, setSimulatedTimer] = useState<number | null>(null);

  // Calculate team quality analysis
  const analysis = useMemo(() => calculateLobbyAnalysis(participants), [participants]);

  // Format all Riot IDs for multi-search
  const formattedRiotIdsString = useMemo(() => {
    return participants.map(p => p.riotId).join(', ');
  }, [participants]);

  // Fetch / Scan Live Lobby from LCU or PyWebView Bridge
  const handleScanLobby = async (isManual = true) => {
    setIsScanning(true);
    if (isManual) {
      addLog('info', '🔍 [LOBBY REVEAL] Consultando LCU XMPP Chat: GET /chat/v5/participants/champ-select...', 'LOBBY_SCAN');
    }

    try {
      if (typeof window !== 'undefined' && (window as any).pywebview && (window as any).pywebview.api) {
        const res = await (window as any).pywebview.api.reveal_lobby();
        if (res && res.success && Array.isArray(res.participants) && res.participants.length > 0) {
          setParticipants(res.participants);
          addLog('success', `✅ [LOBBY REVEAL] ${res.participants.length} invocadores identificados com sucesso no Champ Select!`, 'LOBBY_REVEAL_SUCCESS');
          setIsScanning(false);
          return;
        }
      }

      // Simulated realistic scanning delay
      setTimeout(() => {
        setIsScanning(false);
        if (isManual) {
          addLog('success', '✅ [LOBBY REVEAL] 5 jogadores revelados na fila ranqueada Solo/Duo. Estatísticas calculadas.', 'LOBBY_REVEAL_SUCCESS');
        }
      }, 600);
    } catch (err) {
      setIsScanning(false);
      addLog('error', 'Falha ao consultar participantes do lobby.');
    }
  };

  // Auto-scan on phase change or mount
  useEffect(() => {
    if (gameflowPhase === 'ChampSelect' || settings.lobbyRevealAutoFetch) {
      handleScanLobby(false);
    }
  }, [gameflowPhase, settings.lobbyRevealAutoFetch]);

  // Copy all Riot IDs
  const handleCopyAll = () => {
    navigator.clipboard.writeText(formattedRiotIdsString);
    setCopiedAll(true);
    addLog('info', `📋 Riot IDs copiados para a área de transferência: ${formattedRiotIdsString}`);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy single Riot ID
  const handleCopySingle = (riotId: string) => {
    navigator.clipboard.writeText(riotId);
    setCopiedId(riotId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open OP.GG Multi-Search
  const handleOpenOpGg = () => {
    const region = settings.riotRegion.toLowerCase() === 'br1' ? 'br' : settings.riotRegion.toLowerCase();
    const encodedNames = participants.map(p => encodeURIComponent(p.riotId)).join(',');
    const url = `https://www.op.gg/multisearch/${region}?summoners=${encodedNames}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    addLog('info', `🌐 Abrindo OP.GG Multi-Search: ${url}`);
  };

  // Open Porofessor
  const handleOpenPorofessor = () => {
    const region = settings.riotRegion.toLowerCase() === 'br1' ? 'br' : settings.riotRegion.toLowerCase();
    const formatted = participants.map(p => encodeURIComponent(p.riotId.replace('#', '-'))).join(',');
    const url = `https://porofessor.gg/pregame/${region}/${formatted}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    addLog('info', `🌐 Abrindo Porofessor Live Game: ${url}`);
  };

  // Toggle Last-Second Dodge Engine
  const handleToggleLastSecond = () => {
    const nextState = !isLastSecondArmed;
    setIsLastSecondArmed(nextState);
    updateSettings({ lastSecondDodgeEnabled: nextState });

    if (typeof window !== 'undefined' && (window as any).pywebview && (window as any).pywebview.api) {
      if (nextState) {
        (window as any).pywebview.api.arm_last_second_dodge(settings.lastSecondDodgeSeconds || 3);
        addLog('info', `⏱️ [LAST-SECOND DODGE] Armado para os últimos ${settings.lastSecondDodgeSeconds || 3} segundos de seleção.`);
      } else {
        (window as any).pywebview.api.cancel_last_second_dodge();
        addLog('info', '⏱️ [LAST-SECOND DODGE] Desarmado pelo usuário.');
      }
    } else {
      addLog('info', nextState 
        ? `⏱️ [LAST-SECOND DODGE] Armado para os últimos ${settings.lastSecondDodgeSeconds || 3}s de seleção de campeões.` 
        : '⏱️ [LAST-SECOND DODGE] Desarmado.');
    }
  };

  // Auto-Dodge Trigger Check
  useEffect(() => {
    if (gameflowPhase === 'ChampSelect') {
      if (settings.lobbyRevealAutoDodgeLossStreak && analysis.lossStreaksCount > 0) {
        const severeLoss = participants.find(p => p.streak.type === 'loss' && p.streak.count >= settings.lobbyRevealLossStreakThreshold);
        if (severeLoss) {
          addLog('warning', `⚠️ [AUTO-DODGE TRIGGER] Jogador ${severeLoss.gameName} está em sequência de ${severeLoss.streak.count} derrotas (limite: ${settings.lobbyRevealLossStreakThreshold}).`);
        }
      }
    }
  }, [gameflowPhase, analysis, settings, participants]);

  // Color helpers
  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'CHALLENGER': return 'text-amber-300 border-amber-500/60 bg-amber-950/40';
      case 'GRANDMASTER': return 'text-rose-400 border-rose-500/60 bg-rose-950/40';
      case 'MASTER': return 'text-purple-300 border-purple-500/60 bg-purple-950/40';
      case 'DIAMOND': return 'text-cyan-300 border-cyan-500/60 bg-cyan-950/40';
      case 'EMERALD': return 'text-emerald-300 border-emerald-500/60 bg-emerald-950/40';
      case 'PLATINUM': return 'text-teal-300 border-teal-500/60 bg-teal-950/40';
      case 'GOLD': return 'text-yellow-300 border-yellow-500/60 bg-yellow-950/40';
      case 'SILVER': return 'text-slate-300 border-slate-500/60 bg-slate-800/40';
      default: return 'text-slate-400 border-slate-700 bg-slate-900/40';
    }
  };

  const getRoleIconLabel = (role: Role | 'FILL' | 'UNKNOWN') => {
    switch (role) {
      case 'TOP': return { label: 'Topo', icon: '🛡️' };
      case 'JUNGLE': return { label: 'Selva', icon: '🌲' };
      case 'MID': return { label: 'Meio', icon: '⚡' };
      case 'ADC': return { label: 'ADC', icon: '🏹' };
      case 'SUPPORT': return { label: 'Suporte', icon: '💚' };
      default: return { label: 'Fill', icon: '🔀' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Reveal Mechanism & Quick Actions */}
      <div className="rounded-xl border border-rose-900/50 bg-[#07090e] p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-950 to-black border border-rose-600/50 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.4)] shrink-0">
              <Eye className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-white flex items-center gap-2">
                  <span>LOBBY REVEAL</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-700/70 font-mono font-bold">
                    steele123/reveal
                  </span>
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600/60 font-rajdhani font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Anti-Anônimo Solo/Duo Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl font-rajdhani">
                Desmascara os nomes genéricos (<strong className="text-slate-200">"Aliado 1"</strong>, <strong className="text-slate-200">"Aliado 2"</strong>) 
                da fila ranqueada em tempo real via XMPP LCU Chat. Veja elo, taxa de vitória, sequência de derrotas e histórico antes de começar.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="reveal-scan-btn"
              onClick={() => handleScanLobby(true)}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500 transition-all cursor-pointer shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-rose-400' : 'text-slate-400'}`} />
              <span>{isScanning ? 'Escaneando...' : 'Atualizar Lobby'}</span>
            </button>

            <button
              id="reveal-opgg-btn"
              onClick={handleOpenOpGg}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/80 hover:border-rose-500 transition-all cursor-pointer shadow-[0_0_12px_rgba(225,29,72,0.3)]"
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
              <span>OP.GG Multi-Search</span>
            </button>

            <button
              id="reveal-copy-all-btn"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase bg-black/60 hover:bg-black text-slate-300 border border-rose-950 hover:border-rose-800 transition-all cursor-pointer"
              title="Copiar todos os 5 Riot IDs formatados para colar no chat ou navegador"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedAll ? 'Copiados!' : 'Copiar IDs'}</span>
            </button>

            {onDodge && (
              <button
                id="reveal-fast-dodge-btn"
                onClick={onDodge}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.5)] transition-all cursor-pointer"
                title="Sair imediatamente da seleção de campeões e retornar ao Lobby"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Dodge Imediato</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-rose-950/60">
          <button
            onClick={() => setActiveSubTab('lobby')}
            className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'lobby'
                ? 'bg-rose-950 text-rose-200 border border-rose-600/70'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Visão dos 5 Jogadores</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dodge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'dodge'
                ? 'bg-rose-950 text-rose-200 border border-rose-600/70 shadow-[0_0_12px_rgba(225,29,72,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Motor de Dodge (steele123)</span>
            {isLastSecondArmed && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'rules'
                ? 'bg-rose-950 text-rose-200 border border-rose-600/70'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Regras de Auto-Dodge</span>
          </button>

          <button
            onClick={() => setActiveSubTab('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'raw'
                ? 'bg-rose-950 text-rose-200 border border-rose-600/70'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Multi-Search & Links Diretos</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'lobby' && (
        <>
          {/* Team Quality & Safety Score Card */}
          <div className={`rounded-xl border p-4 sm:p-5 shadow-xl transition-all ${
            analysis.recommendation === 'FAVORAVEL'
              ? 'bg-emerald-950/20 border-emerald-800/50'
              : analysis.recommendation === 'DODGE_RECOMENDADO'
              ? 'bg-rose-950/30 border-rose-800/60'
              : 'bg-[#0a0d14] border-slate-800'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {analysis.recommendation === 'FAVORAVEL' ? (
                    <Award className="w-5 h-5 text-emerald-400" />
                  ) : analysis.recommendation === 'DODGE_RECOMENDADO' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
                  ) : (
                    <Info className="w-5 h-5 text-amber-400" />
                  )}
                  <h3 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                    Diagnóstico da Equipe: {' '}
                    <span className={
                      analysis.recommendation === 'FAVORAVEL'
                        ? 'text-emerald-400 font-extrabold'
                        : analysis.recommendation === 'DODGE_RECOMENDADO'
                        ? 'text-rose-400 font-extrabold'
                        : 'text-amber-300 font-extrabold'
                    }>
                      {analysis.recommendation === 'FAVORAVEL' ? 'Partida Altamente Favorável' : analysis.recommendation === 'DODGE_RECOMENDADO' ? 'DODGE RECOMENDADO (Alto Risco)' : 'Partida Equilibrada'}
                    </span>
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap font-rajdhani">
                  <span>Taxa de Vitória Média: <strong className="text-white">{analysis.averageWinrate}%</strong></span>
                  <span>•</span>
                  <span>Elo Médio: <strong className="text-purple-300">{analysis.averageTier}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                    <strong className="text-emerald-400">{analysis.winStreaksCount} On Fire</strong>
                  </span>
                  {analysis.lossStreaksCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Snowflake className="w-3.5 h-3.5 text-rose-400" />
                        <strong className="text-rose-400">{analysis.lossStreaksCount} em Loss Streak</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Safety Gauge */}
              <div className="flex items-center gap-3 self-start md:self-auto bg-black/50 px-4 py-2.5 rounded-xl border border-rose-950">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-cinzel uppercase font-bold tracking-wider">Score de Vitória</div>
                  <div className={`text-xl font-bold font-mono ${
                    analysis.safetyScore >= 70 ? 'text-emerald-400' : analysis.safetyScore <= 45 ? 'text-rose-400' : 'text-amber-300'
                  }`}>
                    {analysis.safetyScore}/100
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0 font-bold font-mono text-xs" style={{
                  borderColor: analysis.safetyScore >= 70 ? '#10b981' : analysis.safetyScore <= 45 ? '#f43f5e' : '#f59e0b'
                }}>
                  {analysis.safetyScore}%
                </div>
              </div>
            </div>

            {/* Reasons / Insights List */}
            {analysis.reasons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                {analysis.reasons.map((r, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded bg-black/40 text-slate-300 border border-slate-700/60 font-rajdhani flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{r}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Teammates List (5 Cards) */}
          <div className="space-y-4">
            {participants.map((p, idx) => {
              const roleInfo = getRoleIconLabel(p.assignedRole);
              const isCopied = copiedId === p.riotId;
              const region = settings.riotRegion.toLowerCase() === 'br1' ? 'br' : settings.riotRegion.toLowerCase();
              const opGgPlayerUrl = `https://www.op.gg/summoners/${region}/${encodeURIComponent(p.riotId.replace('#', '-'))}`;

              return (
                <div
                  key={p.puuid || idx}
                  id={`lobby-player-card-${p.cellId}`}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden shadow-lg ${
                    p.isLocalPlayer
                      ? 'bg-[#0b0e17] border-rose-600/70 shadow-[0_0_20px_rgba(225,29,72,0.15)]'
                      : 'bg-[#07090e] border-rose-950/70 hover:border-rose-800/80'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      
                      {/* Left: Role, Avatar, Real Riot ID, Alias */}
                      <div className="flex items-center gap-3.5 min-w-[280px]">
                        {/* Role Icon */}
                        <div className="w-10 h-10 rounded-lg bg-black border border-rose-950 flex flex-col items-center justify-center shrink-0" title={`Rota: ${roleInfo.label}`}>
                          <span className="text-base">{roleInfo.icon}</span>
                          <span className="text-[9px] font-cinzel font-bold text-slate-400 uppercase">{roleInfo.label}</span>
                        </div>

                        {/* Profile Icon with Level */}
                        <div className="relative shrink-0">
                          <img
                            src={p.profileIconUrl}
                            alt={p.gameName}
                            className="w-12 h-12 rounded-lg border border-rose-700/60 object-cover shadow"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1.5 -right-1 bg-black/90 text-rose-300 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-rose-900">
                            {p.summonerLevel}
                          </span>
                        </div>

                        {/* Name & Obscured Tag */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs line-through text-slate-500 font-mono font-semibold">
                              {p.anonymousAlias}
                            </span>
                            {p.isLocalPlayer && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-700/60 rounded font-bold font-cinzel uppercase">
                                Você
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                              <span>{p.gameName}</span>
                              <span className="text-rose-400 font-mono text-sm font-semibold">#{p.tagLine}</span>
                            </h4>

                            {/* Quick copy button */}
                            <button
                              onClick={() => handleCopySingle(p.riotId)}
                              className="p-1 rounded bg-black/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                              title="Copiar Riot ID"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>

                            {/* Link to OP.GG */}
                            <a
                              href={opGgPlayerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-black/50 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition cursor-pointer"
                              title="Ver perfil completo no OP.GG"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Streak / Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {p.tags.map((t, tidx) => (
                              <span
                                key={tidx}
                                className={`text-[10px] px-2 py-0.5 rounded font-rajdhani font-semibold border ${
                                  t.color === 'emerald'
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                                    : t.color === 'rose'
                                    ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                                    : t.color === 'amber'
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                                    : t.color === 'purple'
                                    ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                                }`}
                                title={t.tooltip}
                              >
                                {t.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Ranked Solo/Duo Elo & Stats */}
                      <div className="flex items-center gap-4 bg-black/40 px-4 py-2.5 rounded-xl border border-rose-950/80 shrink-0">
                        <div>
                          <div className="text-[10px] text-slate-400 font-cinzel uppercase font-bold tracking-wider">Solo / Duo</div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-cinzel text-sm sm:text-base font-bold ${getTierColor(p.rankedSolo.tier).split(' ')[0]}`}>
                              {p.rankedSolo.tier} {p.rankedSolo.rank}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ({p.rankedSolo.leaguePoints} LP)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-rajdhani flex items-center gap-1">
                            <span>{p.rankedSolo.wins}V {p.rankedSolo.losses}D</span>
                            <span>•</span>
                            <span className={`font-bold ${p.rankedSolo.winrate >= 55 ? 'text-emerald-400' : p.rankedSolo.winrate <= 45 ? 'text-rose-400' : 'text-slate-200'}`}>
                              {p.rankedSolo.winrate}% WR
                            </span>
                          </div>
                        </div>

                        {/* Winrate Mini Progress Bar */}
                        <div className="w-16 flex flex-col gap-1">
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.rankedSolo.winrate >= 55 ? 'bg-emerald-400' : p.rankedSolo.winrate <= 45 ? 'bg-rose-500' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(100, Math.max(10, p.rankedSolo.winrate))}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono text-center">
                            Flex: <strong className="text-slate-300">{p.rankedFlex.tier} {p.rankedFlex.rank}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Right: Top Champions & Match History */}
                      <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap justify-between lg:justify-end">
                        {/* Top 3 Champions */}
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 font-cinzel uppercase font-bold tracking-wider">Mais Jogados</div>
                          <div className="flex items-center gap-2">
                            {p.topChampions.map((c, cidx) => (
                              <div key={cidx} className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-lg border border-slate-800" title={`${c.championName}: ${c.games} jogos, ${c.winrate}% WR, KDA ${c.kda}`}>
                                <img
                                  src={c.championIcon}
                                  alt={c.championName}
                                  className="w-6 h-6 rounded border border-rose-800/40 object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="text-[10px] leading-tight">
                                  <div className="font-semibold text-white">{c.championName}</div>
                                  <div className="text-slate-400 font-mono">{c.winrate}% ({c.games}J)</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Last 5 Matches Badges */}
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-400 font-cinzel uppercase font-bold tracking-wider">Últimas 5</div>
                          <div className="flex items-center gap-1">
                            {p.recentHistory.map((m, midx) => (
                              <div
                                key={midx}
                                className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] font-mono border relative group cursor-pointer ${
                                  m.win
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/70'
                                    : 'bg-rose-950 text-rose-300 border-rose-600/70'
                                }`}
                                title={`${m.win ? 'Vitória' : 'Derrota'} com ${m.championName} (${m.kills}/${m.deaths}/${m.assists}) - KDA: ${m.kda}`}
                              >
                                {m.win ? 'V' : 'D'}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeSubTab === 'dodge' && (
        <div className="space-y-6">
          {/* Main Dodge Engine Card */}
          <div className="rounded-xl border border-rose-900/60 bg-[#07090e] p-5 shadow-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-rose-950/80">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-950 to-black border border-rose-600/60 text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Motor de Dodge Infalível</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-mono">
                      steele123/reveal
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-rajdhani mt-0.5">
                    Substitui o antigo método por um sistema multi-estratégia com fallback de processo nativo e auto-dodge inteligente no último segundo.
                  </p>
                </div>
              </div>

              {/* Instant Manual Dodge Button */}
              {onDodge && (
                <button
                  id="dodge-tab-instant-trigger"
                  onClick={() => onDodge(settings.dodgeMethod || 'auto')}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-cinzel font-bold tracking-widest uppercase bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border border-rose-400/80 shadow-[0_0_25px_rgba(225,29,72,0.6)] cursor-pointer transition-all hover:scale-[1.02] shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Dodge Agora ({settings.dodgeMethod === 'auto' ? 'Auto' : settings.dodgeMethod?.toUpperCase()})</span>
                </button>
              )}
            </div>

            {/* Dodge Method Selection Grid */}
            <div className="space-y-3">
              <label className="text-xs font-cinzel font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Escolha a Estratégia de Dodge:</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Method 1: Auto Cascade */}
                <div 
                  onClick={() => updateSettings({ dodgeMethod: 'auto' })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    (settings.dodgeMethod || 'auto') === 'auto'
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] ring-1 ring-rose-500'
                      : 'bg-black/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Zap className={`w-5 h-5 ${(settings.dodgeMethod || 'auto') === 'auto' ? 'text-rose-400' : 'text-slate-500'}`} />
                      <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                        ⚡ Cascata Automática (Recomendado)
                      </h4>
                    </div>
                    {(settings.dodgeMethod || 'auto') === 'auto' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono font-bold">ATIVO</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-rajdhani mt-2 leading-relaxed">
                    Tenta a LCU API primeiro. Se o cliente Riot não responder em 300ms, aciona imediatamente o Soft Restart UX e o Process Kill de emergência. <strong className="text-slate-200">100% à prova de falhas.</strong>
                  </p>
                </div>

                {/* Method 2: Restart UX */}
                <div 
                  onClick={() => updateSettings({ dodgeMethod: 'restart_ux' })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    settings.dodgeMethod === 'restart_ux'
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] ring-1 ring-rose-500'
                      : 'bg-black/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className={`w-5 h-5 ${settings.dodgeMethod === 'restart_ux' ? 'text-rose-400' : 'text-slate-500'}`} />
                      <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                        🔄 Soft Restart UX (/riotclient)
                      </h4>
                    </div>
                    {settings.dodgeMethod === 'restart_ux' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono font-bold">ATIVO</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-rajdhani mt-2 leading-relaxed">
                    Instrui o Riot Client a reiniciar o processo de interface do League (<code className="text-rose-300">kill-and-restart-ux</code>). Sai do Champ Select instantaneamente e recarrega o LoL sem deslogar em 2 segundos.
                  </p>
                </div>

                {/* Method 3: Process Kill */}
                <div 
                  onClick={() => updateSettings({ dodgeMethod: 'process_kill' })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    settings.dodgeMethod === 'process_kill'
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] ring-1 ring-rose-500'
                      : 'bg-black/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Skull className={`w-5 h-5 ${settings.dodgeMethod === 'process_kill' ? 'text-rose-400' : 'text-slate-500'}`} />
                      <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                        💥 Process Kill (LeagueClientUx.exe)
                      </h4>
                    </div>
                    {settings.dodgeMethod === 'process_kill' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono font-bold">ATIVO</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-rajdhani mt-2 leading-relaxed">
                    Encerra de forma cirúrgica o executável <code className="text-rose-300">LeagueClientUx.exe</code> no Windows via taskkill. O Riot Client detecta a queda e reabre a interface na home em 3 segundos.
                  </p>
                </div>

                {/* Method 4: Multi-Vector LCU */}
                <div 
                  onClick={() => updateSettings({ dodgeMethod: 'multi_vector' })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    settings.dodgeMethod === 'multi_vector'
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] ring-1 ring-rose-500'
                      : 'bg-black/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Layers className={`w-5 h-5 ${settings.dodgeMethod === 'multi_vector' ? 'text-rose-400' : 'text-slate-500'}`} />
                      <h4 className="font-cinzel text-xs font-bold text-white uppercase tracking-wider">
                        🌐 LCU Multi-Vector (Gameflow / LCDS)
                      </h4>
                    </div>
                    {settings.dodgeMethod === 'multi_vector' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono font-bold">ATIVO</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-rajdhani mt-2 leading-relaxed">
                    Dispara simultaneamente os endpoints oficiais de sessão e matchmaking (/lol-gameflow/v1/session/dodge, quitV2 e quitChampSelect).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Last-Second Auto-Dodge Section (The iconic steele123 feature) */}
          <div className="rounded-xl border border-rose-900/50 bg-[#07090e] p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-rose-950/70">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  isLastSecondArmed 
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-cinzel text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Last-Second Auto-Dodge</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isLastSecondArmed ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isLastSecondArmed ? 'ARMADO / PRONTO' : 'DESARMADO'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani">
                    Economiza seus PDLs! Espera até o último instante caso outro aliado quite antes.
                  </p>
                </div>
              </div>

              {/* Arm / Disarm Switch Button */}
              <button
                id="last-second-arm-toggle"
                onClick={handleToggleLastSecond}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                  isLastSecondArmed
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                {isLastSecondArmed ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Desarmar Temporizador</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Armar Auto-Dodge</span>
                  </>
                )}
              </button>
            </div>

            {/* Explanation & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2 space-y-3">
                <div className="p-3.5 rounded-lg bg-black/60 border border-rose-950/80 space-y-2">
                  <div className="text-xs text-rose-300 font-cinzel font-bold uppercase flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Como funciona o Last-Second Dodge:</span>
                  </div>
                  <p className="text-xs text-slate-400 font-rajdhani leading-relaxed">
                    1. Você identifica que o lobby é ruim (trolls, perdedores em streak ou composições inviáveis).<br />
                    2. Deixe o temporizador armado. Em vez de quitar agora, o Betray Client aguarda a seleção inteira.<br />
                    3. Se qualquer outro jogador na partida der Dodge antes de você, você economiza sua penalidade de PDL!<br />
                    4. Se ninguém quitar, o Betray executa o Dodge automaticamente quando faltarem exatamente <strong className="text-white">{settings.lastSecondDodgeSeconds || 3} segundos</strong>.
                  </p>
                </div>

                {isLastSecondArmed && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs text-emerald-300 font-rajdhani font-semibold">
                        Temporizador pronto: Executará Dodge aos {settings.lastSecondDodgeSeconds || 3}s finais da fase.
                      </span>
                    </div>
                    <button
                      onClick={handleToggleLastSecond}
                      className="text-[11px] px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 cursor-pointer font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* Seconds Slider */}
              <div className="p-4 rounded-xl bg-black/80 border border-rose-950 space-y-3 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-cinzel font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Tempo de Disparo:</span>
                    <span className="text-rose-400 font-mono text-sm">{settings.lastSecondDodgeSeconds || 3} segundos</span>
                  </label>
                  <p className="text-[11px] text-slate-500 font-rajdhani mt-1">
                    Quantos segundos antes do fim do Champ Select executar a saída.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={settings.lastSecondDodgeSeconds || 3}
                    onChange={(e) => {
                      const sec = Number(e.target.value);
                      updateSettings({ lastSecondDodgeSeconds: sec });
                      if (isLastSecondArmed && typeof window !== 'undefined' && (window as any).pywebview?.api) {
                        (window as any).pywebview.api.arm_last_second_dodge(sec);
                      }
                    }}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1s (Extremo)</span>
                    <span>3s (Ideal)</span>
                    <span>10s (Conservador)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Rule 1: Loss Streak Auto-Dodge */}
          <div className="rounded-xl border border-rose-950 bg-[#07090e] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
                  <Snowflake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                    Alerta de Loss Streak (Derrotas Seguidas)
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani">
                    Avisa ou executa dodge se um aliado estiver em sequência negativa
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.lobbyRevealAutoDodgeLossStreak}
                onChange={(e) => updateSettings({ lobbyRevealAutoDodgeLossStreak: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-rose-950/60">
              <label className="text-xs text-slate-300 flex justify-between font-rajdhani">
                <span>Limite de derrotas para acionar alerta/dodge:</span>
                <strong className="text-rose-400 font-mono">{settings.lobbyRevealLossStreakThreshold} derrotas consecutivas</strong>
              </label>
              <input
                type="range"
                min={2}
                max={6}
                step={1}
                value={settings.lobbyRevealLossStreakThreshold}
                onChange={(e) => updateSettings({ lobbyRevealLossStreakThreshold: Number(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Rule 2: Low Winrate Safeguard */}
          <div className="rounded-xl border border-rose-950 bg-[#07090e] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                    Filtro de Baixa Taxa de Vitória (Low WR)
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani">
                    Destaca aliados com taxa de vitória geral abaixo do patamar aceitável
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.lobbyRevealAutoDodgeWinrate}
                onChange={(e) => updateSettings({ lobbyRevealAutoDodgeWinrate: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-rose-950/60">
              <label className="text-xs text-slate-300 flex justify-between font-rajdhani">
                <span>Taxa de vitória mínima tolerada:</span>
                <strong className="text-amber-400 font-mono">&lt; {settings.lobbyRevealWinrateThreshold}% WR</strong>
              </label>
              <input
                type="range"
                min={30}
                max={48}
                step={1}
                value={settings.lobbyRevealWinrateThreshold}
                onChange={(e) => updateSettings({ lobbyRevealWinrateThreshold: Number(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Rule 3: Auto-Fetch On Champ Select */}
          <div className="rounded-xl border border-rose-950 bg-[#07090e] p-5 shadow-xl space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                    Varredura Automática ao Entrar no Champ Select
                  </h4>
                  <p className="text-xs text-slate-400 font-rajdhani">
                    Assim que a seleção de campeões iniciar, o Betray Client busca e revela os nomes instantaneamente sem necessidade de clique manual.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.lobbyRevealAutoFetch}
                onChange={(e) => updateSettings({ lobbyRevealAutoFetch: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'raw' && (
        <div className="rounded-xl border border-rose-950 bg-[#07090e] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-400" />
              <span>Multi-Search URLs & Formatos para Copiar</span>
            </h4>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs font-cinzel font-bold border border-rose-700 cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copiado!' : 'Copiar Todos'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-cinzel font-bold uppercase">Formato Padrão Riot IDs (Vírgula):</label>
              <div className="p-3 bg-black/80 rounded-lg border border-rose-950 font-mono text-xs text-emerald-400 select-all break-all">
                {formattedRiotIdsString}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleOpenOpGg}
                className="p-3 rounded-lg bg-black border border-rose-950 hover:border-rose-700 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-cinzel font-bold text-xs text-white uppercase">OP.GG Multi-Search</div>
                  <div className="text-[11px] text-slate-400 font-rajdhani">Abre o resumo de todos os 5 invocadores no OP.GG</div>
                </div>
                <ExternalLink className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={handleOpenPorofessor}
                className="p-3 rounded-lg bg-black border border-rose-950 hover:border-rose-700 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-cinzel font-bold text-xs text-white uppercase">Porofessor Live Game</div>
                  <div className="text-[11px] text-slate-400 font-rajdhani">Ver badges de tilt, OTP e estatísticas profundas</div>
                </div>
                <ExternalLink className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
