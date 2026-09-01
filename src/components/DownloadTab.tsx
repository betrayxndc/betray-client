import React, { useState } from 'react';
import { Download, ShieldCheck, Cpu, Sparkles, CheckCircle2, Zap, Monitor, AlertTriangle, Terminal, Copy, Check, Info, FileCode } from 'lucide-react';
import { AppSettings, LcuLog } from '../types';
import { downloadDirectExe, downloadDirectCmd, downloadWindowsPackage } from '../utils/installer';
import { APP_LOGO_SRC } from '../assets/logo';

interface DownloadTabProps {
  settings: AppSettings;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
}

export const DownloadTab: React.FC<DownloadTabProps> = ({ settings, addLog }) => {
  const [downloadingExe, setDownloadingExe] = useState(false);
  const [downloadingCmd, setDownloadingCmd] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedPowerShell, setCopiedPowerShell] = useState(false);

  const handleDownloadExe = async () => {
    setDownloadingExe(true);
    try {
      await downloadDirectExe(settings, addLog);
    } finally {
      setDownloadingExe(false);
    }
  };

  const handleDownloadCmd = async () => {
    setDownloadingCmd(true);
    try {
      await downloadDirectCmd(settings, addLog);
    } finally {
      setDownloadingCmd(false);
    }
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadWindowsPackage(settings, addLog);
    } finally {
      setDownloadingZip(false);
    }
  };

  const psCommand = `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/betray/betray-client/main/BetrayClient.exe' -OutFile 'BetrayClient.exe'; Start-Process 'BetrayClient.exe'"`;

  const copyPowerShellCmd = () => {
    navigator.clipboard.writeText(psCommand);
    setCopiedPowerShell(true);
    setTimeout(() => setCopiedPowerShell(false), 2500);
    addLog('success', '📋 Comando de execução rápida copiado!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Main Download Card - Direct EXE */}
      <div className="bento-card p-6 md:p-10 bg-gradient-to-br from-[#0e1017] via-[#090b10] to-[#1a0710] border-2 border-rose-500/80 shadow-[0_0_50px_rgba(225,29,72,0.35)] relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-5 max-w-2xl">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-rose-500 shadow-2xl bg-black flex items-center justify-center">
                <img 
                  src={APP_LOGO_SRC} 
                  alt="Betray Client Talon Dark Icon" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-mono font-bold tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DOWNLOAD DIRETO .EXE • SEM BUILDER OU COMPILADOR</span>
              </div>
              
              <h1 className="font-cinzel text-3xl md:text-5xl font-black text-white tracking-wide">
                BETRAY CLIENT <span className="text-rose-500">.EXE</span>
              </h1>
              
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Baixe diretamente o arquivo executável <strong className="text-rose-400 font-mono font-bold">BetrayClient.exe</strong> para Windows 10/11. Ele é <strong className="text-emerald-300">100% auto-contido</strong>: ao executá-lo, todas as dependências, scripts e requisitos são preparados e instalados de forma totalmente automática no seu computador, sem necessidade de baixar a pasta do repositório!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Instalação Integrada
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-rose-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Anti-Vanguard Safe
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Zap className="w-3.5 h-3.5" /> Rose Skin Changer & LCU
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
            {/* Direct EXE Download Button */}
            <button
              id="download-direct-exe-btn"
              onClick={handleDownloadExe}
              disabled={downloadingExe}
              className="w-full md:w-80 px-8 py-5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-cinzel font-black text-base uppercase tracking-widest shadow-[0_0_40px_rgba(225,29,72,0.7)] border border-rose-400/90 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-6 h-6 ${downloadingExe ? 'animate-bounce' : ''}`} />
              <div className="flex flex-col text-left">
                <span className="leading-tight">{downloadingExe ? 'BAIXANDO...' : 'BAIXAR BETRAYCLIENT.EXE'}</span>
                <span className="text-[10px] font-mono text-rose-200 tracking-normal opacity-90">Arquivo .EXE Direto (1 Clique)</span>
              </div>
            </button>

            {/* Alternative formats */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCmd}
                disabled={downloadingCmd}
                className="flex-1 px-3 py-2 rounded-lg bg-[#141824] hover:bg-[#1c2236] border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Baixar script executável .cmd direto"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Launcher .CMD</span>
              </button>

              <button
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                className="flex-1 px-3 py-2 rounded-lg bg-[#141824] hover:bg-[#1c2236] border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Baixar pacote completo em ZIP com fontes"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                <span>Pacote .ZIP</span>
              </button>
            </div>

            <div className="text-[11px] text-center text-slate-400 font-mono">
              Formato: <strong className="text-emerald-300">BetrayClient.exe</strong> (Windows 64-Bit)
            </div>
          </div>
        </div>
      </div>

      {/* Como Executar em 2 Segundos */}
      <div className="bento-card p-6 border border-rose-950/80 bg-[#07090e] space-y-4 rounded-xl">
        <div className="flex items-center gap-2 border-b border-rose-950/80 pb-3">
          <Monitor className="w-5 h-5 text-rose-400" />
          <h2 className="font-cinzel text-base font-bold text-white uppercase tracking-wider">
            Como Usar o BetrayClient.exe (Sem Instalação)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="font-cinzel text-sm font-bold text-white">Baixe o BetrayClient.exe</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clique no botão vermelho acima para baixar o arquivo <strong className="text-emerald-300 font-mono">BetrayClient.exe</strong> direto no seu PC.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="font-cinzel text-sm font-bold text-white">Dê 2 Cliques no .EXE</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Execute o <strong className="text-rose-300 font-mono">BetrayClient.exe</strong>. O aplicativo abre na hora, sem precisar de nenhum comando ou compilador.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="font-cinzel text-sm font-bold text-white">Conexão Automática</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Abra o seu <strong>League of Legends</strong>. O Betray Client detectará sua conta, ativará o Auto-Accept e o Rose Skin Changer em tempo real!
            </p>
          </div>
        </div>
      </div>

      {/* Guia de Solução dos Alertas do Windows (SmartScreen) */}
      <div className="rounded-2xl border border-amber-600/50 bg-[#0f0e0a] p-6 shadow-xl space-y-4">
        <div className="flex items-start gap-3 border-b border-amber-900/40 pb-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-400 shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-cinzel text-base md:text-lg font-bold text-amber-200 uppercase tracking-wider">
              Dica: O que fazer se o Windows SmartScreen aparecer?
            </h3>
            <p className="text-xs text-slate-300 font-rajdhani mt-0.5">
              Como o Betray Client é um utilitário open-source independente, o Windows pode exibir uma tela informativa:
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-amber-900/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Como Liberar a Execução em 1 Segundo:</span>
          </div>
          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-200 space-y-1">
            <span>• <strong>No Navegador:</strong> Se aparecer aviso de download, clique em <code className="bg-black/50 px-1 py-0.5 rounded text-amber-200">Manter</code> ou <code className="bg-black/50 px-1 py-0.5 rounded text-amber-200">Manter mesmo assim</code>.</span><br />
            <span>• <strong>No Windows:</strong> Na tela azul do SmartScreen, clique no link <strong>"Mais informações"</strong> e depois no botão <strong>"Executar assim mesmo"</strong>.</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card p-5 border border-rose-950/80 bg-[#07090e] space-y-3 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-cinzel text-base font-bold text-white uppercase tracking-wider">Executável Nativo Windows</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aplicativo compilado em binário 64-bit com WebView2 dark mode de alta performance a 60 FPS.
          </p>
        </div>

        <div className="bento-card p-5 border border-rose-950/80 bg-[#07090e] space-y-3 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-cinzel text-base font-bold text-white uppercase tracking-wider">100% Anti-Vanguard Safe</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sem injeção de DLL ou memória de jogo. Utiliza exclusivamente a API de comunicação autorizada do <code className="text-emerald-300 font-mono">LeagueClientUx</code>.
          </p>
        </div>

        <div className="bento-card p-5 border border-rose-950/80 bg-[#07090e] space-y-3 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-cinzel text-base font-bold text-white uppercase tracking-wider">Todos os Módulos Ativos</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Auto-Accept, Pré-Pick/Ban, Rose Skin Changer Engine, Seletor de Chromas, Revelador de Lobby e Motor de Dodge infalível.
          </p>
        </div>
      </div>
    </div>
  );
};


