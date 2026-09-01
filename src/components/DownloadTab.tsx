import React, { useState } from 'react';
import { Download, ShieldCheck, Cpu, Sparkles, CheckCircle2, Zap, Monitor, AlertTriangle, Terminal, Copy, Check, Info } from 'lucide-react';
import { AppSettings, LcuLog } from '../types';
import { downloadWindowsPackage } from '../utils/installer';
import { APP_LOGO_SRC } from '../assets/logo';

interface DownloadTabProps {
  settings: AppSettings;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
}

export const DownloadTab: React.FC<DownloadTabProps> = ({ settings, addLog }) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedPowerShell, setCopiedPowerShell] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadWindowsPackage(settings, addLog);
    } finally {
      setDownloading(false);
    }
  };

  const psCommand = `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/betray/betray-client/main/setup.ps1' -OutFile 'setup.ps1'; .\\setup.ps1"`;

  const copyPowerShellCmd = () => {
    navigator.clipboard.writeText(psCommand);
    setCopiedPowerShell(true);
    setTimeout(() => setCopiedPowerShell(false), 2500);
    addLog('success', '📋 Comando de instalação rápida do PowerShell copiado!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Main Download Card */}
      <div className="bento-card p-6 md:p-10 bg-gradient-to-br from-[#0e1017] via-[#090b10] to-[#1a0710] border border-rose-600/70 shadow-[0_0_40px_rgba(225,29,72,0.25)] relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/90 border border-rose-700/80 text-rose-300 text-xs font-mono font-bold tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>VERSÃO WINDOWS STANDALONE • 64-BIT COMPATÍVEL</span>
              </div>
              
              <h1 className="font-cinzel text-3xl md:text-5xl font-black text-white tracking-wide">
                BETRAY CLIENT <span className="text-rose-500">.EXE</span>
              </h1>
              
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Baixe o pacote oficial <strong className="text-white">BetrayClient_Windows.zip</strong> com o novo ícone <strong className="text-rose-400 font-bold">Talon Dark Assassin</strong>. Ele contém o compilador de 1 clique que gera o executável nativo <strong className="text-rose-400 font-mono">BetrayClient.exe</strong> no seu Windows.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compilação Nativa PE 64-Bit
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-rose-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Anti-Vanguard Safe
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Zap className="w-3.5 h-3.5" /> Zero Atraso / LCU Direta
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
            <button
              id="download-package-zip-btn"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full md:w-72 px-8 py-5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-cinzel font-black text-base uppercase tracking-widest shadow-[0_0_35px_rgba(225,29,72,0.6)] border border-rose-400/80 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-6 h-6 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'GERANDO PACOTE...' : 'BAIXAR PACOTE WINDOWS'}</span>
            </button>
            <div className="text-[11px] text-center text-slate-400 font-mono">
              Pacote: <strong className="text-rose-300">BetrayClient_Windows.zip</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Guia de Solução dos Alertas do Windows (SmartScreen & Incompatibilidade) */}
      <div className="rounded-2xl border border-amber-600/50 bg-[#0f0e0a] p-6 shadow-xl space-y-4">
        <div className="flex items-start gap-3 border-b border-amber-900/40 pb-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-400 shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-cinzel text-base md:text-lg font-bold text-amber-200 uppercase tracking-wider">
              Como Resolver os Alertas do Windows (Passo a Passo)
            </h3>
            <p className="text-xs text-slate-300 font-rajdhani mt-0.5">
              Entenda por que esses avisos acontecem e como executar o aplicativo em 10 segundos:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Alerta 1: Este aplicativo não pode ser executado em seu PC */}
          <div className="p-4 rounded-xl bg-black/60 border border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-cinzel font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-rose-400" />
              <span>1. "Este aplicativo não pode ser executado em seu PC"</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>Motivo:</strong> O Windows não permite renomear um arquivo ZIP direto para <code className="text-amber-300 font-mono">.exe</code> sem antes compilar o código binário (falta o cabeçalho PE).
            </p>
            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-200 space-y-1">
              <strong className="text-white block">✅ Solução Fácil:</strong>
              <span>1. Baixe o pacote <strong className="text-white">BetrayClient_Windows.zip</strong> acima.</span><br />
              <span>2. Clique com o botão direito nele e escolha <strong>"Extrair Tudo"</strong>.</span><br />
              <span>3. Dê 2 cliques em <strong className="text-white">Instalar_e_Gerar_EXE.bat</strong>. Ele criará o <strong className="text-emerald-300">BetrayClient.exe</strong> compilado e executará na hora!</span>
            </div>
          </div>

          {/* Alerta 2: "O arquivo é perigoso" / SmartScreen */}
          <div className="p-4 rounded-xl bg-black/60 border border-amber-900/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>2. "O arquivo é perigoso" ou "Windows protegeu seu PC"</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>Motivo:</strong> O Windows SmartScreen e o Chrome exibem aviso para <em>todo e qualquer software novo</em> que não possua um certificado corporativo comprado da Microsoft (custa US$ 500/ano).
            </p>
            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-200 space-y-1">
              <strong className="text-white block">✅ Como Liberar em 1 Segundo:</strong>
              <span>• <strong>No Navegador:</strong> Clique em <code className="bg-black/50 px-1 py-0.5 rounded text-amber-200">Manter</code> ou <code className="bg-black/50 px-1 py-0.5 rounded text-amber-200">Manter mesmo assim</code> nos downloads.</span><br />
              <span>• <strong>No Windows:</strong> Na tela azul do SmartScreen, clique no link <strong>"Mais informações"</strong> e depois no botão <strong>"Executar assim mesmo"</strong>.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Como Executar com Passo a Passo Visual */}
      <div className="bento-card p-6 border border-rose-950/80 bg-[#07090e] space-y-4 rounded-xl">
        <div className="flex items-center gap-2 border-b border-rose-950/80 pb-3">
          <Monitor className="w-5 h-5 text-rose-400" />
          <h2 className="font-cinzel text-base font-bold text-white uppercase tracking-wider">
            3 Passos Simples para Criar seu BetrayClient.exe
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="font-cinzel text-sm font-bold text-white">Baixe e Extraia o ZIP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Baixe o arquivo <strong className="text-white">BetrayClient_Windows.zip</strong> e extraia o conteúdo em qualquer pasta (ex: Área de Trabalho).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="font-cinzel text-sm font-bold text-white">Abra "BUILD_EXE.bat"</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dê 2 cliques no arquivo <strong className="text-rose-300 font-mono">BUILD_EXE.bat</strong> (ou <strong className="text-white font-mono">Instalar_e_Gerar_EXE.bat</strong>). Ele compilará o <strong className="text-rose-300 font-mono">BetrayClient.exe</strong> na hora!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 space-y-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="font-cinzel text-sm font-bold text-white">Pronto para Usar!</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              O arquivo <strong>BetrayClient.exe</strong> estará pronto! A partir de então você só precisa abrir o <strong>.exe</strong> quando for jogar.
            </p>
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


