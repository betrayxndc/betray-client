import React from 'react';
import { 
  Settings, 
  X, 
  Volume2, 
  Clock, 
  Key, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Terminal,
  Zap,
  Sliders
} from 'lucide-react';
import { AppSettings, LcuLog } from '../types';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
  addLog
}) => {
  if (!isOpen) return null;

  const handleResetDefaults = () => {
    soundManager.playClick(settings.soundVolume);
    updateSettings({
      autoAccept: true,
      autoAcceptDelay: 1,
      autoAcceptSound: true,
      autoPickEnabled: true,
      autoLockPick: false,
      autoBanEnabled: true,
      soundVolume: 0.5
    });
    addLog('info', 'Configurações redefinidas para os padrões de fábrica.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0c0e14] border border-rose-900/40 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-rose-950/60 bg-[#07090e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-rose-400" />
            <h3 className="font-cinzel text-sm font-bold text-[#f8fafc] uppercase tracking-wider">Configurações Betray Client</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick(settings.soundVolume);
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] bg-[#0c0e14]">
          
          {/* Audio volume */}
          <div className="p-3 rounded bg-[#07090e] border border-rose-950/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5 font-cinzel">
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                Volume dos Efeitos Sonoros
              </span>
              <span className="font-mono text-rose-400">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#171a24] rounded appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Auto accept delay */}
          <div className="p-3 rounded bg-[#07090e] border border-rose-950/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5 font-cinzel">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                Delay de Auto-Aceitar Partida
              </span>
              <span className="font-mono text-rose-400">{settings.autoAcceptDelay}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={settings.autoAcceptDelay}
              onChange={(e) => updateSettings({ autoAcceptDelay: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-[#171a24] rounded appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* LCU Lockfile overrides */}
          <div className="p-3 rounded bg-[#07090e] border border-rose-950/50 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 font-cinzel uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              Conexão Lockfile LCU
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Porta LCU:</label>
                <input
                  type="text"
                  value={settings.lcuPort}
                  onChange={(e) => updateSettings({ lcuPort: e.target.value })}
                  placeholder="51234"
                  className="w-full mt-1 px-2 py-1 bg-[#121622] border border-rose-950/60 rounded text-xs text-[#f8fafc] font-mono focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Protocolo:</label>
                <input
                  type="text"
                  value={settings.lcuProtocol}
                  onChange={(e) => updateSettings({ lcuProtocol: e.target.value })}
                  placeholder="https"
                  className="w-full mt-1 px-2 py-1 bg-[#121622] border border-rose-950/60 rounded text-xs text-[#f8fafc] font-mono focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Watermark notice */}
          <div className="p-2.5 rounded bg-[#07090e] border border-rose-950/50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-cinzel">Créditos de Autoria:</span>
            <span className="font-bold text-rose-400 font-rajdhani uppercase tracking-wider">"feito por betray"</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#07090e] border-t border-rose-950/60 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Redefinir Padrões
          </button>

          <button
            onClick={() => {
              soundManager.playClick(settings.soundVolume);
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(225,29,72,0.4)] transition-all"
          >
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
