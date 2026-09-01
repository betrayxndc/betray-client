import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Play, 
  AlertTriangle, 
  Ban, 
  CheckCircle2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { AppSettings, Champion, LcuLog } from '../types';
import { CHAMPIONS_LIST, getChampionById } from '../data/champions';
import { soundManager } from '../utils/audio';

interface PreBanTabProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addLog: (type: LcuLog['type'], message: string, event?: string) => void;
}

export const PreBanTab: React.FC<PreBanTabProps> = ({
  settings,
  updateSettings,
  addLog
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replacingSlotIndex, setReplacingSlotIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatedEnemyBans, setSimulatedEnemyBans] = useState<number[]>([]);
  const [simulatedBanResult, setSimulatedBanResult] = useState<{ bannedChamp: Champion; reason: string } | null>(null);

  const banList = settings.preBanChampions || [];

  const handleOpenChampionModal = (slotIndex: number) => {
    soundManager.playClick(settings.soundVolume);
    setReplacingSlotIndex(slotIndex);
    setIsModalOpen(true);
    setSearchQuery('');
  };

  const handleSelectChampion = (champion: Champion) => {
    soundManager.playChampLock(settings.soundVolume);
    const updatedList = [...banList];

    if (replacingSlotIndex !== null && replacingSlotIndex < updatedList.length) {
      updatedList[replacingSlotIndex] = champion.id;
    } else if (updatedList.length < 5) {
      if (!updatedList.includes(champion.id)) {
        updatedList.push(champion.id);
      }
    }

    updateSettings({ preBanChampions: updatedList });
    setIsModalOpen(false);
    setReplacingSlotIndex(null);

    addLog('info', `Configuração salva: Pré-Ban -> Slot atualizado para ${champion.name} (ID: ${champion.id})`);
  };

  const handleRemoveChampion = (index: number) => {
    soundManager.playClick(settings.soundVolume);
    const updatedList = banList.filter((_, i) => i !== index);
    updateSettings({ preBanChampions: updatedList });
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    soundManager.playClick(settings.soundVolume);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banList.length) return;

    const updatedList = [...banList];
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;

    updateSettings({ preBanChampions: updatedList });
  };

  const handleSimulateBanPhase = () => {
    if (banList.length === 0) {
      addLog('warning', 'Nenhum campeão configurado para banimento automático!');
      return;
    }

    // Find the first champion from banList that is not in simulatedEnemyBans
    let targetChampId: number | null = null;
    let skippedCount = 0;

    for (const champId of banList) {
      if (!simulatedEnemyBans.includes(champId)) {
        targetChampId = champId;
        break;
      } else {
        skippedCount++;
      }
    }

    if (!targetChampId) {
      addLog('error', 'Todos os campeões da sua lista de Pré-Ban já foram banidos/indisponíveis!');
      setSimulatedBanResult(null);
      return;
    }

    const champ = getChampionById(targetChampId);
    if (champ) {
      soundManager.playChampLock(settings.soundVolume);
      setSimulatedBanResult({
        bannedChamp: champ,
        reason: skippedCount > 0 
          ? `O campeão nº 1 estava banido pelo inimigo. O app aplicou o fallback para o próximo disponível (#${skippedCount + 1}).`
          : 'Banimento prioritário nº 1 executado instantaneamente.'
      });

      addLog('lcu', `PATCH /lol-champ-select/v1/session/actions/2 {"championId": ${targetChampId}, "type": "ban", "completed": true}`);
      addLog('success', `Campeão Banido Automaticamente: ${champ.name} (ID: ${champ.id})!`);
    }
  };

  const toggleEnemyBan = (champId: number) => {
    soundManager.playClick(settings.soundVolume);
    if (simulatedEnemyBans.includes(champId)) {
      setSimulatedEnemyBans(simulatedEnemyBans.filter(id => id !== champId));
    } else {
      setSimulatedEnemyBans([...simulatedEnemyBans, champId]);
    }
  };

  const filteredChampions = CHAMPIONS_LIST.filter((champ) => {
    return champ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           champ.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           champ.id.toString().includes(searchQuery);
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Bento Tile */}
      <div className="bento-card p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold tracking-widest uppercase">
              <ShieldAlert className="w-3 h-3" />
              Módulo 3 // Auto-Ban & Fallback
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#f0e6d2]">
              PRIORIDADE DE BANIMENTO
            </h2>
            <p className="text-xs text-[#a09b8c] max-w-2xl leading-relaxed">
              Configure até 5 campeões para banir automaticamente. Quando for sua vez na fase de banimento, o aplicativo verifica a disponibilidade e bane o primeiro da lista que não estiver previamente banido.
            </p>
          </div>

          {/* Master Bento Toggle */}
          <div className="flex items-center gap-3.5 bg-[#010a13]/80 p-3 rounded-md border border-[#c89b3c]/30 min-w-[230px] justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded ${settings.autoBanEnabled ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-stone-800 text-stone-500'}`}>
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-[#a09b8c] uppercase font-bold tracking-wider">Status Módulo</div>
                <div className="text-xs font-bold text-[#f0e6d2] uppercase tracking-wide">
                  {settings.autoBanEnabled ? 'Ativado' : 'Desativado'}
                </div>
              </div>
            </div>
            <button
              id="auto-ban-master-toggle"
              onClick={() => updateSettings({ autoBanEnabled: !settings.autoBanEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                settings.autoBanEnabled ? 'bg-rose-600' : 'bg-stone-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoBanEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Ban Priority Slots & Fallback Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Left Column: 5 Priority Ban Slots */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bento-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c89b3c]/15 pb-2.5">
              <div>
                <h3 className="font-cinzel text-xs font-bold text-[#c89b3c] uppercase tracking-wider">Ordem dos 5 Bans Prioritários</h3>
                <p className="text-[11px] text-[#a09b8c]">Se o #1 já estiver banido, o app bane automaticamente o #2.</p>
              </div>

              {banList.length < 5 && (
                <button
                  id="add-ban-champion-btn"
                  onClick={() => handleOpenChampionModal(banList.length)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#010a13] hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold cursor-pointer transition-all uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Ban
                </button>
              )}
            </div>

            {/* Ban Slots */}
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((index) => {
                const champId = banList[index];
                const champion = champId ? getChampionById(champId) : null;

                if (!champion) {
                  return (
                    <div
                      key={index}
                      onClick={() => handleOpenChampionModal(index)}
                      className="group flex items-center justify-between p-3 rounded border border-dashed border-[#c89b3c]/20 hover:border-rose-500/60 bg-[#010a13]/50 hover:bg-[#010a13] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1e2328] border border-[#c89b3c]/20 flex items-center justify-center text-xs font-bold text-rose-400 font-rajdhani">
                          #{index + 1}
                        </div>
                        <div className="text-xs text-[#a09b8c] group-hover:text-rose-200">
                          + Configurar {index + 1}º Campeão para Ban
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-stone-600 group-hover:text-rose-400" />
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded bg-[#010a13] border border-[#c89b3c]/25 hover:border-rose-500/60 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center font-rajdhani font-bold text-xs text-rose-400 w-5">
                        #{index + 1}
                      </div>

                      <div className="relative w-10 h-10 rounded overflow-hidden border border-rose-500/50 shrink-0">
                        <img 
                          src={champion.icon} 
                          alt={champion.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-rose-950/30 flex items-center justify-center pointer-events-none">
                          <Ban className="w-4 h-4 text-rose-500 opacity-70" />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-[#f0e6d2] font-cinzel">{champion.name}</div>
                        <div className="text-[10px] text-rose-300/80 italic">{champion.title} (ID: {champion.id})</div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMovePriority(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded bg-[#1e2328] hover:bg-rose-950 text-[#c89b3c] disabled:opacity-30 disabled:cursor-not-allowed border border-[#c89b3c]/20 transition-colors"
                        title="Subir Prioridade"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMovePriority(index, 'down')}
                        disabled={index === banList.length - 1}
                        className="p-1 rounded bg-[#1e2328] hover:bg-rose-950 text-[#c89b3c] disabled:opacity-30 disabled:cursor-not-allowed border border-[#c89b3c]/20 transition-colors"
                        title="Descer Prioridade"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenChampionModal(index)}
                        className="px-2 py-0.5 text-xs rounded bg-[#1e2328] hover:bg-rose-950 text-rose-200 border border-rose-500/30 font-semibold"
                      >
                        Trocar
                      </button>

                      <button
                        onClick={() => handleRemoveChampion(index)}
                        className="p-1 rounded bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-[#1e282d] transition-colors"
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

        {/* Right Column: Fallback Simulation Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bento-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c89b3c]/15 pb-2.5">
              <h3 className="font-cinzel text-xs font-bold text-[#c89b3c] uppercase tracking-wider">Simulador de Fallback de Ban</h3>
              <span className="text-[10px] text-rose-400 font-mono font-bold">PATCH /ban</span>
            </div>

            {/* Sandbox condition tester: Toggle enemy bans */}
            <div className="space-y-2">
              <span className="text-[11px] text-[#cdbe91] font-semibold">
                Simular campeões já banidos por outros jogadores:
              </span>
              <div className="flex flex-wrap gap-1">
                {banList.map((id) => {
                  const champ = getChampionById(id);
                  if (!champ) return null;
                  const isBlocked = simulatedEnemyBans.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleEnemyBan(id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                        isBlocked
                          ? 'bg-rose-900/60 text-rose-200 border-rose-500 line-through'
                          : 'bg-[#010a13] text-stone-300 border-[#c89b3c]/20 hover:border-[#c89b3c]'
                      }`}
                    >
                      <span>{champ.name}</span>
                      {isBlocked ? ' (Bloqueado)' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Ban Result Screen */}
            <div className="relative rounded bg-[#010a13] border border-rose-950/60 p-4 text-center min-h-[170px] flex flex-col items-center justify-center overflow-hidden">
              {simulatedBanResult ? (
                <div className="space-y-2 animate-fadeIn">
                  <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <img 
                      src={simulatedBanResult.bannedChamp.icon} 
                      alt={simulatedBanResult.bannedChamp.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-rose-950/40 flex items-center justify-center">
                      <Ban className="w-6 h-6 text-rose-400" />
                    </div>
                  </div>
                  <div>
                    <div className="font-cinzel text-base font-bold text-rose-300">
                      {simulatedBanResult.bannedChamp.name} BANIDO!
                    </div>
                    <p className="text-[10px] text-[#a09b8c] max-w-xs mt-0.5">
                      {simulatedBanResult.reason}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[#a09b8c]">
                  <ShieldAlert className="w-7 h-7 text-rose-500 mx-auto opacity-70" />
                  <div className="text-xs font-semibold">Nenhum teste de ban executado nesta sessão</div>
                  <p className="text-[10px] text-stone-500 max-w-xs">
                    Clique abaixo para executar a checagem e banimento do primeiro campeão válido.
                  </p>
                </div>
              )}
            </div>

            {/* Ban Simulator Execution Button */}
            <button
              id="execute-ban-test-btn"
              onClick={handleSimulateBanPhase}
              className="w-full py-2.5 rounded bg-rose-700 hover:bg-rose-600 text-white font-cinzel font-bold text-xs tracking-wider uppercase border border-rose-500/50 shadow cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-white" />
              Executar Teste de Auto-Ban
            </button>
          </div>
        </div>

      </div>

      {/* Champion Ban Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#1e2328] border border-rose-900 rounded-md shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-rose-900/30 flex items-center justify-between bg-[#010a13]">
              <div>
                <h3 className="font-cinzel text-base font-bold text-rose-200">
                  Selecionar Campeão para Banimento
                </h3>
                <p className="text-[11px] text-[#a09b8c]">Selecione o campeão que você deseja banir automaticamente.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-[#c89b3c]/15 bg-[#010a13]/60">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar campeão para banir..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#010a13] border border-rose-900/40 rounded text-xs text-[#f0e6d2] focus:border-rose-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[50vh]">
              {filteredChampions.map((champ) => {
                const isAlreadyBanned = banList.includes(champ.id);
                return (
                  <button
                    key={champ.id}
                    onClick={() => handleSelectChampion(champ)}
                    className={`relative group p-2 rounded border flex flex-col items-center gap-1.5 transition-all text-center ${
                      isAlreadyBanned
                        ? 'bg-[#010a13] border-rose-500 ring-1 ring-rose-500'
                        : 'bg-[#010a13] border-[#c89b3c]/20 hover:border-rose-500 hover:bg-[#1e2328]'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden border border-[#c89b3c]/20 group-hover:border-rose-500">
                      <img 
                        src={champ.icon} 
                        alt={champ.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {isAlreadyBanned && (
                        <div className="absolute inset-0 bg-rose-950/70 flex items-center justify-center text-rose-300">
                          <Ban className="w-5 h-5" />
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
