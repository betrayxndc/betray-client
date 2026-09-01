import React, { useState } from 'react';
import { 
  Crosshair, 
  Search, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Play, 
  ShieldCheck, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AppSettings, Role, Champion, LcuLog } from '../types';
import { CHAMPIONS_LIST, ROLE_LABELS, getChampionById } from '../data/champions';
import { soundManager } from '../utils/audio';

interface PrePickTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
}

export const PrePickTab: React.FC<PrePickTabProps> = ({
  settings,
  updateSettings,
  addLog
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>('MID');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replacingSlotIndex, setReplacingSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [simulationHoverId, setSimulationHoverId] = useState<number | null>(null);

  const roles: Role[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

  const currentRoleList = settings.prePickChampions[selectedRole] || [];

  const handleOpenChampionModal = (slotIndex: number) => {
    soundManager.playClick(settings.soundVolume);
    setReplacingSlotIndex(slotIndex);
    setIsModalOpen(true);
    setSearchQuery('');
  };

  const handleSelectChampion = (champion: Champion) => {
    soundManager.playChampLock(settings.soundVolume);
    const updatedRoleList = [...currentRoleList];

    if (replacingSlotIndex !== null && replacingSlotIndex < updatedRoleList.length) {
      updatedRoleList[replacingSlotIndex] = champion.id;
    } else if (updatedRoleList.length < 5) {
      if (!updatedRoleList.includes(champion.id)) {
        updatedRoleList.push(champion.id);
      }
    }

    const newPrePick = {
      ...settings.prePickChampions,
      [selectedRole]: updatedRoleList
    };

    updateSettings({ prePickChampions: newPrePick });
    setIsModalOpen(false);
    setReplacingSlotIndex(null);

    addLog('info', `Configuração salva: ${ROLE_LABELS[selectedRole].name} -> Slot atualizado para ${champion.name} (ID: ${champion.id})`);
  };

  const handleRemoveChampion = (index: number) => {
    soundManager.playClick(settings.soundVolume);
    const updatedRoleList = currentRoleList.filter((_, i) => i !== index);
    const newPrePick = {
      ...settings.prePickChampions,
      [selectedRole]: updatedRoleList
    };
    updateSettings({ prePickChampions: newPrePick });
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    soundManager.playClick(settings.soundVolume);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentRoleList.length) return;

    const updatedRoleList = [...currentRoleList];
    const temp = updatedRoleList[index];
    updatedRoleList[index] = updatedRoleList[targetIndex];
    updatedRoleList[targetIndex] = temp;

    const newPrePick = {
      ...settings.prePickChampions,
      [selectedRole]: updatedRoleList
    };
    updateSettings({ prePickChampions: newPrePick });
  };

  const handleSimulateAutoHover = () => {
    if (currentRoleList.length === 0) {
      addLog('warning', `Nenhum campeão configurado para a rota ${ROLE_LABELS[selectedRole].name}!`);
      return;
    }
    const targetId = currentRoleList[0];
    const champ = getChampionById(targetId);
    setSimulationHoverId(targetId);
    soundManager.playChampLock(settings.soundVolume);

    addLog('lcu', `PATCH /lol-champ-select/v1/session/actions/1 {"championId": ${targetId}, "type": "pick", "completed": false}`);
    addLog('success', `Campeão pré-selecionado (Hover) com sucesso: ${champ?.name || targetId}!`);
  };

  // Filter champions for selection modal
  const filteredChampions = CHAMPIONS_LIST.filter((champ) => {
    const matchesSearch = champ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          champ.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          champ.id.toString().includes(searchQuery);
    const matchesRole = roleFilter === 'ALL' || champ.roles.includes(roleFilter as Role);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Bento Tile */}
      <div className="bento-card p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-[#c89b3c]/15 border border-[#c89b3c]/30 text-[#c89b3c] text-[10px] font-bold tracking-widest uppercase">
              <Crosshair className="w-3 h-3" />
              Módulo 2 // Auto-Hover & Pre-Pick
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#f0e6d2]">
              PRÉ-SELEÇÃO POR ROTA
            </h2>
            <p className="text-xs text-[#a09b8c] max-w-2xl leading-relaxed">
              Configure até 5 campeões prioritários para cada posição (Top, Jg, Mid, ADC, Sup). 
              Ao entrar no Champ Select, a LCU envia um <code className="text-[#c89b3c] font-mono text-[11px]">PATCH /lol-champ-select/v1/session</code> para selecionar seu campeão.
            </p>
          </div>

          {/* Module Activation Bento Toggle */}
          <div className="flex items-center gap-3.5 bg-[#010a13]/80 p-3 rounded-md border border-[#c89b3c]/30 min-w-[230px] justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded ${settings.autoPickEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-stone-800 text-stone-500'}`}>
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[#a09b8c] uppercase font-bold tracking-wider">Status Módulo</div>
                <div className="text-xs font-bold text-[#f0e6d2] uppercase tracking-wide">
                  {settings.autoPickEnabled ? 'Ativado' : 'Desativado'}
                </div>
              </div>
            </div>
            <button
              id="auto-pick-master-toggle"
              onClick={() => updateSettings({ autoPickEnabled: !settings.autoPickEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.autoPickEnabled ? 'bg-emerald-600' : 'bg-stone-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoPickEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Role Navigation Bento Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {roles.map((role) => {
          const isSelected = selectedRole === role;
          const count = settings.prePickChampions[role]?.length || 0;
          return (
            <button
              key={role}
              id={`role-btn-${role.toLowerCase()}`}
              onClick={() => {
                soundManager.playClick(settings.soundVolume);
                setSelectedRole(role);
              }}
              className={`p-3 rounded-md border font-rajdhani font-bold text-xs tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#010a13] text-[#f0e6d2] border-[#c89b3c] shadow-[0_0_12px_rgba(200,155,60,0.2)]'
                  : 'bg-[#1e2328] text-[#a09b8c] border-[#c89b3c]/20 hover:border-[#c89b3c]/60 hover:text-[#f0e6d2]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#c89b3c]' : 'bg-stone-600'}`} />
                <span className="uppercase">{ROLE_LABELS[role].name}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                count > 0 ? 'bg-[#c89b3c]/20 text-[#c89b3c]' : 'bg-stone-800 text-stone-500'
              }`}>
                {count}/5
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Priority List & Live Champ Select Hover Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Left Column: 5 Priority Slots */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bento-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c89b3c]/15 pb-2.5">
              <div>
                <h3 className="font-cinzel text-xs font-bold text-[#c89b3c] uppercase tracking-wider">
                  Ordem de Prioridade // {ROLE_LABELS[selectedRole].name}
                </h3>
                <p className="text-[11px] text-[#a09b8c]">O 1º campeão disponível será selecionado automaticamente.</p>
              </div>
              
              {currentRoleList.length < 5 && (
                <button
                  id="add-champion-slot-btn"
                  onClick={() => handleOpenChampionModal(currentRoleList.length)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#010a13] hover:bg-[#c89b3c] text-[#f0e6d2] hover:text-[#010a13] border border-[#c89b3c]/40 text-xs font-bold cursor-pointer transition-all uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              )}
            </div>

            {/* Slots List */}
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((index) => {
                const champId = currentRoleList[index];
                const champion = champId ? getChampionById(champId) : null;

                if (!champion) {
                  return (
                    <div
                      key={index}
                      onClick={() => handleOpenChampionModal(index)}
                      className="group flex items-center justify-between p-3 rounded border border-dashed border-[#c89b3c]/20 hover:border-[#c89b3c]/60 bg-[#010a13]/50 hover:bg-[#010a13] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1e2328] border border-[#c89b3c]/20 flex items-center justify-center text-xs font-bold text-[#c89b3c] font-rajdhani">
                          #{index + 1}
                        </div>
                        <div className="text-xs text-[#a09b8c] group-hover:text-[#f0e6d2]">
                          + Configurar {index + 1}ª Escolha de Campeão
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-stone-600 group-hover:text-[#c89b3c]" />
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded bg-[#010a13] border border-[#c89b3c]/25 hover:border-[#c89b3c] transition-all"
                  >
                    {/* Champion Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center font-rajdhani font-bold text-xs text-[#c89b3c] w-5">
                        #{index + 1}
                      </div>

                      <div className="relative w-10 h-10 rounded overflow-hidden border border-[#c89b3c]/40 shrink-0">
                        <img 
                          src={champion.icon} 
                          alt={champion.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center text-[#f0e6d2] font-mono">
                          ID:{champion.id}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-[#f0e6d2] font-cinzel">{champion.name}</div>
                        <div className="text-[10px] text-[#a09b8c] italic">{champion.title}</div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMovePriority(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-[#1e2328] hover:bg-[#283038] text-[#c89b3c] disabled:opacity-30 disabled:cursor-not-allowed border border-[#c89b3c]/20 transition-colors"
                        title="Subir Prioridade"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMovePriority(index, 'down')}
                        disabled={index === currentRoleList.length - 1}
                        className="p-1 rounded bg-[#1e2328] hover:bg-[#283038] text-[#c89b3c] disabled:opacity-30 disabled:cursor-not-allowed border border-[#c89b3c]/20 transition-colors"
                        title="Descer Prioridade"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenChampionModal(index)}
                        className="px-2 py-0.5 text-xs rounded bg-[#1e2328] hover:bg-[#283038] text-[#f0e6d2] border border-[#c89b3c]/30 font-semibold"
                        title="Trocar Campeão"
                      >
                        Trocar
                      </button>

                      <button
                        onClick={() => handleRemoveChampion(index)}
                        className="p-1 rounded bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Champ Select Hover Visualizer & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bento-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c89b3c]/15 pb-2.5">
              <h3 className="font-cinzel text-xs font-bold text-[#c89b3c] uppercase tracking-wider">Simulador de Hover</h3>
              <span className="text-[10px] text-[#c89b3c] font-mono font-bold">PATCH /session</span>
            </div>

            {/* Visual Lobby Stage */}
            <div className="relative rounded bg-[#010a13] border border-[#c89b3c]/20 p-5 text-center min-h-[200px] flex flex-col items-center justify-center overflow-hidden">
              {simulationHoverId ? (
                (() => {
                  const hovered = getChampionById(simulationHoverId);
                  return (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#c89b3c] shadow-[0_0_15px_rgba(200,155,60,0.3)]">
                        <img 
                          src={hovered?.icon} 
                          alt={hovered?.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#c89b3c] bg-[#c89b3c]/15 px-2 py-0.5 rounded border border-[#c89b3c]/30">
                          Hover Ativo // {ROLE_LABELS[selectedRole].short}
                        </span>
                        <div className="font-cinzel text-lg font-bold text-[#f0e6d2] mt-1">{hovered?.name}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">1ª Escolha da Lista Bloqueada</div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-2 text-[#a09b8c]">
                  <Crosshair className="w-7 h-7 text-[#c89b3c] mx-auto opacity-70" />
                  <div className="text-xs font-semibold">Nenhum teste de Hover executado nesta sessão</div>
                  <p className="text-[11px] max-w-xs text-stone-500">
                    Clique no botão abaixo para disparar o hover simulado no endpoint da LCU.
                  </p>
                </div>
              )}
            </div>

            {/* Auto-Lock Toggle Card */}
            <div className="p-3 rounded bg-[#010a13] border border-[#c89b3c]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded ${settings.autoLockPick ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-stone-800 text-stone-500'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#f0e6d2]">Confirmar Pick Automaticamente (Lock-In)</div>
                  <div className="text-[10px] text-[#a09b8c]">Trava/Confirma o campeão instantaneamente na sua vez de pick.</div>
                </div>
              </div>
              <button
                id="auto-lock-pick-toggle"
                onClick={() => updateSettings({ autoLockPick: !settings.autoLockPick })}
                className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  settings.autoLockPick ? 'bg-[#c89b3c]' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.autoLockPick ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Hover Trigger Button */}
            <button
              id="test-hover-action-btn"
              onClick={handleSimulateAutoHover}
              className="w-full py-2.5 rounded bg-[#c89b3c] hover:bg-[#d8ab4c] text-[#010a13] font-cinzel font-bold text-xs tracking-wider uppercase shadow cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-[#010a13]" />
              Testar Auto-Hover ({ROLE_LABELS[selectedRole].name})
            </button>

            <div className="p-2.5 rounded bg-[#010a13] border border-[#c89b3c]/15 text-xs text-[#a09b8c] space-y-1">
              <div className="flex items-center gap-1 text-[#f0e6d2] font-semibold text-[11px]">
                <Info className="w-3.5 h-3.5 text-[#c89b3c]" />
                Como funciona a LCU no Champ Select:
              </div>
              <p className="text-[10px] leading-relaxed">
                Ao entrar no draft, o app detecta sua célula (cellId) e a posição atribuída pela Riot. O 1º campeão disponível da sua lista configurada é enviado como intenção de pick.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Champion Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#1e2328] border border-[#c89b3c] rounded-md shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#c89b3c]/20 flex items-center justify-between bg-[#010a13]">
              <div>
                <h3 className="font-cinzel text-base font-bold text-[#f0e6d2]">
                  Selecionar Campeão // {ROLE_LABELS[selectedRole].name}
                </h3>
                <p className="text-[11px] text-[#a09b8c]">Escolha o campeão para adicionar à sua lista de prioridades.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Search & Filters */}
            <div className="p-4 border-b border-[#c89b3c]/15 bg-[#010a13]/60 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar campeão por nome ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#010a13] border border-[#c89b3c]/30 rounded text-xs text-[#f0e6d2] focus:border-[#c89b3c] focus:outline-none placeholder-stone-500"
                  autoFocus
                />
              </div>

              {/* Role Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-3 py-1 rounded font-semibold transition-colors uppercase text-[10px] ${
                    roleFilter === 'ALL' ? 'bg-[#c89b3c] text-[#010a13]' : 'bg-[#010a13] text-stone-400 hover:text-white border border-[#c89b3c]/20'
                  }`}
                >
                  Todos
                </button>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded font-semibold transition-colors uppercase text-[10px] ${
                      roleFilter === r ? 'bg-[#c89b3c] text-[#010a13] font-bold' : 'bg-[#010a13] text-stone-400 hover:text-white border border-[#c89b3c]/20'
                    }`}
                  >
                    {ROLE_LABELS[r].short}
                  </button>
                ))}
              </div>
            </div>

            {/* Champions Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[50vh]">
              {filteredChampions.map((champ) => {
                const isAlreadySelected = currentRoleList.includes(champ.id);
                return (
                  <button
                    key={champ.id}
                    onClick={() => handleSelectChampion(champ)}
                    className={`relative group p-2 rounded border flex flex-col items-center gap-1.5 transition-all text-center ${
                      isAlreadySelected
                        ? 'bg-[#010a13] border-[#c89b3c] ring-1 ring-[#c89b3c]'
                        : 'bg-[#010a13] border-[#c89b3c]/20 hover:border-[#c89b3c] hover:bg-[#1e2328]'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden border border-[#c89b3c]/30 group-hover:border-[#c89b3c]">
                      <img 
                        src={champ.icon} 
                        alt={champ.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {isAlreadySelected && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[#c89b3c]">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-[#f0e6d2] font-cinzel line-clamp-1">{champ.name}</span>
                    <span className="text-[9px] text-stone-400 font-mono">ID: {champ.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

