import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Search, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Monitor, 
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { AppSettings, Champion, Skin, SummonerProfile, LcuLog, Role } from '../types';
import { CHAMPIONS_LIST } from '../data/champions';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface BackgroundChangerTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  profile: SummonerProfile;
  setProfile: React.Dispatch<React.SetStateAction<SummonerProfile>>;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
}

export const BackgroundChangerTab: React.FC<BackgroundChangerTabProps> = ({
  settings,
  updateSettings,
  profile,
  setProfile,
  addLog
}) => {
  // Step navigation: 1 = Choose Champion, 2 = Choose Skin
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedChampionKey, setSelectedChampionKey] = useState<string>('Zed');
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewSkin, setPreviewSkin] = useState<Skin | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const selectedChampion = CHAMPIONS_LIST.find(c => c.key === selectedChampionKey) || CHAMPIONS_LIST[0];

  // Dynamically ensure skins array is valid
  const currentSkins: Skin[] = selectedChampion?.skins || [];
  
  // Active preview skin
  const activeSkin: Skin = previewSkin && previewSkin.splashUrl.includes(selectedChampionKey)
    ? previewSkin
    : (currentSkins[0] || {
        id: 0,
        num: 0,
        name: `${selectedChampion?.name || 'Campeão'} Padrão`,
        chromas: false,
        splashUrl: selectedChampion?.splash || '',
        uncenteredSplashUrl: selectedChampion?.splash || '',
        tileUrl: selectedChampion?.icon || ''
      });

  // Champion selection handler
  const handleSelectChampion = (champ: Champion) => {
    soundManager.playChampLock(settings.soundVolume);
    setSelectedChampionKey(champ.key);
    setPreviewSkin(champ.skins[0] || null);
    setCurrentStep(2); // Automatically advance to Step 2
    addLog('info', `Campeão selecionado para background: ${champ.name} (${champ.skins.length} skins disponíveis)`);
  };

  // Skin selection handler
  const handleSelectSkin = (skin: Skin) => {
    soundManager.playClick(settings.soundVolume);
    setPreviewSkin(skin);
  };

  // Apply background to LCU and local state
  const handleApplyBackground = async () => {
    if (!activeSkin || !selectedChampion) return;
    
    soundManager.playChampLock(settings.soundVolume);
    setIsApplying(true);
    setAppliedNotification(null);

    const fullSkinId = selectedChampion.id * 1000 + activeSkin.num;

    // Check if running inside Python Desktop app (PyWebView)
    const pywebview = (window as unknown as { pywebview?: { api?: { set_background_skin?: (id: number) => Promise<boolean> } } }).pywebview;

    if (pywebview && pywebview.api && typeof pywebview.api.set_background_skin === 'function') {
      try {
        addLog('lcu', `POST /lol-summoner/v1/current-summoner/summoner-profile {"key": "backgroundSkinId", "value": ${fullSkinId}}`);
        const result = await pywebview.api.set_background_skin(fullSkinId);
        
        if (result) {
          applyLocalState(fullSkinId);
          addLog('success', ` Placa de perfil atualizada no League of Legends com "${activeSkin.name}" (ID ${fullSkinId})!`);
        } else {
          addLog('error', `Falha ao aplicar skin ID ${fullSkinId}. Certifique-se de que o LoL está aberto.`);
        }
      } catch (err) {
        addLog('error', `Erro na chamada LCU: ${String(err)}`);
      } finally {
        setIsApplying(false);
      }
    } else {
      // Browser preview mode simulation
      addLog('lcu', `POST /lol-summoner/v1/current-summoner/summoner-profile {"key": "backgroundSkinId", "value": ${fullSkinId}}`);
      
      setTimeout(() => {
        applyLocalState(fullSkinId);
        setIsApplying(false);
        addLog('success', ` Background de perfil atualizado para: "${activeSkin.name}" (${selectedChampion.name})!`);
      }, 700);
    }
  };

  const applyLocalState = (fullSkinId: number) => {
    updateSettings({
      selectedBackgroundSkinId: fullSkinId,
      selectedBackgroundSkinName: activeSkin.name,
      selectedBackgroundChampName: selectedChampion.name,
      selectedBackgroundSplashUrl: activeSkin.splashUrl
    });

    setProfile(prev => ({
      ...prev,
      backgroundSkinId: fullSkinId,
      backgroundSplashUrl: activeSkin.splashUrl
    }));

    setAppliedNotification(`"${activeSkin.name}" aplicada com sucesso no seu perfil do LoL!`);
    setTimeout(() => setAppliedNotification(null), 5000);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fda4af', '#f8fafc']
      });
    } catch {
      // ignore
    }
  };

  // Filter champions
  const filteredChampions = CHAMPIONS_LIST.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || c.roles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Bento Tile */}
      <div className="bento-card p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[10px] font-bold tracking-widest uppercase">
              <Palette className="w-3 h-3 text-rose-400" />
              Módulo 4 // Background Changer LCU
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#f8fafc]">
              PERSONALIZADOR DE BACKGROUND DO PERFIL
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Altere a splash art de fundo do seu perfil no cliente do League of Legends. Escolha <strong>qualquer skin de qualquer campeão</strong> existente no jogo — mesmo que você não a possua na conta!
            </p>
          </div>

          {/* Quick Step Indicators */}
          <div className="flex items-center gap-2 bg-[#07090e] p-1.5 rounded-lg border border-rose-950/60 shrink-0">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-cinzel font-bold transition-all cursor-pointer ${
                currentStep === 1
                  ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>1. Escolher Campeão</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-cinzel font-bold transition-all cursor-pointer ${
                currentStep === 2
                  ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>2. Escolher Skin ({selectedChampion.name})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {appliedNotification && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-scaleIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{appliedNotification}</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600/40 text-emerald-300">
            LCU INJECTED
          </span>
        </div>
      )}

      {/* STEP 1: CHOOSE CHAMPION */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="bento-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950/60 pb-3">
              <div>
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                  PASSO 1: ESCOLHA O CAMPEÃO
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clique no campeão desejado para carregar todas as suas skins e splash arts.
                </p>
              </div>

              {/* Roles Filter */}
              <div className="flex flex-wrap gap-1">
                {(['ALL', 'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold transition-all cursor-pointer ${
                      selectedRole === role
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-[#07090e] text-slate-400 hover:text-white border border-rose-950/60'
                    }`}
                  >
                    {role === 'ALL' ? 'TODOS' : role === 'SUPPORT' ? 'SUP' : role}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                id="search-champion-background-input"
                type="text"
                placeholder="Buscar campeão por nome ou título (ex: Zed, Yasuo, Jinx, Aatrox, Ahri)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#07090e] border border-rose-950/80 rounded-lg text-xs text-slate-200 focus:border-rose-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕ Limpar
                </button>
              )}
            </div>

            {/* Champions Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 max-h-[460px] overflow-y-auto p-1 pr-2">
              {filteredChampions.map((champ) => {
                const isSelected = selectedChampionKey === champ.key;
                return (
                  <button
                    key={champ.id}
                    id={`champ-btn-${champ.key}`}
                    onClick={() => handleSelectChampion(champ)}
                    className={`group p-2 rounded-lg border transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer relative ${
                      isSelected
                        ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)] ring-1 ring-rose-500'
                        : 'bg-[#07090e] border-rose-950/60 hover:border-rose-500/80 hover:bg-rose-950/30'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-rose-900/40 relative">
                      <img
                        src={champ.icon}
                        alt={champ.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-cinzel font-bold text-slate-200 group-hover:text-rose-300 truncate max-w-full">
                      {champ.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 bg-black/50 px-1.5 py-0.2 rounded border border-rose-950/40">
                      {champ.skins.length} skins
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-rose-950/60 font-rajdhani">
              <span>{filteredChampions.length} Campeões disponíveis</span>
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Clique em qualquer campeão para escolher a skin no Passo 2
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE SKIN OF SELECTED CHAMPION */}
      {currentStep === 2 && (
        <div className="space-y-4">
          
          {/* Selected Champion Bar with "Trocar Campeão" Action */}
          <div className="bento-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-rose-900/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg overflow-hidden border-2 border-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.4)]">
                <img
                  src={selectedChampion.icon}
                  alt={selectedChampion.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Campeão Selecionado</div>
                <div className="flex items-center gap-2">
                  <h3 className="font-cinzel text-lg font-bold text-white">{selectedChampion.name}</h3>
                  <span className="text-xs text-slate-400 italic">({selectedChampion.title})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn-back-to-step1"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#07090e] hover:bg-slate-900 text-slate-300 border border-rose-950/80 font-cinzel text-xs uppercase font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Trocar Campeão</span>
              </button>

              <button
                id="btn-apply-skin-direct"
                onClick={handleApplyBackground}
                disabled={isApplying}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                <span>{isApplying ? 'Injetando na LCU...' : 'Aplicar no Client do LoL'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview of LoL Summoner Profile Banner */}
          <div className="bento-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
              <div className="flex items-center gap-2 text-rose-400 font-cinzel font-bold text-xs uppercase tracking-widest">
                <Monitor className="w-4 h-4 text-rose-400" />
                <h3>Preview em Tempo Real // Perfil do LoL</h3>
              </div>
              <span className="text-xs font-bold text-white font-cinzel">{activeSkin.name}</span>
            </div>

            {/* League of Legends Profile Banner Canvas */}
            <div
              className="relative h-48 sm:h-60 rounded-lg overflow-hidden border border-rose-800/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-cover bg-center flex items-end p-4 sm:p-5 transition-all duration-300"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(5,6,8,0.95) 10%, rgba(5,6,8,0.35) 50%, rgba(5,6,8,0.7) 100%), url(${activeSkin.splashUrl})`
              }}
            >
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between w-full gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] bg-black shrink-0">
                    <img
                      src={profile.profileIconUrl}
                      alt="Ícone do Perfil"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel text-lg sm:text-2xl font-black text-white">{profile.summonerName}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-black/70 px-2 py-0.5 rounded border border-amber-500/40">
                        NV. {profile.summonerLevel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-rajdhani mt-0.5 flex items-center gap-2">
                      <span>Plano de Fundo:</span>
                      <strong className="text-rose-300">{activeSkin.name}</strong>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-confirm-skin-banner"
                  onClick={handleApplyBackground}
                  disabled={isApplying}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded font-cinzel uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isApplying ? 'Aplicando...' : 'Confirmar Skin no Perfil'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Skins Gallery Grid */}
          <div className="bento-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-950/60 pb-3">
              <div>
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                  PASSO 2: ESCOLHA A SKIN DE {selectedChampion.name.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clique em qualquer skin para pré-visualizar e aplicar como seu plano de fundo.
                </p>
              </div>
              <span className="text-xs text-rose-400 font-mono font-bold bg-rose-950/80 px-2 py-1 rounded border border-rose-800/60">
                {currentSkins.length} SKINS DISPONÍVEIS
              </span>
            </div>

            {/* Skins Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {currentSkins.map((skin) => {
                const isSelected = activeSkin.num === skin.num;
                const isCurrentlyActiveInProfile = profile.backgroundSkinId === (selectedChampion.id * 1000 + skin.num);

                return (
                  <div
                    key={skin.id || skin.num}
                    id={`skin-card-${skin.num}`}
                    onClick={() => handleSelectSkin(skin)}
                    className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)] bg-rose-950/30'
                        : 'border-rose-950/60 hover:border-rose-700 bg-[#07090e]'
                    }`}
                  >
                    {/* Splash Tile */}
                    <div className="relative h-32 w-full overflow-hidden bg-black">
                      <img
                        src={skin.splashUrl}
                        alt={skin.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />

                      {/* Badges */}
                      {isCurrentlyActiveInProfile && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/90 border border-emerald-400 text-[9px] font-bold text-emerald-300 font-rajdhani">
                          ATUAL NO PERFIL
                        </div>
                      )}

                      {skin.chromas && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-purple-950/90 text-[8px] font-mono text-purple-300 border border-purple-500/40">
                          CHROMAS
                        </div>
                      )}
                    </div>

                    {/* Skin Label & Actions */}
                    <div className="p-3 bg-[#07090e] border-t border-rose-950/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-cinzel line-clamp-1 group-hover:text-rose-300">
                          {skin.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {selectedChampion.id * 1000 + skin.num}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSkin(skin);
                          handleApplyBackground();
                        }}
                        className={`p-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white'
                        }`}
                        title="Aplicar esta skin diretamente"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compliance Guarantee */}
            <div className="p-3 rounded-lg bg-[#07090e] border border-rose-950/80 flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Qualquer skin pode ser utilizada:</strong> A API oficial de perfil do League of Legends permite exibir qualquer splash art de skin no seu perfil sem restrições de inventário.
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
