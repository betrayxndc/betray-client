import React, { useState } from 'react';
import { 
  Zap, 
  User, 
  Palette, 
  Terminal, 
  Settings, 
  Crosshair,
  Wifi,
  WifiOff,
  LogOut,
  Download,
  Sparkles,
  Eye,
  Shield,
  X
} from 'lucide-react';
import { AppSettings, GameflowPhase } from '../types';
import { APP_LOGO_SRC } from '../assets/logo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  gameflowPhase: GameflowPhase;
  openSettings: () => void;
  onDodge?: (methodOverride?: string) => void;
  onInstallExe?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  gameflowPhase,
  openSettings,
  onDodge,
  onInstallExe
}) => {
  const getPhaseDisplay = () => {
    switch (gameflowPhase) {
      case 'Matchmaking':
        return { label: 'Buscando Partida...', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' };
      case 'ReadyCheck':
        return { label: 'Partida Encontrada!', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold animate-bounce' };
      case 'ChampSelect':
        return { label: 'Seleção de Campeões', color: 'bg-cyan-500/20 text-cyan-200 border-cyan-400' };
      case 'InProgress':
        return { label: 'Em Jogo (In-Game)', color: 'bg-purple-500/20 text-purple-200 border-purple-400' };
      default:
        return settings.lcuConnected 
          ? { label: 'LCU: 127.0.0.1 (Pronto)', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' }
          : { label: 'LCU: Aguardando LoL', color: 'bg-rose-950/60 text-rose-300 border-rose-500/30' };
    }
  };

  const phase = getPhaseDisplay();

  const navItems = [
    { id: 'auto-accept', label: 'Auto-Accept', icon: Zap, badge: settings.autoAccept ? 'ON' : 'OFF' },
    { id: 'lobby-reveal', label: 'Lobby Reveal', icon: Eye, badge: 'REVEAL' },
    { id: 'pre-pick-ban', label: 'Pré-Pick & Ban', icon: Crosshair },
    { id: 'skin-changer', label: 'Skin Changer', icon: Sparkles, badge: settings.roseSkinChangerEnabled ? 'ON' : 'OFF' },
    { id: 'background', label: 'Background LCU', icon: Palette },
    { id: 'profile', label: 'Perfil & Elo', icon: User },
    { id: 'download-exe', label: 'Instalador .EXE', icon: Download, badge: 'EXE' },
    { id: 'lcu-bridge', label: 'LCU Bridge', icon: Terminal }
  ];

  const [showIconModal, setShowIconModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-rose-950/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* Brand / Logo Tile with Talon Dark Icon */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowIconModal(true)}
            className="flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-xl bg-black border border-rose-900/60 hover:border-rose-500 shadow-[0_0_15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] group transition-all cursor-pointer text-left"
            title="Clique para ver o ícone oficial do Betray Client (Talon Dark)"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-rose-500/60 group-hover:border-rose-400 flex items-center justify-center bg-[#0d0710] shadow-[0_0_10px_rgba(225,29,72,0.4)] shrink-0 group-hover:scale-105 transition-transform">
              <img 
                src={APP_LOGO_SRC} 
                alt="Betray Client Icon - Talon Dark" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-cinzel text-sm sm:text-base font-black tracking-widest text-[#f8fafc] whitespace-nowrap flex items-center gap-1.5 leading-none group-hover:text-white">
                <span>BETRAY</span>
                <span className="text-rose-500 group-hover:text-rose-400">CLIENT</span>
              </h1>
              <span className="text-[9px] font-mono text-slate-400 group-hover:text-rose-300 transition-colors uppercase tracking-widest">
                Talon Dark Edition
              </span>
            </div>
          </button>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-rose-950/80 text-rose-200 border border-rose-600/60 shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    item.badge === 'ON' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Status & Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fast Dodge Button */}
          {onDodge && (
            <button
              id="navbar-dodge-btn"
              onClick={() => onDodge(settings.dodgeMethod || 'auto')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase border transition-all cursor-pointer shadow-md ${
                gameflowPhase === 'ChampSelect'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
                  : 'bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 border-rose-800/80 hover:border-rose-600'
              }`}
              title={`Dodge: Sair da Seleção de Campeões e voltar ao Lobby (Método: ${settings.dodgeMethod || 'auto'})`}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden sm:inline">Dodge</span>
              <span className="text-[10px] text-rose-300 sm:text-[11px] font-sans font-bold">
                ({settings.dodgeMethod === 'auto' ? 'Auto' : settings.dodgeMethod === 'restart_ux' ? 'UX' : settings.dodgeMethod === 'process_kill' ? 'Kill' : 'LCU'})
              </span>
            </button>
          )}

          {/* Quick Download/Install .EXE Button */}
          {onInstallExe && (
            <button
              id="navbar-install-exe-btn"
              onClick={onInstallExe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold tracking-wider uppercase bg-gradient-to-r from-rose-700/90 to-rose-600/90 hover:from-rose-600 hover:to-rose-500 text-white border border-rose-500/70 shadow-[0_0_10px_rgba(225,29,72,0.3)] transition-all cursor-pointer"
              title="Instalar e Baixar BetrayClient.exe (Windows)"
            >
              <Download className="w-3.5 h-3.5 text-rose-200" />
              <span className="hidden sm:inline">Instalar</span>
              <span className="font-mono text-[10px] sm:text-[11px] text-rose-200">.EXE</span>
            </button>
          )}

          {/* LCU Status Pill */}
          <div className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] border font-rajdhani font-semibold ${phase.color}`}>
            <div className={`w-2 h-2 rounded-full ${settings.lcuConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-400'} animate-pulse`} />
            <span className="truncate max-w-[140px] font-mono">{phase.label}</span>
          </div>

          {/* Settings Trigger */}
          <button
            id="nav-settings-btn"
            onClick={openSettings}
            className="p-2 rounded-lg bg-[#07090e] border border-rose-950/80 hover:border-rose-700/80 text-slate-400 hover:text-rose-200 transition-all cursor-pointer"
            title="Configurações LCU & Áudio"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex items-center justify-around border-t border-rose-950/40 bg-[#050608] px-2 py-1.5 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-1.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                isActive ? 'text-rose-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Talon Dark Icon Showcase Modal */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0b0e14] border border-rose-600/70 rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.35)] overflow-hidden p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-rose-950/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="font-cinzel text-sm font-black text-white uppercase tracking-widest">
                  Ícone Oficial • Betray Client
                </h3>
              </div>
              <button 
                onClick={() => setShowIconModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High Res Icon Preview */}
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-600 via-purple-600 to-rose-600 blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-rose-500 shadow-2xl bg-black">
                  <img 
                    src={APP_LOGO_SRC} 
                    alt="Betray Client Talon Dark Icon Full" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-cinzel text-lg font-black text-white tracking-wider">
                  TALON DARK ASSASSIN
                </h4>
                <p className="text-xs text-rose-300/90 font-rajdhani">
                  Identidade visual dark inspirada nas lâminas e capuz do Talon
                </p>
              </div>
            </div>

            {/* Visual Specs Badge */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-black/60 border border-slate-800 text-slate-300">
                <span className="text-rose-400 block font-bold">Estilo</span>
                <span>Dark Fantasy</span>
              </div>
              <div className="p-2 rounded-lg bg-black/60 border border-slate-800 text-slate-300">
                <span className="text-rose-400 block font-bold">Tema</span>
                <span>Lâminas do Talon</span>
              </div>
              <div className="p-2 rounded-lg bg-black/60 border border-slate-800 text-slate-300">
                <span className="text-rose-400 block font-bold">Formato</span>
                <span>1:1 App Badge</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Criado para o Betray Companion
              </span>
              <a
                href={APP_LOGO_SRC}
                download="betray_talon_dark_icon.jpg"
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-cinzel text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Salvar Ícone</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
