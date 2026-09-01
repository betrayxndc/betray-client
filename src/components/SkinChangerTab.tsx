import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw, 
  Eye, 
  Palette, 
  ChevronRight, 
  Zap, 
  Monitor, 
  Info,
  Swords,
  Trash2,
  Layers,
  Flame,
  BookmarkCheck,
  BookmarkPlus,
  Tv,
  ArrowRight
} from 'lucide-react';
import { AppSettings, Champion, Skin, LcuLog, Role, GameflowPhase } from '../types';
import { CHAMPIONS_LIST, ROLE_LABELS, getChampionByKey, getChampionById } from '../data/champions';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SkinChangerTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  gameflowPhase: GameflowPhase;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
  onDodge?: () => void;
}

export const SkinChangerTab: React.FC<SkinChangerTabProps> = ({
  settings,
  updateSettings,
  gameflowPhase,
  addLog,
  onDodge
}) => {
  // Navigation mode: 'config' (catalog / pre-game configuration), 'saved_memory' (memory list), 'champ_select' (sync during skin selection)
  const [activeSubView, setActiveSubView] = useState<'config' | 'saved_memory' | 'champ_select'>('config');
  
  // Step in config: 1 = choose champion, 2 = choose skin
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedChampionKey, setSelectedChampionKey] = useState<string>(
    settings.roseCurrentChampionKey || 'Zed'
  );
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChromaIndex, setSelectedChromaIndex] = useState<number | null>(
    settings.roseCurrentChromaId ?? null
  );
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectedNotification, setInjectedNotification] = useState<string | null>(null);
  const [confirmedSkinModal, setConfirmedSkinModal] = useState<{
    championName: string;
    skinName: string;
    skinId: number;
    splashUrl: string;
    chromaName?: string;
  } | null>(null);

  // Live Champ Select Simulation / Hook Selection
  const [champSelectActiveChampKey, setChampSelectActiveChampKey] = useState<string>(
    settings.roseCurrentChampionKey || 'Zed'
  );

  const selectedChampion = useMemo(() => {
    return CHAMPIONS_LIST.find(c => c.key === selectedChampionKey) || CHAMPIONS_LIST[0];
  }, [selectedChampionKey]);

  const championSkins: Skin[] = selectedChampion?.skins || [];

  // Saved skin for current champion
  const savedSkinData = settings.roseSelectedSkins?.[selectedChampionKey];
  const activeSkinNum = savedSkinData?.skinNum ?? 0;
  const activeSkin: Skin = championSkins.find(s => s.num === activeSkinNum) || championSkins[0] || {
    id: 0,
    num: 0,
    name: `${selectedChampion?.name} Padrão`,
    chromas: false,
    splashUrl: selectedChampion?.splash || '',
    uncenteredSplashUrl: selectedChampion?.splash || '',
    tileUrl: selectedChampion?.icon || ''
  };

  const [previewSkin, setPreviewSkin] = useState<Skin>(activeSkin);

  // Sync preview when champion changes
  useEffect(() => {
    const saved = settings.roseSelectedSkins?.[selectedChampionKey];
    if (saved) {
      const found = championSkins.find(s => s.num === saved.skinNum);
      if (found) {
        setPreviewSkin(found);
        setSelectedChromaIndex(saved.chromaId ?? null);
        return;
      }
    }
    setPreviewSkin(championSkins[0] || activeSkin);
    setSelectedChromaIndex(null);
  }, [selectedChampionKey, championSkins]);

  // List of all champions configured in memory
  const savedChampionsList = useMemo(() => {
    const records = (settings.roseSelectedSkins || {}) as Record<string, { skinId: number; skinNum: number; skinName: string; chromaId?: number }>;
    const seen = new Set<string>();
    const list: Array<{ key: string; data: { skinId: number; skinNum: number; skinName: string; chromaId?: number }; champion: Champion }> = [];

    for (const [key, data] of Object.entries(records)) {
      if (!data || typeof data.skinId !== 'number') continue;
      const champ = getChampionByKey(key) || CHAMPIONS_LIST.find(c => c.id === Math.floor(data.skinId / 1000));
      if (champ && !seen.has(champ.key)) {
        seen.add(champ.key);
        list.push({
          key: champ.key,
          data,
          champion: champ
        });
      }
    }
    return list;
  }, [settings.roseSelectedSkins]);

  // Champion selection handler (Step 1 -> Step 2)
  const handleSelectChampion = (champ: Champion) => {
    soundManager.playChampLock(settings.soundVolume);
    setSelectedChampionKey(champ.key);
    const saved = settings.roseSelectedSkins?.[champ.key];
    const targetSkin = saved ? champ.skins.find(s => s.num === saved.skinNum) || champ.skins[0] : champ.skins[0];
    setPreviewSkin(targetSkin);
    setSelectedChromaIndex(saved?.chromaId ?? null);
    setCurrentStep(2);
    setActiveSubView('config');
    addLog('info', `[ROSE ENGINE] Campeão selecionado para pré-configuração: ${champ.name} (${champ.skins.length} skins disponíveis).`, 'ROSE_SKIN_SELECT');
  };

  // Skin selection handler (Step 2) - Immediately selects and arms in memory
  const handleSelectSkin = (skin: Skin, chromaIdx: number | null = null) => {
    soundManager.playChampLock(settings.soundVolume);
    setPreviewSkin(skin);
    setSelectedChromaIndex(chromaIdx);
    handleSaveAndArmSkin(selectedChampion, skin, chromaIdx);
  };

  // Save Skin in Memory and/or Inject (Rose Skin Changer logic)
  const handleSaveAndArmSkin = async (champ = selectedChampion, skin = previewSkin, chromaIdx = selectedChromaIndex) => {
    if (!skin || !champ) return;

    setIsInjecting(true);
    setInjectedNotification(null);

    const fullSkinId = champ.id * 1000 + skin.num;
    const skinName = skin.name;

    // Update settings state with persistent memory
    const updatedSkins = {
      ...(settings.roseSelectedSkins || {}),
      [champ.key]: {
        skinId: fullSkinId,
        skinNum: skin.num,
        skinName: skinName,
        chromaId: chromaIdx ?? undefined
      },
      // Also index by ID for LCU fast-lookup
      [String(champ.id)]: {
        skinId: fullSkinId,
        skinNum: skin.num,
        skinName: skinName,
        chromaId: chromaIdx ?? undefined
      }
    };

    updateSettings({
      roseSelectedSkins: updatedSkins,
      roseCurrentChampionKey: champ.key,
      roseCurrentSkinId: fullSkinId,
      roseCurrentSkinName: skinName,
      roseCurrentChromaId: chromaIdx
    });

    const chromaName = chromaIdx !== null && chromaColors[chromaIdx] ? `Chroma ${chromaColors[chromaIdx].name}` : undefined;

    // Check if running inside Python Desktop app (PyWebView / Rose Engine backend)
    const pywebview = (window as unknown as { pywebview?: { api?: { set_rose_skin?: (champId: number, skinId: number, chromaId: number | null, skinName?: string) => Promise<boolean> } } }).pywebview;

    if (pywebview && pywebview.api && typeof pywebview.api.set_rose_skin === 'function') {
      try {
        addLog('lcu', `[ROSE HOOK] Skin salva na memória & armada: ${champ.name} -> "${skinName}" (SkinID: ${fullSkinId}, Chroma: ${chromaIdx ?? 'Padrão'})`);
        const ok = await pywebview.api.set_rose_skin(champ.id, fullSkinId, chromaIdx, skinName);
        if (ok) {
          showSuccess(champ.name, skinName, fullSkinId, skin.splashUrl, chromaName);
        } else {
          addLog('warning', `Skin "${skinName}" salva na memória. Monitor Rose aplicará na seleção de skins.`);
          showSuccess(champ.name, skinName, fullSkinId, skin.splashUrl, chromaName);
        }
      } catch (err) {
        addLog('error', `Erro na comunicação do Rose Engine: ${String(err)}`);
      } finally {
        setIsInjecting(false);
      }
    } else {
      // Browser preview mode simulation
      addLog('lcu', `[ROSE MEMÓRIA] Skin pré-salva com sucesso: ${champ.name} -> "${skinName}" (ID ${fullSkinId}). Será reaplicada na seleção de skins.`);
      setTimeout(() => {
        setIsInjecting(false);
        showSuccess(champ.name, skinName, fullSkinId, skin.splashUrl, chromaName);
      }, 200);
    }
  };

  // Remove champion skin from memory
  const handleRemoveSavedSkin = (champKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playClick(settings.soundVolume);
    const updated = { ...(settings.roseSelectedSkins || {}) };
    const champ = getChampionByKey(champKey);
    delete updated[champKey];
    if (champ) {
      delete updated[String(champ.id)];
    }
    updateSettings({ roseSelectedSkins: updated });
    addLog('info', `Skin pré-salva de ${champKey} removida da memória do aplicativo.`);
  };

  const showSuccess = (champName: string, skinName: string, skinId: number, splashUrl?: string, chromaName?: string) => {
    setInjectedNotification(`Skin "${skinName}" salva na memória e armada para ${champName}!`);
    setConfirmedSkinModal({
      championName: champName,
      skinName: skinName,
      skinId: skinId,
      splashUrl: splashUrl || previewSkin.splashUrl || '',
      chromaName: chromaName
    });
    addLog('success', `⭐ [CONFIRMAÇÃO] Skin "${skinName}" (ID ${skinId}) salva para ${champName}. Pronta para a tela de seleção!`, 'ROSE_ARMED');
    setTimeout(() => setInjectedNotification(null), 5000);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#e11d48', '#fda4af', '#f43f5e', '#a855f7', '#10b981']
      });
    } catch {
      // ignore
    }
  };

  // Filter champions
  const filteredChampions = useMemo(() => {
    return CHAMPIONS_LIST.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'ALL' || c.roles.includes(selectedRole);
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, selectedRole]);

  // Chromas Mock generation for skins with chromas
  const chromaColors = [
    { name: 'Ruby', color: '#e11d48' },
    { name: 'Emerald', color: '#10b981' },
    { name: 'Sapphire', color: '#3b82f6' },
    { name: 'Tanzanite', color: '#8b5cf6' },
    { name: 'Obsidian', color: '#1f2937' },
    { name: 'Pearl', color: '#f8fafc' },
    { name: 'Rose Quartz', color: '#f472b6' },
    { name: 'Turquoise', color: '#06b6d4' }
  ];

  // Active champ select champion object
  const champSelectChamp = useMemo(() => {
    return CHAMPIONS_LIST.find(c => c.key === champSelectActiveChampKey) || selectedChampion;
  }, [champSelectActiveChampKey, selectedChampion]);

  const champSelectSavedSkin = settings.roseSelectedSkins?.[champSelectChamp.key];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Header Bento Tile */}
      <div className="bento-card p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-rose-400" />
              Módulo 3 // In-Game Skin Changer (Rose Engine)
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#f8fafc]">
              SKIN CHANGER & MEMÓRIA PRÉ-JOGO
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Escolha a skin e o chroma de qualquer campeão <strong>antes do início da partida</strong>. O Betray Client salva suas preferências na memória e <strong>re-seleciona a skin automaticamente ao entrar na tela de seleção</strong>.
            </p>
          </div>

          {/* Master Toggle & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            {/* Master Toggle */}
            <div className="flex items-center gap-3 bg-[#07090e] p-2 px-3 rounded-lg border border-rose-950/60 shadow-md">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${settings.roseSkinChangerEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Rose Changer</div>
                  <div className="text-xs font-bold text-[#f8fafc] uppercase tracking-wide">
                    {settings.roseSkinChangerEnabled ? 'Ativado' : 'Desativado'}
                  </div>
                </div>
              </div>
              <button
                id="toggle-rose-skin-changer"
                onClick={() => {
                  soundManager.playClick(settings.soundVolume);
                  const next = !settings.roseSkinChangerEnabled;
                  updateSettings({ roseSkinChangerEnabled: next });
                  addLog('info', `Rose Skin Changer alternado para: ${next ? 'LIGADO' : 'DESLIGADO'}`);
                }}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  settings.roseSkinChangerEnabled ? 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.roseSkinChangerEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sub-Views Pills */}
            <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-lg border border-rose-950/60">
              <button
                onClick={() => {
                  soundManager.playClick(settings.soundVolume);
                  setActiveSubView('config');
                }}
                className={`px-3 py-1.5 rounded text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubView === 'config'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Escolher Skin</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick(settings.soundVolume);
                  setActiveSubView('saved_memory');
                }}
                className={`px-3 py-1.5 rounded text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubView === 'saved_memory'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-rose-300" />
                <span>Memória ({savedChampionsList.length})</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick(settings.soundVolume);
                  setActiveSubView('champ_select');
                }}
                className={`px-3 py-1.5 rounded text-xs font-cinzel font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubView === 'champ_select'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-emerald-400" />
                <span>Seleção de Skins</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert & Confirmation Card */}
      {confirmedSkinModal && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#0b0f19] via-rose-950/40 to-[#0b0f19] border-2 border-rose-500/80 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(225,29,72,0.3)] animate-scaleIn relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            {confirmedSkinModal.splashUrl ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-rose-500 shadow-md shrink-0 bg-black">
                <img
                  src={confirmedSkinModal.splashUrl}
                  alt={confirmedSkinModal.skinName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-rose-950 border border-rose-500 flex items-center justify-center shrink-0 text-2xl">
                🌸
              </div>
            )}
            
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Skin Armada no Betray Client
                </span>
                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600/40 font-bold">
                  LCU PRONTA
                </span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-cinzel tracking-wide">
                {confirmedSkinModal.skinName}
              </div>
              <div className="text-xs text-slate-300 font-rajdhani flex items-center gap-2">
                <span className="text-rose-300 font-bold">{confirmedSkinModal.championName}</span>
                <span>•</span>
                <span className="font-mono text-slate-400 text-[11px]">Skin ID: {confirmedSkinModal.skinId}</span>
                {confirmedSkinModal.chromaName && (
                  <>
                    <span>•</span>
                    <span className="text-purple-300 font-mono text-[11px]">{confirmedSkinModal.chromaName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative z-10">
            <span className="hidden md:inline-block text-[11px] text-slate-400 italic">
              Injeção automática ativa no Champ Select
            </span>
            <button
              onClick={() => setConfirmedSkinModal(null)}
              className="px-3 py-1.5 rounded-lg bg-[#07090e] hover:bg-slate-800 text-slate-300 border border-rose-900/60 font-cinzel text-xs font-bold transition-all cursor-pointer"
            >
              OK, Entendido ✕
            </button>
          </div>
        </div>
      )}

      {injectedNotification && !confirmedSkinModal && (
        <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-scaleIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{injectedNotification}</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-600/40 text-emerald-300">
            SALVO NA MEMÓRIA
          </span>
        </div>
      )}

      {/* SUBVIEW 1: CATALOG & PRE-MATCH CONFIGURATION */}
      {activeSubView === 'config' && (
        <div className="space-y-4">
          
          {/* Top Quick Bar: Steps + Security Status */}
          <div className="p-3 rounded-lg bg-[#07090e] border border-rose-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-400 shrink-0">
                <BookmarkPlus className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white">Pré-Configuração Permanente:</strong>
                <span className="text-slate-400 ml-1">
                  Skins salvas aqui são memorizadas no seu cliente e ativadas automaticamente ao jogar com o campeão.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(1)}
                className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold cursor-pointer transition-all ${
                  currentStep === 1 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                1. Campeão
              </button>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <button
                onClick={() => setCurrentStep(2)}
                className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold cursor-pointer transition-all ${
                  currentStep === 2 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                2. Skin ({selectedChampion.name})
              </button>
            </div>
          </div>

          {/* STEP 1: CHOOSE CHAMPION */}
          {currentStep === 1 && (
            <div className="bento-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950/60 pb-3">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                    PASSO 1: ESCOLHA O CAMPEÃO PARA SALVAR A SKIN
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Todos os 169 campeões do League of Legends disponíveis na base com skins oficiais em português.
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
                  id="search-rose-champion-input"
                  type="text"
                  placeholder="Buscar campeão (ex: Ambessa, Smolder, Hwei, Briar, Zed, Yasuo, Aatrox, Vayne, Jinx, Ahri)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#07090e] border border-rose-950/80 rounded-lg text-xs text-slate-200 focus:border-rose-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕ Limpar
                  </button>
                )}
              </div>

              {/* Champions Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 max-h-[460px] overflow-y-auto p-1 pr-2">
                {filteredChampions.map((champ) => {
                  const isSelected = selectedChampionKey === champ.key;
                  const savedSkin = settings.roseSelectedSkins?.[champ.key];

                  return (
                    <button
                      key={champ.id}
                      id={`rose-champ-btn-${champ.key}`}
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
                        {savedSkin && (
                          <div className="absolute top-0.5 right-0.5 px-1 py-0.2 rounded bg-emerald-950/90 border border-emerald-400 text-[8px] font-mono text-emerald-300 font-bold">
                            SALVA
                          </div>
                        )}
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
                <span>{filteredChampions.length} Campeões disponíveis na database completa do Betray Client</span>
                <span className="text-rose-400 font-medium flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Clique no campeão para avançar e salvar a skin
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE SKIN OF SELECTED CHAMPION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              
              {/* Top Control Bar with Champion Switcher */}
              <div className="bento-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-rose-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.4)]">
                    <img
                      src={selectedChampion.icon}
                      alt={selectedChampion.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <span>Campeão Selecionado</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-emerald-400 font-mono">
                        {savedSkinData ? `Skin Salva: ${savedSkinData.skinName}` : 'Nenhuma skin pré-salva ainda'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-cinzel text-lg font-bold text-white">{selectedChampion.name}</h3>
                      <span className="text-xs text-slate-400 italic">({selectedChampion.title})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    id="btn-rose-back-to-step1"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#07090e] hover:bg-slate-900 text-slate-300 border border-rose-950/80 font-cinzel text-xs uppercase font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Trocar Campeão</span>
                  </button>

                  <button
                    id="btn-lock-rose-skin-direct"
                    onClick={() => handleSaveAndArmSkin(selectedChampion, previewSkin, selectedChromaIndex)}
                    disabled={isInjecting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer transition-all disabled:opacity-50"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-rose-200" />
                    <span>{isInjecting ? 'Salvando...' : 'Salvar Skin na Memória'}</span>
                  </button>
                </div>
              </div>

              {/* In-Game Splash Preview & Chroma Selector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Left: Large Splash Showcase */}
                <div className="lg:col-span-8 bento-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
                    <div className="flex items-center gap-2 text-rose-400 font-cinzel font-bold text-xs uppercase tracking-widest">
                      <Monitor className="w-4 h-4 text-rose-400" />
                      <h3>Visualizador de Splash & Render</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-cinzel">{previewSkin.name}</span>
                      {selectedChromaIndex !== null && (
                        <span className="text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-600/50">
                          Chroma #{selectedChromaIndex + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Splash Art Stage */}
                  <div
                    className={`relative h-56 sm:h-72 rounded-lg overflow-hidden border transition-all duration-300 bg-cover bg-center flex items-end p-4 sm:p-5 ${
                      savedSkinData?.skinNum === previewSkin.num
                        ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/50'
                        : 'border-rose-800/60 shadow-[0_0_25px_rgba(0,0,0,0.8)]'
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(5,6,8,0.95) 15%, rgba(5,6,8,0.25) 50%, rgba(5,6,8,0.6) 100%), url(${previewSkin.splashUrl})`
                    }}
                  >
                    {/* Live confirmation badge overlay */}
                    {savedSkinData?.skinNum === previewSkin.num && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.6)] backdrop-blur-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span>✓ SKIN ATIVA & ARMADA NA MEMÓRIA</span>
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between w-full gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-950">
                            SKIN ID: {selectedChampion.id * 1000 + previewSkin.num}
                          </span>
                          {previewSkin.chromas && (
                            <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50">
                              CHROMAS DISPONÍVEIS
                            </span>
                          )}
                        </div>
                        <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white mt-1">
                          {previewSkin.name}
                        </h2>
                        <p className="text-xs text-slate-300 font-rajdhani">
                          Salva na memória: será aplicada automaticamente ao selecionar <strong className="text-rose-300">{selectedChampion.name}</strong>.
                        </p>
                      </div>

                      <button
                        id="btn-rose-confirm-stage"
                        onClick={() => handleSaveAndArmSkin(selectedChampion, previewSkin, selectedChromaIndex)}
                        disabled={isInjecting}
                        className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-lg font-cinzel uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                          savedSkinData?.skinNum === previewSkin.num
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400'
                            : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                        }`}
                      >
                        {savedSkinData?.skinNum === previewSkin.num ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>✓ Salva na Memória</span>
                          </>
                        ) : (
                          <>
                            <BookmarkCheck className="w-4 h-4" />
                            <span>{isInjecting ? 'Salvando...' : 'Salvar Esta Skin'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Chroma Selector Palette */}
                  {previewSkin.chromas && (
                    <div className="p-3 rounded-lg bg-[#07090e] border border-purple-950/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-cinzel font-bold text-purple-300 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-purple-400" />
                          Seletor de Chromas
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedChromaIndex !== null ? chromaColors[selectedChromaIndex]?.name : 'Padrão (Sem Chroma)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedChromaIndex(null);
                            handleSaveAndArmSkin(selectedChampion, previewSkin, null);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                            selectedChromaIndex === null
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Padrão
                        </button>
                        {chromaColors.map((c, idx) => (
                          <button
                            key={c.name}
                            onClick={() => {
                              setSelectedChromaIndex(idx);
                              handleSaveAndArmSkin(selectedChampion, previewSkin, idx);
                            }}
                            className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative ${
                              selectedChromaIndex === idx
                                ? 'scale-110 border-white shadow-[0_0_10px_rgba(255,255,255,0.6)] ring-2 ring-purple-500'
                                : 'border-slate-700 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={`Chroma ${c.name} (Clique para salvar)`}
                          >
                            {selectedChromaIndex === idx && (
                              <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Rose Engine In-Game Telemetry & Champ Select Hook */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Champ Select Real-time Status Card */}
                  <div className="bento-card p-4 space-y-3 border border-rose-900/60">
                    <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
                      <div className="flex items-center gap-2 text-rose-400 font-cinzel font-bold text-xs uppercase tracking-widest">
                        <Zap className="w-4 h-4 text-rose-400" />
                        <h3>Hook Seleção de Campeões</h3>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/40">
                        AUTO RE-SELECT
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ao travar <strong>{selectedChampion.name}</strong> na seleção de campeões, o cliente carrega a skin pré-configurada automaticamente da memória.
                    </p>

                    <div className="p-2.5 rounded bg-[#07090e] border border-rose-950/60 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-rajdhani">Fase LCU:</span>
                        <span className="font-mono text-emerald-400 font-bold">{gameflowPhase}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-rajdhani">Skin Pré-Salva:</span>
                        <span className="font-mono text-rose-300 font-bold truncate max-w-[140px]">
                          {savedSkinData ? savedSkinData.skinName : previewSkin.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-rajdhani">Status Memória:</span>
                        <span className="font-mono text-emerald-400">
                          {savedSkinData ? '✓ Salva no Armazenamento' : 'Pendente de Confirmação'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSubView('champ_select')}
                      className="w-full py-2 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>Ir para Tela de Seleção de Skins</span>
                    </button>
                  </div>

                  {/* Quick specs */}
                  <div className="bento-card p-4 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2 text-slate-200 font-cinzel font-bold border-b border-rose-950/60 pb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Segurança Client-Side</span>
                    </div>
                    <div className="space-y-1 text-[11px] font-mono">
                      <div>• Memória: <span className="text-rose-400">Persistente (settings.json)</span></div>
                      <div>• Hook: <span className="text-emerald-400">ChampSelect Auto-Trigger</span></div>
                      <div>• Injeção: <span className="text-slate-200">Local Rendering</span></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Skins Gallery Grid */}
              <div className="bento-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-950/60 pb-3">
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                      TODAS AS SKINS DE {selectedChampion.name.toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Clique em qualquer skin para selecioná-la e salvá-la instantaneamente na memória.
                    </p>
                  </div>
                  <span className="text-xs text-rose-400 font-mono font-bold bg-rose-950/80 px-2 py-1 rounded border border-rose-800/60 self-start sm:self-auto">
                    {championSkins.length} SKINS DESBLOQUEADAS
                  </span>
                </div>

                {/* Instant Confirmation Banner if skin is armed */}
                {savedSkinData && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-[#07090e] to-rose-950/80 border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-400 shrink-0 bg-black shadow-md">
                        <img src={previewSkin.splashUrl} alt={savedSkinData.skinName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>CONFIRMAÇÃO VISUAL // SKIN SALVA & ARMADA</span>
                        </div>
                        <div className="text-sm font-bold text-white font-cinzel truncate">
                          {savedSkinData.skinName} <span className="text-xs font-mono text-emerald-300 font-normal">(ID {savedSkinData.skinId})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-500/60 font-mono text-[10px] font-bold shadow-sm">
                        ✓ AUTO-SELECT PRONTO
                      </span>
                    </div>
                  </div>
                )}

                {/* Skins Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {championSkins.map((skin) => {
                    const isSelected = previewSkin.num === skin.num;
                    const isSaved = savedSkinData?.skinNum === skin.num;

                    return (
                      <div
                        key={skin.id || skin.num}
                        id={`rose-skin-card-${skin.num}`}
                        onClick={() => handleSelectSkin(skin)}
                        className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all ${
                          isSaved
                            ? 'border-emerald-400 ring-2 ring-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)] bg-emerald-950/30'
                            : isSelected
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
                          {isSaved && (
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-emerald-950/95 border border-emerald-400 text-[10px] font-bold text-emerald-200 font-cinzel flex items-center gap-1 shadow-lg backdrop-blur-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ ATIVA & SALVA</span>
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
                            <div className={`text-xs font-bold font-cinzel line-clamp-1 ${isSaved ? 'text-emerald-300' : 'text-slate-100 group-hover:text-rose-300'}`}>
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
                              handleSaveAndArmSkin(selectedChampion, skin, selectedChromaIndex);
                            }}
                            className={`p-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                                : isSelected
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white'
                            }`}
                            title={isSaved ? "Skin salva na memória" : "Salvar esta skin na memória"}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 2: SAVED IN MEMORY LIST */}
      {activeSubView === 'saved_memory' && (
        <div className="space-y-4">
          <div className="bento-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950/60 pb-3">
              <div>
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-rose-400" />
                  SKINS PRÉ-CONFIGURADAS NA MEMÓRIA DO BETRAY ({savedChampionsList.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Estas skins serão selecionadas automaticamente quando você travar qualquer um desses campeões.
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick(settings.soundVolume);
                  setCurrentStep(1);
                  setActiveSubView('config');
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Configurar Novo Campeão</span>
              </button>
            </div>

            {savedChampionsList.length === 0 ? (
              <div className="p-8 rounded-lg bg-[#07090e] border border-dashed border-rose-950 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
                  <BookmarkPlus className="w-6 h-6" />
                </div>
                <h4 className="font-cinzel text-sm font-bold text-white">Nenhuma skin pré-salva na memória</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Vá até a aba "Escolher Skin", selecione seus campeões favoritos e salve suas skins preferidas para que elas sejam aplicadas automaticamente!
                </p>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveSubView('config');
                  }}
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-cinzel uppercase cursor-pointer"
                >
                  Abrir Catálogo de Campeões
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {savedChampionsList.map(({ key, data, champion }) => {
                  if (!champion) return null;
                  const skin = champion.skins.find(s => s.num === data.skinNum) || champion.skins[0];

                  return (
                    <div
                      key={key}
                      className="bento-card p-3.5 border border-rose-950/80 hover:border-rose-600/60 transition-all space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={champion.icon}
                            alt={champion.name}
                            className="w-10 h-10 rounded-lg border border-rose-600/40 object-cover"
                          />
                          <div>
                            <h4 className="font-cinzel text-sm font-bold text-white">{champion.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{champion.title}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleRemoveSavedSkin(champion.key, e)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remover skin pré-salva deste campeão"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="relative h-24 rounded-md overflow-hidden bg-black border border-rose-950">
                        <img
                          src={skin?.splashUrl || champion.splash}
                          alt={data.skinName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-2">
                          <div className="w-full">
                            <div className="text-[11px] font-bold text-rose-300 font-cinzel truncate">
                              {data.skinName}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                              <span>ID {data.skinId}</span>
                              {data.chromaId !== undefined && (
                                <span className="text-purple-300 font-bold">Chroma #{data.chromaId + 1}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-rose-950/60">
                        <button
                          onClick={() => {
                            setSelectedChampionKey(champion.key);
                            setCurrentStep(2);
                            setActiveSubView('config');
                          }}
                          className="flex-1 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-cinzel font-bold uppercase transition-colors cursor-pointer text-center"
                        >
                          Alterar Skin
                        </button>
                        <button
                          onClick={() => {
                            setChampSelectActiveChampKey(champion.key);
                            setActiveSubView('champ_select');
                          }}
                          className="px-2.5 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px] font-cinzel font-bold uppercase transition-colors cursor-pointer"
                          title="Testar na tela de seleção de skins"
                        >
                          Ver no Champ Select
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: CHAMP SELECT / SKIN SELECTION SCREEN SYNC */}
      {activeSubView === 'champ_select' && (
        <div className="space-y-4">
          <div className="bento-card p-5 space-y-4 border border-rose-900/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-950/60 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold tracking-widest uppercase">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Hook em Tempo Real // Seleção de Skins
                </div>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white mt-1">
                  TELA DE SELEÇÃO DE SKINS (CHAMP SELECT)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ao selecionar um campeão na partida, o Betray recupera a skin salva na memória e a ativa no jogo. Você também pode trocar ou re-selecionar a skin instantaneamente aqui.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-700/40">
                  FASE: {gameflowPhase}
                </span>
                {onDodge && (
                  <button
                    onClick={onDodge}
                    className="px-3 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Dodge
                  </button>
                )}
              </div>
            </div>

            {/* Quick Champ Switcher (For testing and in-match fast selection) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-cinzel font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Campeão Atual na Seleção:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {champSelectChamp.name} ({champSelectChamp.title})
                </span>
              </div>

              {/* Quick horizontal champion pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-1">
                {CHAMPIONS_LIST.slice(0, 18).map((champ) => {
                  const isCur = champSelectChamp.key === champ.key;
                  const hasSaved = !!settings.roseSelectedSkins?.[champ.key];

                  return (
                    <button
                      key={champ.id}
                      onClick={() => {
                        soundManager.playClick(settings.soundVolume);
                        setChampSelectActiveChampKey(champ.key);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                        isCur
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-1 ring-white/30'
                          : 'bg-[#07090e] text-slate-300 border-rose-950/80 hover:border-rose-700 hover:text-white'
                      }`}
                    >
                      <img
                        src={champ.icon}
                        alt={champ.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{champ.name}</span>
                      {hasSaved && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Champion Skin Picker in Champ Select */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
              
              {/* Left: Active Skin Status Stage */}
              <div className="lg:col-span-6 bento-card p-4 space-y-3 border border-rose-900/50">
                <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
                  <span className="font-cinzel font-bold text-xs text-slate-200">
                    Skin Pronta para Injeção
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                    {champSelectSavedSkin ? 'Memória Ativa' : 'Padrão'}
                  </span>
                </div>

                {/* Display active skin */}
                {(() => {
                  const skin = champSelectSavedSkin 
                    ? champSelectChamp.skins.find(s => s.num === champSelectSavedSkin.skinNum) || champSelectChamp.skins[0]
                    : champSelectChamp.skins[0];

                  return (
                    <div
                      className="relative h-48 rounded-lg overflow-hidden border border-rose-800/60 bg-cover bg-center flex items-end p-4 shadow-lg"
                      style={{
                        backgroundImage: `linear-gradient(to top, rgba(5,6,8,0.95) 20%, rgba(5,6,8,0.3) 60%, rgba(5,6,8,0.6) 100%), url(${skin.splashUrl})`
                      }}
                    >
                      <div className="relative z-10 w-full flex items-end justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-rose-400 font-bold">
                            SKIN ID: {champSelectChamp.id * 1000 + skin.num}
                          </div>
                          <h3 className="font-cinzel text-lg font-bold text-white">
                            {skin.name}
                          </h3>
                          <p className="text-[11px] text-slate-300">
                            {champSelectSavedSkin ? '✓ Recuperada da memória permanente' : 'Skin padrão do campeão'}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSaveAndArmSkin(champSelectChamp, skin)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded font-cinzel uppercase tracking-wider cursor-pointer shadow-md"
                        >
                          Re-selecionar
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div className="p-3 rounded bg-[#07090e] border border-rose-950/80 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Campeão:</span>
                    <span className="font-bold text-white">{champSelectChamp.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skin Configurada:</span>
                    <span className="font-mono text-rose-300 font-bold">
                      {champSelectSavedSkin?.skinName || `${champSelectChamp.name} Clássico(a)`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Modo de Aplicação:</span>
                    <span className="font-mono text-emerald-400 font-bold">Ao Iniciar Partida (Rose Engine)</span>
                  </div>
                </div>
              </div>

              {/* Right: Instant Skin Switcher Grid */}
              <div className="lg:col-span-6 bento-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-950/60 pb-2">
                  <span className="font-cinzel font-bold text-xs text-slate-200">
                    Trocar Skin Rapidamente no Champ Select
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {champSelectChamp.skins.length} Opções
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                  {champSelectChamp.skins.map((skin) => {
                    const isCur = champSelectSavedSkin?.skinNum === skin.num;

                    return (
                      <button
                        key={skin.id || skin.num}
                        onClick={() => handleSaveAndArmSkin(champSelectChamp, skin)}
                        className={`p-2 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer relative ${
                          isCur
                            ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                            : 'bg-[#07090e] border-rose-950/80 hover:border-rose-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="h-14 w-full rounded overflow-hidden bg-black relative">
                          <img
                            src={skin.splashUrl}
                            alt={skin.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isCur && (
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-950/95 border border-emerald-400 text-[8px] font-bold text-emerald-300 font-mono">
                              ✓ ATIVA
                            </div>
                          )}
                        </div>
                        <div className={`text-[11px] font-bold font-cinzel line-clamp-1 ${isCur ? 'text-emerald-300' : 'text-white'}`}>
                          {skin.name}
                        </div>
                        <div className={`text-[9px] font-mono ${isCur ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                          {isCur ? '✓ Selecionada no LoL' : 'Clique p/ Selecionar'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FIXED FLOATING TOAST NOTIFICATION (BOTTOM-RIGHT) */}
      {confirmedSkinModal && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slideUp pointer-events-auto">
          <div className="p-4 rounded-xl bg-[#07090e]/95 backdrop-blur-md border-2 border-rose-500 shadow-[0_0_35px_rgba(225,29,72,0.45)] text-white relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-rose-500 shrink-0 bg-black shadow-md">
                <img
                  src={confirmedSkinModal.splashUrl}
                  alt={confirmedSkinModal.skinName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Skin Armada no Betray
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600/40 font-bold">
                    LCU PRONTA
                  </span>
                </div>
                <div className="text-sm font-bold text-white font-cinzel truncate">
                  {confirmedSkinModal.skinName}
                </div>
                <div className="text-xs text-slate-300 font-rajdhani flex items-center gap-1.5 truncate">
                  <span className="text-rose-300 font-bold">{confirmedSkinModal.championName}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400 text-[11px]">ID: {confirmedSkinModal.skinId}</span>
                  {confirmedSkinModal.chromaName && (
                    <>
                      <span>•</span>
                      <span className="text-purple-300 font-mono text-[11px]">{confirmedSkinModal.chromaName}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setConfirmedSkinModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Fechar notificação"
              >
                ✕
              </button>
            </div>
            <div className="mt-2.5 pt-2 border-t border-rose-950/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 text-[10px]">
                Auto-seleção pronta para o Champ Select
              </span>
              <button
                onClick={() => {
                  setConfirmedSkinModal(null);
                  setActiveSubView('champ_select');
                }}
                className="text-rose-400 hover:text-rose-300 font-bold font-cinzel text-[11px] underline cursor-pointer"
              >
                Ver na Seleção de Skins →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
