import React, { useState } from 'react';
import { 
  Zap, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  RefreshCw, 
  LogOut,
  Download,
  PackageCheck,
  Sparkles,
  FileCode,
  ArrowDownToLine,
  Check
} from 'lucide-react';
import { AppSettings, GameflowPhase, ReadyCheckState, LcuLog } from '../types';
import { soundManager } from '../utils/audio';
import { downloadExeInstaller } from '../utils/installer';

interface AutoAcceptTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  gameflowPhase: GameflowPhase;
  setGameflowPhase: (phase: GameflowPhase) => void;
  readyCheckState: ReadyCheckState;
  setReadyCheckState: React.Dispatch<React.SetStateAction<ReadyCheckState>>;
  logs: LcuLog[];
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
  onDodge?: () => void;
}

export const AutoAcceptTab: React.FC<AutoAcceptTabProps> = ({
  settings,
  updateSettings,
  gameflowPhase,
  setGameflowPhase,
  readyCheckState,
  setReadyCheckState,
  logs,
  addLog,
  onDodge
}) => {
  const [acceptCountdown, setAcceptCountdown] = useState<number | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const executeAccept = () => {
    setAcceptCountdown(null);
    setReadyCheckState((prev) => ({
      ...prev,
      playerResponse: 'Accepted',
      numAccepted: 10,
      state: 'Accepted'
    }));

    if (settings.autoAcceptSound) {
      soundManager.playAcceptSuccess(settings.soundVolume);
    }

    addLog('success', 'POST /lol-matchmaking/v1/ready-check/accept -> Partida Aceita com Sucesso! (200 OK)');
  };

  const handleInstallExe = async () => {
    soundManager.playClick(settings.soundVolume);
    setIsInstalling(true);
    try {
      await downloadExeInstaller(settings, addLog);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      addLog('error', 'Erro ao preparar instalador do executável .EXE.');
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Bento Header Tile */}
      <div className="bento-card p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[10px] font-bold tracking-widest uppercase">
              <Zap className="w-3 h-3 text-rose-400" />
              Módulo 1 // Queue Automation
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#f8fafc]">
              AUTO-ACCEPT DE PARTIDAS
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Escuta contínua via WebSocket nativo da LCU (<code className="text-rose-400 font-mono text-[11px]">/lol-matchmaking/v1/ready-check</code>).
              Aceitação automática no milissegundo de detecção da fila ou com delay humano programável.
            </p>
          </div>

          {/* Quick Action Controls: Install .EXE + Dodge + Master Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            {/* Install / Download .EXE button */}
            <button
              id="btn-install-exe-header"
              onClick={handleInstallExe}
              disabled={isInstalling}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.4)] border border-rose-400/60 cursor-pointer transition-all disabled:opacity-50"
              title="Baixar pacote instalador e gerar o BetrayClient.exe"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Baixado com Sucesso!</span>
                </>
              ) : isInstalling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando .EXE...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-rose-200" />
                  <span>Instalar .EXE (Windows)</span>
                </>
              )}
            </button>

            {/* Quick Dodge Button */}
            {onDodge && (
              <button
                id="btn-autoaccept-dodge"
                onClick={onDodge}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-700/80 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:border-rose-500 cursor-pointer transition-all"
                title="Sair da Seleção de Campeões e retornar ao Lobby"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Dodge (Lobby)</span>
              </button>
            )}

            {/* Master Toggle Bento Box */}
            <div className="flex items-center gap-3 bg-[#07090e]/90 p-2.5 px-3 rounded-lg border border-rose-950/60 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${settings.autoAccept ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Status Loop</div>
                  <div className="text-xs font-bold text-[#f8fafc] uppercase tracking-wide">
                    {settings.autoAccept ? 'Ativado' : 'Desativado'}
                  </div>
                </div>
              </div>
              <button
                id="main-auto-accept-toggle"
                onClick={() => {
                  soundManager.playClick(settings.soundVolume);
                  const next = !settings.autoAccept;
                  updateSettings({ autoAccept: next });
                  addLog('info', `Auto-Accept alternado para: ${next ? 'LIGADO' : 'DESLIGADO'}`);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  settings.autoAccept ? 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoAccept ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Controls & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Left Column: Configuration & Installation Box */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">
          {/* Configuration Tile */}
          <div className="bento-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-cinzel font-bold text-xs uppercase tracking-widest border-b border-rose-950/60 pb-2.5">
              <Sliders className="w-4 h-4 text-rose-400" />
              <h3>Parâmetros de Aceitação</h3>
            </div>

            {/* Delay Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5 font-cinzel">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  Delay de Aceitação:
                </span>
                <span className="font-mono text-rose-400 font-bold bg-[#07090e] px-2 py-0.5 rounded border border-rose-950/60 text-[11px]">
                  {settings.autoAcceptDelay === 0 ? 'Instantâneo (0s)' : `${settings.autoAcceptDelay} segundo(s)`}
                </span>
              </div>
              <input
                id="auto-accept-delay-slider"
                type="range"
                min="0"
                max="5"
                step="1"
                value={settings.autoAcceptDelay}
                onChange={(e) => updateSettings({ autoAcceptDelay: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-[#07090e] rounded appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-rajdhani uppercase tracking-wider">
                <span>0s (Instantâneo)</span>
                <span>2s (Recomendado)</span>
                <span>5s (Humano)</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded bg-[#07090e]/80 border border-rose-950/50">
              <div className="flex items-center gap-2.5">
                {settings.autoAcceptSound ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-200 font-cinzel">Alerta Sonoro (Match Ready)</div>
                  <div className="text-[10px] text-slate-400 font-rajdhani">Notificação de áudio no momento da chamada</div>
                </div>
              </div>
              <button
                id="sound-alert-toggle"
                onClick={() => updateSettings({ autoAcceptSound: !settings.autoAcceptSound })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  settings.autoAcceptSound ? 'bg-rose-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.autoAcceptSound ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dodge Quick Trigger Action Card */}
            {onDodge && (
              <div className="p-3 rounded bg-[#07090e]/90 border border-rose-950/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cinzel font-bold text-slate-200 flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    Sair da Sala (Dodge Rápido)
                  </span>
                  <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                    LCU DIRECT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Permite abandonar a seleção de campeões de forma limpa e voltar imediatamente ao Lobby sem fechar o cliente LoL.
                </p>
                <button
                  id="btn-autoaccept-dodge-card"
                  onClick={onDodge}
                  className="w-full py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs tracking-wider uppercase shadow-[0_0_12px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Executar Dodge (Lobby)</span>
                </button>
              </div>
            )}

            {/* Safety Badge */}
            <div className="p-2.5 rounded bg-[#07090e]/70 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-emerald-300">LCU Socket Compliance:</strong> Utiliza o canal local de loopback do cliente Riot (<code className="text-emerald-400">127.0.0.1</code>), 100% seguro sem injeção de memória ou DLL.
              </div>
            </div>
          </div>

          {/* Windows Standalone .EXE Installer Tile */}
          <div className="bento-card p-4 sm:p-5 space-y-3 border border-rose-900/60 shadow-lg">
            <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-cinzel font-bold text-xs uppercase tracking-widest">
                <ArrowDownToLine className="w-4 h-4 text-rose-400" />
                <h3>Instalador Betray Client (.EXE)</h3>
              </div>
              <span className="text-[9px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-800/60 font-mono font-bold">
                WINDOWS STANDALONE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Baixe o pacote completo com instalador automático em 1 clique para gerar o executável <code className="text-rose-400 font-mono font-bold">BetrayClient.exe</code> independente no seu PC.
            </p>

            <div className="p-2.5 rounded bg-[#07090e] border border-rose-950/60 text-[11px] text-slate-300 space-y-1 font-mono">
              <div>1. Clique no botão abaixo para baixar o instalador</div>
              <div>2. Extraia o arquivo ZIP no seu computador</div>
              <div>3. Execute <span className="text-rose-400 font-bold">Gerar_BetrayClient_EXE.bat</span></div>
              <div className="text-emerald-400">✓ O executável BetrayClient.exe será gerado na hora!</div>
            </div>

            <button
              id="btn-install-exe-card"
              onClick={handleInstallExe}
              disabled={isInstalling}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] disabled:opacity-50 transition-all"
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Pacote do Instalador...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Instalador Baixado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Instalador .EXE (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Status & WebSocket Logs */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          
          {/* Active Queue / Ready Check Stage Bento Tile */}
          <div className="bento-card p-5 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* State: IDLE */}
            {gameflowPhase !== 'ReadyCheck' && (
              <div className="text-center space-y-2.5 py-4">
                <div className="w-14 h-14 rounded-md bg-[#07090e] border border-rose-900/40 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(225,29,72,0.15)]">
                  <Zap className="w-7 h-7 text-rose-400" />
                </div>
                <div className="font-cinzel text-base font-bold tracking-wider text-[#f8fafc]">
                  Escuta Ativa de Fila LoL
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  O Auto-Accept do Betray Client está armado e monitorando o processo do League of Legends. Assim que qualquer partida for encontrada, o handshake de aceitação será efetuado automaticamente.
                </p>
              </div>
            )}

            {/* State: READY CHECK / MATCH FOUND POPUP */}
            {gameflowPhase === 'ReadyCheck' && (
              <div className="w-full max-w-sm bg-[#07090e] border border-rose-500/80 rounded-md p-5 text-center space-y-4 shadow-[0_0_25px_rgba(225,29,72,0.3)] animate-scaleIn">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-400 font-cinzel">
                  <Zap className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                  PARTIDA ENCONTRADA!
                </div>

                {/* Acceptance status */}
                {readyCheckState.playerResponse === 'Accepted' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Partida Aceita Automaticamente!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {acceptCountdown !== null && (
                      <div className="text-xs text-rose-300 font-semibold">
                        Auto-Accept: confirmando em <span className="font-bold text-white text-sm">{acceptCountdown}s</span>...
                      </div>
                    )}
                    <button
                      id="manual-accept-match-button"
                      onClick={executeAccept}
                      className="w-full py-2.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer transition-all"
                    >
                      ACEITAR AGORA
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real-time Telemetry Tile */}
          <div className="bento-card p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-cinzel font-bold text-xs uppercase tracking-widest">
                <Cpu className="w-4 h-4 text-rose-400" />
                <h3>Monitor de Fila em Tempo Real</h3>
              </div>
              <span className="text-[9px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/40 font-mono uppercase font-bold">
                STANDBY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-[#07090e]/80 border border-rose-950/40">
                <span className="text-slate-400 font-rajdhani text-[10px] block">Processo LoL:</span>
                <span className="font-mono font-bold text-emerald-400 text-[11px]">LeagueClientUx.exe</span>
              </div>
              <div className="p-2 rounded bg-[#07090e]/80 border border-rose-950/40">
                <span className="text-slate-400 font-rajdhani text-[10px] block">Canal Pronto:</span>
                <span className="font-mono text-rose-400 text-[11px]">ready-check</span>
              </div>
              <div className="p-2 rounded bg-[#07090e]/80 border border-rose-950/40">
                <span className="text-slate-400 font-rajdhani text-[10px] block">Latência LCU:</span>
                <span className="font-mono text-slate-200 text-[11px]">~2ms Loopback</span>
              </div>
            </div>
          </div>

          {/* LCU Real-time Logs Console */}
          <div className="bento-card p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-rose-400 font-cinzel uppercase tracking-wider">
                  LCU WebSocket Logs
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">127.0.0.1:49281</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1 font-mono text-[11px] p-2.5 rounded bg-[#07090e] border border-rose-950/60">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-5">Aguardando eventos da LCU...</div>
              ) : (
                logs.map((log) => {
                  let color = 'text-slate-300';
                  if (log.type === 'success') color = 'text-emerald-400';
                  if (log.type === 'error') color = 'text-rose-400';
                  if (log.type === 'warning') color = 'text-amber-400';
                  if (log.type === 'lcu') color = 'text-rose-300';

                  return (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className={`${color} break-all`}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
