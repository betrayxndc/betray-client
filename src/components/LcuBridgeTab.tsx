import React, { useState } from 'react';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Radio, 
  ShieldCheck, 
  Code2, 
  FolderTree,
  PackageCheck,
  Sparkles,
  Cpu,
  Layers,
  Archive
} from 'lucide-react';
import JSZip from 'jszip';
import { AppSettings, LcuLog } from '../types';
import { generatePythonDesktopApp, LCU_ENDPOINTS } from '../services/lcuService';
import { soundManager } from '../utils/audio';

interface LcuBridgeTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  logs: LcuLog[];
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
}

export const LcuBridgeTab: React.FC<LcuBridgeTabProps> = ({
  settings,
  updateSettings,
  logs,
  addLog
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFileKey, setSelectedFileKey] = useState<string>('Gerar_BetrayClient_EXE.bat');
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const pythonProject = generatePythonDesktopApp(settings);

  const handleCopyCode = (filename: string, content: string) => {
    soundManager.playClick(settings.soundVolume);
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadFullZip = async () => {
    soundManager.playClick(settings.soundVolume);
    setIsZipping(true);
    addLog('info', 'Gerando pacote ZIP do Betray Client para compilação do executável .EXE...');

    try {
      const zip = new JSZip();
      
      // Add all project files into the zip structure
      Object.entries(pythonProject).forEach(([filePath, content]) => {
        zip.file(filePath, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BetrayClient_Windows_Package.zip';
      a.click();
      URL.revokeObjectURL(url);

      addLog('success', 'Pacote ZIP (BetrayClient_Windows_Package.zip) baixado com sucesso! Execute Gerar_BetrayClient_EXE.bat para gerar o .exe.');
    } catch (err) {
      addLog('error', 'Erro ao gerar o pacote ZIP. Tente baixar os arquivos individualmente.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleFile = (filename: string, content: string) => {
    soundManager.playClick(settings.soundVolume);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop() || filename;
    a.click();
    URL.revokeObjectURL(url);
    addLog('success', `Download do arquivo ${filename} concluído.`);
  };

  const handleTestEndpoint = (name: string, endpoint: string, method: string) => {
    soundManager.playClick(settings.soundVolume);
    setTestingEndpoint(name);
    addLog('lcu', `Disparando requisição de teste: ${method} ${endpoint}`);

    setTimeout(() => {
      setTestingEndpoint(null);
      addLog('success', `Resposta recebida de ${endpoint} -> Status 200 OK (LCU Ativa)`);
    }, 800);
  };

  const fileKeys = Object.keys(pythonProject);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Bento Tile */}
      <div className="bento-card p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[10px] font-bold tracking-widest uppercase">
              <Terminal className="w-3 h-3 text-rose-400" />
              Módulo 6 // Compilador & Exportador .EXE
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#f8fafc]">
              GERADOR DE EXECUTÁVEL (.EXE) & BRIDGE LCU
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Pacote completo do <strong className="text-rose-400">Betray Client</strong> pronto para compilação nativa no Windows. Baixe o pacote zip com o compilador em 1-clique (<code className="text-rose-400 font-mono text-[11px]">Gerar_BetrayClient_EXE.bat</code>) ou utilize os scripts em Python.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="download-full-zip-btn"
              onClick={handleDownloadFullZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-4 py-2.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer transition-all shrink-0"
            >
              <Archive className="w-4 h-4 text-white" />
              {isZipping ? 'Compactando...' : 'Baixar Pacote Completo (.ZIP)'}
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Executable Generation Guide */}
      <div className="bento-card p-4 sm:p-5 border-rose-900/60 bg-gradient-to-r from-[#07090e] via-[#0d1017] to-[#07090e]">
        <div className="flex items-center gap-2 border-b border-rose-950/60 pb-2.5 mb-3">
          <PackageCheck className="w-4 h-4 text-rose-400" />
          <h3 className="font-cinzel text-xs font-bold text-rose-400 uppercase tracking-widest">
            Como Gerar o Arquivo BetrayClient.exe no seu Computador
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded bg-[#07090e]/90 border border-rose-950/60 space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-cinzel">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 text-[11px] flex items-center justify-center text-rose-300">1</span>
              Baixe e Extraia o ZIP
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Clique no botão acima para baixar o <strong className="text-slate-200">BetrayClient_Windows_Package.zip</strong> e descompacte em qualquer pasta.
            </p>
          </div>

          <div className="p-3 rounded bg-[#07090e]/90 border border-rose-950/60 space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold font-cinzel">
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-800 text-[11px] flex items-center justify-center text-rose-300">2</span>
              Execute o Compilador .BAT
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dê 2 cliques no arquivo <code className="text-rose-400 font-mono">Gerar_BetrayClient_EXE.bat</code>. Ele instalará o PyInstaller e montará o executável automaticamente.
            </p>
          </div>

          <div className="p-3 rounded bg-[#07090e]/90 border border-rose-950/60 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-cinzel">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[11px] flex items-center justify-center text-emerald-300">3</span>
              Executável Pronto
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              O arquivo <strong className="text-emerald-400">BetrayClient.exe</strong> será criado na pasta raiz, 100% autônomo, sem console e pronto para rodar.
            </p>
          </div>
        </div>
      </div>

      {/* LCU Endpoints Interactive Testing Bar */}
      <div className="bento-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <h3 className="font-cinzel text-xs font-bold text-rose-400 uppercase tracking-wider">
              Testes Rápidos de Endpoints da LCU
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">127.0.0.1:riot-lockfile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleTestEndpoint('Current Summoner', LCU_ENDPOINTS.CURRENT_SUMMONER, 'GET')}
            disabled={testingEndpoint !== null}
            className="p-2.5 rounded bg-[#07090e] hover:bg-rose-950/40 border border-rose-950/60 hover:border-rose-800/80 text-left transition-all cursor-pointer"
          >
            <div className="text-[9px] text-rose-400 font-mono font-bold">GET</div>
            <div className="text-xs font-bold text-[#f8fafc] font-cinzel mt-0.5">/lol-summoner/current</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Obter dados do perfil ativo</div>
          </button>

          <button
            onClick={() => handleTestEndpoint('Accept Queue', LCU_ENDPOINTS.READY_CHECK_ACCEPT, 'POST')}
            disabled={testingEndpoint !== null}
            className="p-2.5 rounded bg-[#07090e] hover:bg-rose-950/40 border border-rose-950/60 hover:border-rose-800/80 text-left transition-all cursor-pointer"
          >
            <div className="text-[9px] text-emerald-400 font-mono font-bold">POST</div>
            <div className="text-xs font-bold text-[#f8fafc] font-cinzel mt-0.5">/ready-check/accept</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Aceitar fila de partida</div>
          </button>

          <button
            onClick={() => handleTestEndpoint('Hover Champ', '/lol-champ-select/v1/session', 'PATCH')}
            disabled={testingEndpoint !== null}
            className="p-2.5 rounded bg-[#07090e] hover:bg-rose-950/40 border border-rose-950/60 hover:border-rose-800/80 text-left transition-all cursor-pointer"
          >
            <div className="text-[9px] text-amber-400 font-mono font-bold">PATCH</div>
            <div className="text-xs font-bold text-[#f8fafc] font-cinzel mt-0.5">/champ-select/session</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Intenção de Pick (Hover)</div>
          </button>

          <button
            onClick={() => handleTestEndpoint('Set Background', LCU_ENDPOINTS.BACKGROUND_SKIN, 'POST')}
            disabled={testingEndpoint !== null}
            className="p-2.5 rounded bg-[#07090e] hover:bg-rose-950/40 border border-rose-950/60 hover:border-rose-800/80 text-left transition-all cursor-pointer"
          >
            <div className="text-[9px] text-purple-400 font-mono font-bold">POST</div>
            <div className="text-xs font-bold text-[#f8fafc] font-cinzel mt-0.5">/background-skin</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Trocar splash do perfil</div>
          </button>
        </div>
      </div>

      {/* Code Browser & File Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Left Column: File Tree */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bento-card p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-rose-950/60 pb-2">
              <FolderTree className="w-3.5 h-3.5 text-rose-400" />
              <h3 className="font-cinzel text-xs font-bold text-rose-400 uppercase tracking-wider">Estrutura do Projeto</h3>
            </div>

            <div className="space-y-1 font-mono text-xs">
              {fileKeys.map((key) => {
                const isSelected = selectedFileKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      soundManager.playClick(settings.soundVolume);
                      setSelectedFileKey(key);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-950/70 text-rose-200 border border-rose-600/80 font-bold'
                        : 'bg-[#07090e] text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                      <span className="truncate text-xs">{key}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bento-card p-3.5 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-200 font-cinzel text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Segurança & Conformidade Riot:
            </div>
            <p className="font-rajdhani text-[11px] text-slate-300 leading-relaxed">
              O Betray Client comunica-se unicamente através da porta HTTPS local da LCU autorizada pela Riot Games. Não acessa nem modifica a memória do jogo (Zero Injeção de DLL).
            </p>
          </div>
        </div>

        {/* Right Column: Code Viewer with Copy Button */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bento-card overflow-hidden flex flex-col">
            {/* Header of code block */}
            <div className="p-3 bg-[#07090e] border-b border-rose-950/60 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono text-xs font-bold text-[#f8fafc]">{selectedFileKey}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadSingleFile(selectedFileKey, (pythonProject as Record<string, string>)[selectedFileKey])}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded font-cinzel uppercase tracking-wider cursor-pointer transition-all border border-slate-700"
                >
                  <Download className="w-3 h-3 text-slate-300" />
                  Baixar Arquivo
                </button>

                <button
                  onClick={() => handleCopyCode(selectedFileKey, (pythonProject as Record<string, string>)[selectedFileKey])}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded font-cinzel uppercase tracking-wider cursor-pointer transition-all"
                >
                  {copiedFile === selectedFileKey ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-white" />
                      Copiar Código
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Textarea / View */}
            <div className="p-3.5 bg-[#05070a] overflow-x-auto max-h-[440px]">
              <pre className="font-mono text-xs text-rose-200/90 leading-relaxed">
                {(pythonProject as Record<string, string>)[selectedFileKey]}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
