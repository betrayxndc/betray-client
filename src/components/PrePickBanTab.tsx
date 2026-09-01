import React, { useState } from 'react';
import { 
  Crosshair, 
  ShieldAlert, 
  Search, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Play, 
  ShieldCheck, 
  Info,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { AppSettings, Role, Champion, LcuLog } from '../types';
import { CHAMPIONS_LIST, ROLE_LABELS, getChampionById } from '../data/champions';
import { soundManager } from '../utils/audio';

interface PrePickBanTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
  onDodge?: () => void;
}

export const PrePickBanTab: React.FC<PrePickBanTabProps> = ({
  settings,
  updateSettings,
  addLog,
  onDodge
}) => {
  const [subTab, setSubTab] = useState<'pick' | 'ban'>('pick');
  const [selectedRole, setSelectedRole] = useState<Role>('MID');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'pick' | 'ban'>('pick');
  const [replacingSlotIndex, setReplacingSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Simulation states
  const [isSimulatingPick, setIsSimulatingPick] = useState(false);
  const [simulationResultPick, setSimulationResultPick] = useState<string | null>(null);
  const [isSimulatingBan, setIsSimulatingBan] = useState(false);
  const [simulationResultBan, setSimulationResultBan] = useState<string | null>(null);

  const roles: Role[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  const currentRolePickList = settings.prePickChampions[selectedRole] || [];
  const currentBanList = settings.preBanChampions || [];

  const handleOpenChampionModal = (mode: 'pick' | 'ban', slotIndex: number) => {
    soundManager.playClick(settings.soundVolume);
    setModalMode(mode);
    setReplacingSlotIndex(slotIndex);
    setIsModalOpen(true);
    setSearchQuery('');
  };

  const handleSelectChampion = (champion: Champion) => {
    soundManager.playChampLock(settings.soundVolume);

    if (modalMode === 'pick') {
      const updatedList = [...currentRolePickList];
      if (replacingSlotIndex !== null && replacingSlotIndex < updatedList.length) {
        updatedList[replacingSlotIndex] = champion.id;
      } else if (updatedList.length < 5) {
        if (!updatedList.includes(champion.id)) {
          updatedList.push(champion.id);
        }
      }
      const newPrePick = {
        ...settings.prePickChampions,
        [selectedRole]: updatedList
      };
      updateSettings({ prePickChampions: newPrePick });
      addLog('info', `Pré-Pick atualizado: ${ROLE_LABELS[selectedRole].name} -> ${champion.name} (Auto-Pick Ativo)`);
    } else {
      const updatedList = [...currentBanList];
      if (replacingSlotIndex !== null && replacingSlotIndex < updatedList.length) {
        updatedList[replacingSlotIndex] = champion.id;
      } else if (updatedList.length < 5) {
        if (!updatedList.includes(champion.id)) {
          updatedList.push(champion.id);
        }
      }
      updateSettings({ preBanChampions: updatedList });
      addLog('info', `Pré-Ban atualizado: ${champion.name} adicionado à lista de banimento automático.`);
    }

    setIsModalOpen(false);
    setReplacingSlotIndex(null);
  };

  const handleRemovePickChampion = (index: number) => {
    soundManager.playClick(settings.soundVolume);
    const updatedList = currentRolePickList.filter((_, i) => i !== index);
    updateSettings({
      prePickChampions: {
        ...settings.prePickChampions,
        [selectedRole]: updatedList
      }
    });
  };

  const handleRemoveBanChampion = (index: number) => {
    soundManager.playClick(settings.soundVolume);
    const updatedList = currentBanList.filter((_, i) => i !== index);
    updateSettings({ preBanChampions: updatedList });
  };

  const handleMovePickPriority = (index: number, direction: 'up' | 'down') => {
    soundManager.playClick(settings.soundVolume);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentRolePickList.length) return;

    const updated = [...currentRolePickList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updateSettings({
      prePickChampions: {
        ...settings.prePickChampions,
        [selectedRole]: updated
      }
    });
  };

  const handleMoveBanPriority = (index: number, direction: 'up' | 'down') => {
    soundManager.playClick(settings.soundVolume);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBanList.length) return;

    const updated = [...currentBanList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updateSettings({ preBanChampions: updated });
  };

  // Quick Direct Pick from grid
  const handleDirectAdd = (champion: Champion, mode: 'pick' | 'ban') => {
    soundManager.playChampLock(settings.soundVolume);
    if (mode === 'pick') {
      if (!currentRolePickList.includes(champion.id) && currentRolePickList.length < 5) {
        const updated = [...currentRolePickList, champion.id];
        updateSettings({
          prePickChampions: {
            ...settings.prePickChampions,
            [selectedRole]: updated
          }
        });
        addLog('success', `Pré-Pick adicionado: ${champion.name} na rota ${ROLE_LABELS[selectedRole].name}`);
      }
    } else {
      if (!currentBanList.includes(champion.id) && currentBanList.length < 5) {
        const updated = [...currentBanList, champion.id];
        updateSettings({ preBanChampions: updated });
        addLog('success', `Pré-Ban adicionado: ${champion.name}`);
      }
    }
  };

  // Test Auto-Pick Simulation
  const handleTestAutoPick = () => {
    if (currentRolePickList.length === 0) {
      addLog('warning', 'Adicione pelo menos 1 campeão para testar o Auto-Pick!');
      return;
    }
    setIsSimulatingPick(true);
    const targetChamp = getChampionById(currentRolePickList[0]);
    addLog('lcu', `[CHAMP SELECT] Sua vez de escolher! Auto-Pick detectado para rota ${ROLE_LABELS[selectedRole].name}`);
    
    setTimeout(() => {
      addLog('lcu', `PATCH /lol-champ-select/v1/session/actions/1 {"championId": ${targetChamp?.id}, "completed": true}`);
      soundManager.playChampLock(settings.soundVolume);
      setIsSimulatingPick(false);
      setSimulationResultPick(`Sucesso! Campeão "${targetChamp?.name}" selecionado e travado automaticamente!`);
      addLog('success', `[LCU] ${targetChamp?.name} foi travado e confirmado automaticamente com sucesso!`);
    }, 1500);
  };

  // Test Auto-Ban Simulation
  const handleTestAutoBan = () => {
    if (currentBanList.length === 0) {
      addLog('warning', 'Adicione pelo menos 1 campeão para testar o Auto-Ban!');
      return;
    }
    setIsSimulatingBan(true);
    const targetChamp = getChampionById(currentBanList[0]);
    addLog('lcu', `[CHAMP SELECT] Fase de Banimento iniciada! Verificando lista de prioridades...`);
    
    setTimeout(() => {
      addLog('lcu', `PATCH /lol-champ-select/v1/session/actions/0 {"championId": ${targetChamp?.id}, "completed": true}`);
      soundManager.playChampLock(settings.soundVolume);
      setIsSimulatingBan(false);
      setSimulationResultBan(`Sucesso! Campeão "${targetChamp?.name}" banido e confirmado automaticamente!`);
      addLog('success', `[LCU] ${targetChamp?.name} foi banido e confirmado automaticamente com sucesso!`);
    }, 1500);
  };

  const filteredChampions = CHAMPIONS_LIST.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || c.roles.includes(roleFilter as Role);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Tab Switcher: Pré-Pick vs Pré-Ban & Dodge */}
      <div className="bento-card p-2 flex flex-col sm:flex-row items-center gap-2 bg-[#07090e]/90">
        <button
          id="btn-subtab-pick"
          onClick={() => {
            soundManager.playClick(settings.soundVolume);
            setSubTab('pick');
          }}
          className={`w-full sm:flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            subTab === 'pick'
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-rose-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span>Módulo Pré-Pick Automático</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${settings.autoPickEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'}`}>
            {settings.autoPickEnabled ? 'ATIVO' : 'DESATIVADO'}
          </span>
        </button>

        <button
          id="btn-subtab-ban"
          onClick={() => {
            soundManager.playClick(settings.soundVolume);
            setSubTab('ban');
          }}
          className={`w-full sm:flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
            subTab === 'ban'
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-rose-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Módulo Pré-Ban Automático</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${settings.autoBanEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'}`}>
            {settings.autoBanEnabled ? 'ATIVO' : 'DESATIVADO'}
          </span>
        </button>

        {onDodge && (
          <button
            id="btn-dodge-pickban"
            onClick={onDodge}
            className="w-full sm:w-auto px-4 py-3 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/80 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow transition-all shrink-0"
            title="Sair da Seleção de Campeões e voltar ao Lobby"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Dodge (Lobby)</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: PRÉ-PICK AUTOMÁTICO */}
      {/* ======================================================== */}
      {subTab === 'pick' && (
        <div className="space-y-4">
          {/* Main Card */}
          <div className="bento-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-950/60 pb-4">
              <div>
                <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest font-mono">
                  MÓDULO DE PRÉ-SELEÇÃO // LCU CHAMP SELECT
                </div>
                <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#f8fafc] mt-0.5 flex items-center gap-2">
                  <span>PRÉ-PICK AUTOMÁTICO POR ROTA</span>
                  <span className="text-xs font-normal text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                    Trava Automática
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Selecione até 5 campeões prioritários para cada rota. Ao entrar na Seleção de Campeões, o Betray Client selecionará e <strong>confirmará o pick automaticamente</strong> na sua vez.
                </p>
              </div>

              {/* Toggle Auto Pick & Lock */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="toggle-auto-pick-btn"
                  onClick={() => {
                    soundManager.playClick(settings.soundVolume);
                    updateSettings({ autoPickEnabled: !settings.autoPickEnabled });
                    addLog('info', `Auto-Pick ${!settings.autoPickEnabled ? 'Ativado' : 'Desativado'}`);
                  }}
                  className={`px-4 py-2 rounded-lg font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    settings.autoPickEnabled
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Auto-Pick: {settings.autoPickEnabled ? 'Ligado' : 'Desligado'}</span>
                </button>

                <button
                  id="toggle-auto-lock-btn"
                  onClick={() => {
                    soundManager.playClick(settings.soundVolume);
                    updateSettings({ autoLockPick: !settings.autoLockPick });
                    addLog('info', `Auto-Lock (Travar Instantâneo) ${!settings.autoLockPick ? 'Ativado' : 'Desativado'}`);
                  }}
                  className={`px-3 py-2 rounded-lg font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    settings.autoLockPick
                      ? 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                      : 'bg-[#07090e] border border-rose-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Travar Instantâneo: {settings.autoLockPick ? 'SIM' : 'NÃO'}</span>
                </button>
              </div>
            </div>

            {/* Role Selectors */}
            <div className="mt-5">
              <div className="text-xs font-bold font-cinzel text-slate-300 uppercase mb-2 flex items-center gap-2">
                <span>Escolha a Rota para Configurar:</span>
                <span className="text-rose-400 font-mono text-[11px]">({ROLE_LABELS[selectedRole].name})</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="role-selector-container">
                {roles.map((role) => {
                  const isSelected = selectedRole === role;
                  const count = (settings.prePickChampions[role] || []).length;
                  return (
                    <button
                      key={role}
                      id={`role-btn-${role.toLowerCase()}`}
                      onClick={() => {
                        soundManager.playClick(settings.soundVolume);
                        setSelectedRole(role);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                          : 'bg-[#07090e] border-rose-950/60 hover:border-rose-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-cinzel text-xs font-bold tracking-wider ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {role}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${count > 0 ? 'bg-rose-900/60 text-rose-300 font-bold' : 'bg-slate-900 text-slate-600'}`}>
                          {count}/5
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 truncate">
                        {ROLE_LABELS[role].name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pick Priority Slots */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase font-cinzel text-slate-200 flex items-center gap-2">
                  <span>Ordem de Prioridade ({ROLE_LABELS[selectedRole].name})</span>
                  <span className="text-slate-500 text-[11px] font-mono font-normal">
                    (Se o #1 estiver banido/escolhido, selecionará o #2...)
                  </span>
                </h3>

                {currentRolePickList.length > 0 && (
                  <button
                    onClick={() => {
                      soundManager.playClick(settings.soundVolume);
                      updateSettings({
                        prePickChampions: {
                          ...settings.prePickChampions,
                          [selectedRole]: []
                        }
                      });
                      addLog('info', `Lista de Pré-Pick para ${ROLE_LABELS[selectedRole].name} foi limpa.`);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Limpar Rota
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3" id="pick-slots-container">
                {[0, 1, 2, 3, 4].map((index) => {
                  const champId = currentRolePickList[index];
                  const champ = champId ? getChampionById(champId) : null;

                  return (
                    <div
                      key={index}
                      id={`pick-slot-${index}`}
                      className={`p-3 rounded-lg border flex flex-col justify-between transition-all min-h-[140px] ${
                        champ
                          ? 'bg-[#0d1017] border-rose-900/80 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                          : 'bg-[#07090e]/60 border-dashed border-rose-950/80 hover:border-rose-700/80'
                      }`}
                    >
                      {/* Priority Tag & Controls */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${index === 0 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-slate-900 text-slate-400'}`}>
                          #{index + 1} {index === 0 ? 'PRINCIPAL' : 'RESERVA'}
                        </span>

                        {champ && (
                          <div className="flex items-center gap-1">
                            {index > 0 && (
                              <button
                                onClick={() => handleMovePickPriority(index, 'up')}
                                title="Aumentar prioridade"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {index < currentRolePickList.length - 1 && (
                              <button
                                onClick={() => handleMovePickPriority(index, 'down')}
                                title="Diminuir prioridade"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemovePickChampion(index)}
                              title="Remover"
                              className="p-1 text-rose-500 hover:text-rose-300 rounded hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      {champ ? (
                        <div className="flex items-center gap-3 my-2">
                          <img
                            src={champ.icon}
                            alt={champ.name}
                            className="w-12 h-12 rounded border border-rose-600/60 object-cover shadow-[0_0_10px_rgba(225,29,72,0.3)] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="overflow-hidden">
                            <h4 className="font-cinzel text-xs font-bold text-[#f8fafc] truncate">{champ.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{champ.title}</p>
                            <span className="text-[9px] text-emerald-400 font-mono">Auto-Lock Pronto</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center my-auto py-2 text-center">
                          <button
                            onClick={() => handleOpenChampionModal('pick', index)}
                            className="w-10 h-10 rounded-full border border-dashed border-rose-800/80 flex items-center justify-center text-rose-400 hover:bg-rose-950/40 hover:border-rose-500 transition-all cursor-pointer mb-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] text-slate-500">Vazio</span>
                        </div>
                      )}

                      {/* Bottom Button */}
                      {champ ? (
                        <button
                          onClick={() => handleOpenChampionModal('pick', index)}
                          className="w-full py-1 text-[10px] font-cinzel font-bold text-slate-400 hover:text-rose-300 border-t border-rose-950/60 mt-1 transition-all"
                        >
                          Trocar Campeão
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenChampionModal('pick', index)}
                          className="w-full py-1 text-[10px] font-cinzel font-bold text-rose-400 hover:text-rose-200 border border-rose-900/60 rounded bg-rose-950/30 transition-all"
                        >
                          + Adicionar Campeão
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Simulation Button */}
            <div className="mt-6 pt-4 border-t border-rose-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {currentRolePickList.length === 0 ? (
                  <span className="text-amber-400">⚠️ Nenhum campeão selecionado ainda. Clique em "+ Adicionar Campeão" ou na lista abaixo.</span>
                ) : (
                  <span className="text-emerald-400">✓ {currentRolePickList.length} campeão(ões) pronto(s) para seleção automática na rota {ROLE_LABELS[selectedRole].name}.</span>
                )}
              </div>

              <button
                id="btn-simulate-pick"
                onClick={handleTestAutoPick}
                disabled={isSimulatingPick || currentRolePickList.length === 0}
                className="px-4 py-2 rounded bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700/80 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-rose-400" />
                <span>{isSimulatingPick ? 'Simulando no LoL...' : 'Testar Auto-Pick no LoL'}</span>
              </button>
            </div>

            {simulationResultPick && (
              <div className="mt-3 p-3 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{simulationResultPick}</span>
              </div>
            )}
          </div>

          {/* Quick Add Champions Grid */}
          <div className="bento-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                  Catálogo de Campeões // Clique para Adicionar no Pré-Pick ({ROLE_LABELS[selectedRole].name})
                </h3>
                <p className="text-[11px] text-slate-400">Clique em qualquer campeão para inseri-lo imediatamente na próxima prioridade disponível.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar campeão..."
                    className="pl-8 pr-3 py-1.5 rounded bg-[#07090e] border border-rose-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredChampions.map((champ) => {
                const isSelected = currentRolePickList.includes(champ.id);
                return (
                  <button
                    key={champ.id}
                    onClick={() => handleDirectAdd(champ, 'pick')}
                    disabled={isSelected || currentRolePickList.length >= 5}
                    className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 relative ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-600 opacity-60 cursor-not-allowed'
                        : currentRolePickList.length >= 5
                        ? 'bg-[#07090e] border-rose-950/40 opacity-40 cursor-not-allowed'
                        : 'bg-[#07090e] border-rose-950/80 hover:border-rose-500 hover:bg-rose-950/30 cursor-pointer'
                    }`}
                  >
                    <img
                      src={champ.icon}
                      alt={champ.name}
                      className="w-10 h-10 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full">{champ.name}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-bold flex items-center justify-center text-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: PRÉ-BAN AUTOMÁTICO */}
      {/* ======================================================== */}
      {subTab === 'ban' && (
        <div className="space-y-4">
          {/* Main Ban Card */}
          <div className="bento-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-950/60 pb-4">
              <div>
                <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest font-mono">
                  MÓDULO DE BANIMENTO // LCU CHAMP SELECT
                </div>
                <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#f8fafc] mt-0.5 flex items-center gap-2">
                  <span>PRÉ-BAN AUTOMÁTICO</span>
                  <span className="text-xs font-normal text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                    Ban Instantâneo
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Configure até 5 campeões que você deseja banir. O Betray Client banirá e <strong>confirmará o banimento automaticamente</strong> no exato milissegundo em que a fase de bans for aberta.
                </p>
              </div>

              {/* Toggle Auto Ban */}
              <div className="flex items-center gap-2">
                <button
                  id="toggle-auto-ban-btn"
                  onClick={() => {
                    soundManager.playClick(settings.soundVolume);
                    updateSettings({ autoBanEnabled: !settings.autoBanEnabled });
                    addLog('info', `Auto-Ban ${!settings.autoBanEnabled ? 'Ativado' : 'Desativado'}`);
                  }}
                  className={`px-4 py-2 rounded-lg font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    settings.autoBanEnabled
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Auto-Ban: {settings.autoBanEnabled ? 'Ligado' : 'Desligado'}</span>
                </button>
              </div>
            </div>

            {/* Ban Priority Slots */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase font-cinzel text-slate-200 flex items-center gap-2">
                  <span>Lista de Prioridade de Bans (1 a 5)</span>
                  <span className="text-slate-500 text-[11px] font-mono font-normal">
                    (Se o #1 já foi banido pelo time aliado/inimigo, banirá o #2...)
                  </span>
                </h3>

                {currentBanList.length > 0 && (
                  <button
                    onClick={() => {
                      soundManager.playClick(settings.soundVolume);
                      updateSettings({ preBanChampions: [] });
                      addLog('info', 'Lista de Pré-Ban foi limpa.');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Limpar Todos os Bans
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3" id="ban-slots-container">
                {[0, 1, 2, 3, 4].map((index) => {
                  const champId = currentBanList[index];
                  const champ = champId ? getChampionById(champId) : null;

                  return (
                    <div
                      key={index}
                      id={`ban-slot-${index}`}
                      className={`p-3 rounded-lg border flex flex-col justify-between transition-all min-h-[140px] ${
                        champ
                          ? 'bg-[#12070a] border-rose-800/80 shadow-[0_0_15px_rgba(225,29,72,0.2)]'
                          : 'bg-[#07090e]/60 border-dashed border-rose-950/80 hover:border-rose-700/80'
                      }`}
                    >
                      {/* Priority Tag & Controls */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${index === 0 ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-slate-900 text-slate-400'}`}>
                          BAN #{index + 1}
                        </span>

                        {champ && (
                          <div className="flex items-center gap-1">
                            {index > 0 && (
                              <button
                                onClick={() => handleMoveBanPriority(index, 'up')}
                                title="Aumentar prioridade"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {index < currentBanList.length - 1 && (
                              <button
                                onClick={() => handleMoveBanPriority(index, 'down')}
                                title="Diminuir prioridade"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveBanChampion(index)}
                              title="Remover"
                              className="p-1 text-rose-500 hover:text-rose-300 rounded hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      {champ ? (
                        <div className="flex items-center gap-3 my-2">
                          <img
                            src={champ.icon}
                            alt={champ.name}
                            className="w-12 h-12 rounded border border-rose-600/80 object-cover shadow-[0_0_10px_rgba(225,29,72,0.4)] shrink-0 grayscale-[30%]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="overflow-hidden">
                            <h4 className="font-cinzel text-xs font-bold text-rose-200 truncate">{champ.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{champ.title}</p>
                            <span className="text-[9px] text-rose-400 font-mono">Auto-Ban Pronto</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center my-auto py-2 text-center">
                          <button
                            onClick={() => handleOpenChampionModal('ban', index)}
                            className="w-10 h-10 rounded-full border border-dashed border-rose-800/80 flex items-center justify-center text-rose-400 hover:bg-rose-950/40 hover:border-rose-500 transition-all cursor-pointer mb-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] text-slate-500">Vazio</span>
                        </div>
                      )}

                      {/* Bottom Button */}
                      {champ ? (
                        <button
                          onClick={() => handleOpenChampionModal('ban', index)}
                          className="w-full py-1 text-[10px] font-cinzel font-bold text-slate-400 hover:text-rose-300 border-t border-rose-950/60 mt-1 transition-all"
                        >
                          Trocar Ban
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenChampionModal('ban', index)}
                          className="w-full py-1 text-[10px] font-cinzel font-bold text-rose-400 hover:text-rose-200 border border-rose-900/60 rounded bg-rose-950/30 transition-all"
                        >
                          + Adicionar Ban
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Ban Simulation Button */}
            <div className="mt-6 pt-4 border-t border-rose-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {currentBanList.length === 0 ? (
                  <span className="text-amber-400">⚠️ Nenhum campeão adicionado aos bans. Escolha quem banir para proteger sua rota!</span>
                ) : (
                  <span className="text-emerald-400">✓ {currentBanList.length} ban(s) configurado(s). O primeiro livre será banido e confirmado automaticamente.</span>
                )}
              </div>

              <button
                id="btn-simulate-ban"
                onClick={handleTestAutoBan}
                disabled={isSimulatingBan || currentBanList.length === 0}
                className="px-4 py-2 rounded bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700/80 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-rose-400" />
                <span>{isSimulatingBan ? 'Banindo no LoL...' : 'Testar Auto-Ban no LoL'}</span>
              </button>
            </div>

            {simulationResultBan && (
              <div className="mt-3 p-3 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{simulationResultBan}</span>
              </div>
            )}
          </div>

          {/* Quick Add Ban Grid */}
          <div className="bento-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
                  Catálogo de Campeões // Clique para Adicionar aos Bans
                </h3>
                <p className="text-[11px] text-slate-400">Selecione os campeões mais perigosos para sua rota.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar campeão para ban..."
                    className="pl-8 pr-3 py-1.5 rounded bg-[#07090e] border border-rose-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 max-h-72 overflow-y-auto p-1">
              {filteredChampions.map((champ) => {
                const isSelected = currentBanList.includes(champ.id);
                return (
                  <button
                    key={champ.id}
                    onClick={() => handleDirectAdd(champ, 'ban')}
                    disabled={isSelected || currentBanList.length >= 5}
                    className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 relative ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-600 opacity-60 cursor-not-allowed'
                        : currentBanList.length >= 5
                        ? 'bg-[#07090e] border-rose-950/40 opacity-40 cursor-not-allowed'
                        : 'bg-[#07090e] border-rose-950/80 hover:border-rose-500 hover:bg-rose-950/30 cursor-pointer'
                    }`}
                  >
                    <img
                      src={champ.icon}
                      alt={champ.name}
                      className="w-10 h-10 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] font-bold text-slate-200 truncate w-full">{champ.name}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-bold flex items-center justify-center text-white">
                        BAN
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal for picking champion from search dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bento-card p-5 max-w-2xl w-full max-h-[85vh] flex flex-col border border-rose-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rose-950 pb-3 mb-3">
              <h3 className="font-cinzel text-base font-bold text-white">
                {modalMode === 'pick' 
                  ? `Selecionar Campeão para Pré-Pick (${ROLE_LABELS[selectedRole].name})`
                  : 'Selecionar Campeão para Banir'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digitar nome do campeão..."
                  className="w-full pl-9 pr-3 py-2 rounded bg-[#07090e] border border-rose-950 text-xs text-white focus:outline-none focus:border-rose-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5 overflow-y-auto flex-1 p-1">
              {filteredChampions.map((champ) => (
                <button
                  key={champ.id}
                  onClick={() => handleSelectChampion(champ)}
                  className="p-2 rounded-lg bg-[#07090e] border border-rose-950 hover:border-rose-500 hover:bg-rose-950/40 transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center"
                >
                  <img
                    src={champ.icon}
                    alt={champ.name}
                    className="w-12 h-12 rounded object-cover border border-rose-950"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-white truncate w-full">{champ.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
