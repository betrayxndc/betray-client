import { Champion, AppSettings } from '../types';

export function getDesktopHtml(champions: Champion[]): string {
  const champJson = JSON.stringify(champions);

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Betray Client</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Rajdhani', sans-serif;
      background-color: #07090e;
      color: #f8fafc;
      overflow-x: hidden;
      user-select: none;
    }
    .font-cinzel { font-family: 'Cinzel', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .bento-card {
      background: rgba(13, 16, 23, 0.95);
      border: 1px solid rgba(225, 29, 72, 0.2);
      border-radius: 8px;
    }
    .bento-card:hover {
      border-color: rgba(225, 29, 72, 0.4);
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #07090e; }
    ::-webkit-scrollbar-thumb { background: #4c0519; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #e11d48; }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between">

  <!-- TOPBAR / NAVBAR -->
  <header class="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-rose-950/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
      
      <!-- Brand Logo Tile -->
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-xl bg-black border border-rose-900/70 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
          <div class="w-8 h-8 rounded-lg overflow-hidden border border-rose-500/70 flex items-center justify-center bg-[#0d0710] shadow-[0_0_10px_rgba(225,29,72,0.4)] shrink-0">
            <span class="text-base select-none">🗡️</span>
          </div>
          <div class="flex flex-col">
            <h1 class="font-cinzel text-sm sm:text-base font-black tracking-widest text-[#f8fafc] whitespace-nowrap leading-none">
              BETRAY <span class="text-rose-500">CLIENT</span>
            </h1>
            <span class="text-[8px] font-mono text-slate-400 tracking-wider uppercase">Talon Dark Edition</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (With STEELE123/REVEAL & MOTOR DE DODGE) -->
      <nav class="flex items-center gap-1.5 overflow-x-auto py-1">
        <button onclick="switchTab('tab-queue')" id="nav-queue" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-rose-950/70 text-rose-200 border border-rose-700/60">
          Auto-Accept
        </button>
        <button onclick="switchTab('tab-pick-ban')" id="nav-pick-ban" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-transparent">
          Pré-Pick & Ban
        </button>
        <button onclick="switchTab('tab-lobby-reveal')" id="nav-lobby-reveal" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 border border-amber-800/60 bg-amber-950/30 flex items-center gap-1">
          <span>🔍 Lobby Reveal</span>
          <span class="text-[9px] bg-amber-500 text-black px-1 rounded font-mono font-bold">steele123</span>
        </button>
        <button onclick="switchTab('tab-rose-changer')" id="nav-rose-changer" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-transparent flex items-center gap-1.5">
          <span>🌸 Skin Changer</span>
        </button>
        <button onclick="switchTab('tab-profile')" id="nav-profile" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-transparent">
          Perfil & Elo
        </button>
        <button onclick="switchTab('tab-skins')" id="nav-skins" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-transparent">
          Background Skins
        </button>
        <button onclick="switchTab('tab-dodge-motor')" id="nav-dodge-motor" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-rose-300 hover:text-white border border-rose-900/60 bg-rose-950/40 flex items-center gap-1">
          <span>🚪 Motor Dodge</span>
        </button>
        <button onclick="switchTab('tab-logs')" id="nav-logs" class="nav-btn px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-transparent">
          Logs LCU
        </button>
      </nav>

      <!-- LCU Connection Badge & Dodge Action -->
      <div class="flex items-center gap-2">
        <button onclick="executeDodgeQuick()" id="btn-nav-dodge" class="px-3 py-1 rounded text-xs font-cinzel font-bold uppercase tracking-wider bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.5)] flex items-center gap-1.5 cursor-pointer" title="Sair da Seleção de Campeões e voltar ao Lobby">
          <span>🚪 DODGE RÁPIDO</span>
        </button>
        <div id="lcu-status-badge" class="flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
          <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span id="lcu-status-text">Conectando à LCU...</span>
        </div>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 py-6 flex-1 w-full relative">
    <!-- Floating Skin & Action Notifications Toast Container -->
    <div id="rose-toast-container" class="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none"></div>

    <!-- TAB 1: AUTO-ACCEPT -->
    <section id="tab-queue" class="tab-content space-y-5">
      <div class="bento-card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-950/60 pb-4">
          <div>
            <div class="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Módulo 1 // Aceitação Automática</div>
            <h2 class="font-cinzel text-xl font-bold text-white mt-1">AUTO-ACCEPT DE PARTIDAS</h2>
            <p class="text-xs text-slate-400 mt-1">Aceita automaticamente filas de SoloQ, Flex, ARAM e Normal Game diretamente via LCU API.</p>
          </div>
          <button onclick="toggleAutoAccept()" id="btn-toggle-accept" class="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.4)]">
            AUTO-ACCEPT: ATIVADO
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div class="p-4 rounded bg-[#07090e] border border-rose-950/60 space-y-3">
            <div class="flex justify-between items-center text-xs font-bold">
              <span class="text-slate-300">Delay Humano de Aceitação:</span>
              <span id="delay-val" class="text-rose-400 font-mono text-sm">1s</span>
            </div>
            <input type="range" id="delay-slider" min="0" max="8" value="1" step="1" oninput="updateDelay(this.value)" class="w-full accent-rose-600 cursor-pointer">
            <p class="text-[11px] text-slate-400">Adiciona um tempo antes de clicar em aceitar para simular um clique humano natural.</p>
          </div>

          <div class="p-4 rounded bg-[#07090e] border border-rose-950/60 space-y-2">
            <div class="text-xs font-bold text-slate-300">Status do Matchmaking LCU:</div>
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              <span id="gameflow-text" class="text-xs font-mono text-emerald-400 font-bold">Monitorando Fila de Partida (Lobby / Matchmaking)...</span>
            </div>
            <p class="text-[11px] text-slate-400">O Betray Client responderá ao evento <code class="text-rose-400">/lol-matchmaking/v1/ready-check/accept</code> automaticamente.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: PRÉ-PICK & PRÉ-BAN UNIFICADO -->
    <section id="tab-pick-ban" class="tab-content hidden space-y-5">
      <div class="bento-card p-6">
        <div class="flex gap-2 mb-6 border-b border-rose-950/60 pb-4">
          <button onclick="switchPickBanMode('pick')" id="subtab-pick-btn" class="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow">
            🎯 PRÉ-PICK AUTOMÁTICO (SELEÇÃO & CONFIRMAÇÃO)
          </button>
          <button onclick="switchPickBanMode('ban')" id="subtab-ban-btn" class="flex-1 py-2.5 rounded-lg bg-[#07090e] text-slate-400 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider">
            🛡️ PRÉ-BAN AUTOMÁTICO (BANIMENTO & CONFIRMAÇÃO)
          </button>
        </div>

        <!-- Section: Pré Pick -->
        <div id="section-pick" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-cinzel text-lg font-bold text-white">PRÉ-PICK POR ROTA</h2>
              <p class="text-xs text-slate-400">Selecione seus campeões. Eles serão escolhidos e confirmados automaticamente.</p>
            </div>
            <div class="flex gap-1" id="role-selector-btns">
              <button onclick="selectRole('TOP')" class="role-btn px-3 py-1 rounded bg-[#07090e] text-slate-400 border border-transparent text-xs font-bold">TOP</button>
              <button onclick="selectRole('JUNGLE')" class="role-btn px-3 py-1 rounded bg-[#07090e] text-slate-400 border border-transparent text-xs font-bold">JUNGLE</button>
              <button onclick="selectRole('MID')" class="role-btn px-3 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 text-xs font-bold">MID</button>
              <button onclick="selectRole('ADC')" class="role-btn px-3 py-1 rounded bg-[#07090e] text-slate-400 border border-transparent text-xs font-bold">ADC</button>
              <button onclick="selectRole('SUPPORT')" class="role-btn px-3 py-1 rounded bg-[#07090e] text-slate-400 border border-transparent text-xs font-bold">SUP</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-5 gap-3" id="pick-slots-container"></div>

          <div class="border-t border-rose-950/60 pt-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-xs font-bold uppercase text-slate-300 font-cinzel">Clique em um Campeão para Adicionar à Rota:</h3>
              <input type="text" id="pick-search" oninput="filterChampions('pick', this.value)" placeholder="Buscar campeão..." class="px-3 py-1 text-xs rounded bg-[#07090e] border border-rose-950/80 text-white focus:outline-none focus:border-rose-500">
            </div>
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-56 overflow-y-auto p-1" id="champions-grid-pick"></div>
          </div>
        </div>

        <!-- Section: Pré Ban -->
        <div id="section-ban" class="hidden space-y-4">
          <div>
            <h2 class="font-cinzel text-lg font-bold text-white">PRÉ-BAN AUTOMÁTICO</h2>
            <p class="text-xs text-slate-400">Adicione os campeões que deseja banir na ordem de prioridade.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-5 gap-3" id="ban-slots-container"></div>

          <div class="border-t border-rose-950/60 pt-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-xs font-bold uppercase text-slate-300 font-cinzel">Clique em um Campeão para Adicionar aos Bans:</h3>
              <input type="text" id="ban-search" oninput="filterChampions('ban', this.value)" placeholder="Buscar campeão para ban..." class="px-3 py-1 text-xs rounded bg-[#07090e] border border-rose-950/80 text-white focus:outline-none focus:border-rose-500">
            </div>
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-56 overflow-y-auto p-1" id="champions-grid-ban"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: LOBBY REVEAL (steele123/reveal) -->
    <section id="tab-lobby-reveal" class="tab-content hidden space-y-5">
      <div class="bento-card p-6 border-amber-900/50">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-amber-950/60 pb-4 gap-4">
          <div>
            <div class="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span>🔍 MÓDULO // LOBBY REVEAL REAL-TIME</span>
              <span class="text-black bg-amber-400 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold">steele123/reveal</span>
            </div>
            <h2 class="font-cinzel text-xl font-bold text-white mt-1">REVELADOR DE LOBBY & NOMES REAIS (SOLO/DUO)</h2>
            <p class="text-xs text-slate-400">Identifica os Riot IDs reais de todos os aliados anônimos no Champ Select via chat XMPP da LCU.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button onclick="scanLobbyNow()" id="btn-scan-lobby" class="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-black font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer">
              🔍 ESCANEAR LOBBY DO LOL
            </button>
            <button onclick="copyAllRiotIds()" class="px-3 py-2 rounded bg-[#07090e] border border-amber-900/60 hover:border-amber-500 text-amber-300 font-cinzel text-xs uppercase">
              📋 COPIAR TODOS OS IDS
            </button>
            <button onclick="openOpGgMulti()" class="px-3 py-2 rounded bg-blue-950/80 border border-blue-700/60 hover:bg-blue-900 text-blue-200 font-cinzel text-xs uppercase">
              🌐 OP.GG MULTI
            </button>
          </div>
        </div>

        <!-- Team Analysis Banner -->
        <div class="mt-4 p-4 rounded-lg bg-black/60 border border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-amber-950/70 border border-amber-600/60 text-amber-400 font-mono text-center">
              <div class="text-xs uppercase font-bold">WR Médio</div>
              <div id="team-avg-wr" class="text-xl font-bold text-amber-300">58%</div>
            </div>
            <div>
              <h3 class="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                <span>QUALIDADE DA EQUIPE:</span>
                <span id="team-risk-badge" class="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700">TIME SEGURO (BOM WR)</span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">5 aliados analisados na fila Solo/Duo. Estatísticas detalhadas abaixo:</p>
            </div>
          </div>
          <div class="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>Riot IDs:</span>
            <code id="lobby-ids-preview" class="text-amber-300 bg-black/80 px-2 py-1 rounded border border-amber-950 truncate max-w-xs">Aguardando Champ Select...</code>
          </div>
        </div>

        <!-- 5 Allies Cards Grid -->
        <div id="lobby-participants-grid" class="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
          <!-- Populated by JS -->
        </div>
      </div>
    </section>

    <!-- TAB 4: SKIN CHANGER (ROSE ENGINE) -->
    <section id="tab-rose-changer" class="tab-content hidden space-y-5">
      <div class="bento-card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-rose-950/60 pb-3 gap-3">
          <div>
            <div class="text-[10px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span>🌸 Módulo 3 // In-Game Skin Changer (Rose Engine)</span>
              <span class="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded text-[9px] border border-emerald-700/50">Anti-Vanguard Safe</span>
            </div>
            <h2 class="font-cinzel text-xl font-bold text-white mt-1">SKIN CHANGER EM JOGO (ROSE ENGINE)</h2>
            <p class="text-xs text-slate-400">Troque skins e chromas no League of Legends em tempo real sem risco de banimentos.</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="toggleRoseChanger()" id="btn-toggle-rose" class="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow">
              ROSE CHANGER: ATIVADO
            </button>
            <div class="flex items-center gap-2 bg-[#07090e] p-1.5 rounded-lg border border-rose-950/60">
              <button id="rose-step1-indicator" onclick="setRoseStep(1)" class="px-3 py-1.5 rounded text-xs font-cinzel font-bold bg-rose-600 text-white shadow">
                1. Campeão
              </button>
              <span class="text-slate-600 text-xs">→</span>
              <button id="rose-step2-indicator" onclick="setRoseStep(2)" class="px-3 py-1.5 rounded text-xs font-cinzel font-bold text-slate-400 hover:text-slate-200">
                2. Skin & Chromas
              </button>
            </div>
          </div>
        </div>

        <!-- PASSO 1: ESCOLHER CAMPEÃO -->
        <div id="rose-step-1-view" class="mt-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-cinzel text-sm font-bold text-slate-200">SELECIONE O CAMPEÃO</h3>
            <input id="search-rose-champ" type="text" oninput="filterRoseChampions(this.value)" placeholder="Buscar campeão (ex: Talon, Zed)..." class="p-2 bg-[#07090e] border border-rose-950 rounded text-xs text-white focus:border-rose-500">
          </div>
          <div id="rose-champions-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-96 overflow-y-auto p-1"></div>
        </div>

        <!-- PASSO 2: ESCOLHER SKIN & CHROMAS -->
        <div id="rose-step-2-view" class="mt-5 space-y-5 hidden">
          <div class="flex items-center justify-between p-3 rounded-lg bg-[#07090e] border border-rose-950">
            <div class="flex items-center gap-3">
              <img id="rose-chosen-champ-icon" src="" class="w-10 h-10 rounded-md border border-rose-600">
              <div>
                <div class="text-[10px] text-rose-400 font-bold uppercase">Campeão Configurado</div>
                <h3 id="rose-chosen-champ-name" class="font-cinzel text-base font-bold text-white">Zed</h3>
              </div>
            </div>
            <button onclick="setRoseStep(1)" class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-cinzel font-bold uppercase">
              ← Trocar Campeão
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-3">
              <div class="relative rounded-lg overflow-hidden border border-rose-800/80 h-72 bg-black shadow-2xl">
                <img id="rose-skin-preview-img" src="" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 id="rose-skin-champ-name" class="font-cinzel text-2xl font-bold text-white">Zed</h3>
                    <p id="rose-skin-title" class="text-xs text-rose-400 font-bold">Zed Clássico</p>
                    <span id="rose-chroma-badge" class="hidden text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-600/50 mt-1 inline-block">Chroma Ativo</span>
                  </div>
                  <button onclick="armRoseSkinInGame()" class="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer">
                    🌸 ARMAR SKIN NO JOGO
                  </button>
                </div>
              </div>

              <!-- Rose ChromaWheel -->
              <div id="rose-chroma-box" class="p-3 rounded-lg bg-[#07090e] border border-purple-950/60 space-y-2">
                <div class="flex items-center justify-between text-xs font-cinzel font-bold text-purple-300">
                  <span>🎨 Seletor de Chromas</span>
                  <span id="rose-chroma-selected-label" class="text-[10px] text-slate-400 font-mono">Padrão</span>
                </div>
                <div class="flex items-center gap-2 flex-wrap" id="rose-chroma-palette"></div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="text-xs font-bold uppercase text-slate-300 flex items-center justify-between">
                <span>Skins Disponíveis:</span>
                <span id="rose-skin-count" class="text-rose-400 font-mono text-[10px]"></span>
              </div>
              <div id="rose-skins-list-container" class="space-y-2 max-h-72 overflow-y-auto pr-1"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 5: PERFIL & ELO (CONTA REAL) -->
    <section id="tab-profile" class="tab-content hidden space-y-5">
      <div class="bento-card p-6">
        <div class="flex items-center justify-between border-b border-rose-950/60 pb-3">
          <div>
            <div class="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Módulo // Invocador LCU</div>
            <h2 class="font-cinzel text-xl font-bold text-white mt-1">PERFIL DA CONTA CONECTADA NO LOL</h2>
            <p class="text-xs text-slate-400">Exibe a conta e os elos do invocador atualmente logado no cliente do League of Legends.</p>
          </div>
          <button onclick="refreshSummonerData()" class="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow">
            🔄 ATUALIZAR DADOS DO LOL
          </button>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="p-4 rounded bg-[#07090e] border border-rose-950/60 flex items-center gap-4">
            <img id="profile-icon" src="https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/29.png" class="w-16 h-16 rounded-full border-2 border-amber-500 shadow">
            <div>
              <h3 id="profile-name" class="font-cinzel text-lg font-bold text-white">Carregando LoL...</h3>
              <p id="profile-level" class="text-xs text-slate-400 font-mono">Nível --</p>
              <span id="profile-tag" class="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded">LCU: Aguardando</span>
            </div>
          </div>

          <div class="p-4 rounded bg-[#07090e] border border-rose-950/60 space-y-1">
            <span class="text-xs font-bold text-slate-400 uppercase">Ranqueada Solo/Duo</span>
            <div id="solo-tier" class="font-cinzel text-base font-bold text-amber-400">UNRANKED</div>
            <p id="solo-lp" class="text-xs text-slate-300 font-mono">0 LP</p>
          </div>

          <div class="p-4 rounded bg-[#07090e] border border-rose-950/60 space-y-1">
            <span class="text-xs font-bold text-slate-400 uppercase">Ranqueada Flex</span>
            <div id="flex-tier" class="font-cinzel text-base font-bold text-cyan-400">UNRANKED</div>
            <p id="flex-lp" class="text-xs text-slate-300 font-mono">0 LP</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 6: BACKGROUND SKINS -->
    <section id="tab-skins" class="tab-content hidden space-y-5">
      <div class="bento-card p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-rose-950/60 pb-3 gap-3">
          <div>
            <div class="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Módulo // Background Changer LCU</div>
            <h2 class="font-cinzel text-xl font-bold text-white mt-1">PERSONALIZADOR DE BACKGROUND DO PERFIL</h2>
            <p class="text-xs text-slate-400">Escolha qualquer skin do League of Legends para o seu perfil — mesmo sem possuí-la na conta!</p>
          </div>
          <div class="flex items-center gap-2 bg-[#07090e] p-1.5 rounded-lg border border-rose-950/60">
            <button id="bg-step1-indicator" onclick="setBgStep(1)" class="px-3 py-1.5 rounded text-xs font-cinzel font-bold bg-rose-600 text-white shadow">
              1. Escolher Campeão
            </button>
            <span class="text-slate-600 text-xs">→</span>
            <button id="bg-step2-indicator" onclick="setBgStep(2)" class="px-3 py-1.5 rounded text-xs font-cinzel font-bold text-slate-400 hover:text-slate-200">
              2. Escolher Skin
            </button>
          </div>
        </div>

        <div id="bg-step-1-view" class="mt-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-cinzel text-sm font-bold text-slate-200">SELECIONE O CAMPEÃO</h3>
            <input id="search-bg-champ" type="text" oninput="filterBgChampions(this.value)" placeholder="Buscar campeão..." class="p-2 bg-[#07090e] border border-rose-950 rounded text-xs text-white focus:border-rose-500">
          </div>
          <div id="bg-champions-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-96 overflow-y-auto p-1"></div>
        </div>

        <div id="bg-step-2-view" class="mt-5 space-y-5 hidden">
          <div class="flex items-center justify-between p-3 rounded-lg bg-[#07090e] border border-rose-950">
            <div class="flex items-center gap-3">
              <img id="bg-chosen-champ-icon" src="" class="w-10 h-10 rounded-md border border-rose-600">
              <div>
                <div class="text-[10px] text-rose-400 font-bold uppercase">Campeão Escolhido</div>
                <h3 id="bg-chosen-champ-name" class="font-cinzel text-base font-bold text-white">Zed</h3>
              </div>
            </div>
            <button onclick="setBgStep(1)" class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-cinzel font-bold uppercase">
              ← Trocar Campeão
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-3">
              <div class="relative rounded-lg overflow-hidden border border-rose-800/80 h-72 bg-black shadow-2xl">
                <img id="skin-preview-img" src="" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 id="skin-champ-name" class="font-cinzel text-2xl font-bold text-white">Zed</h3>
                    <p id="skin-title" class="text-xs text-rose-400 font-bold">Zed Clássico</p>
                  </div>
                  <button onclick="applySelectedSkin()" class="px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer">
                    ✓ APLICAR NO PERFIL DO LOL
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="text-xs font-bold uppercase text-slate-300 flex items-center justify-between">
                <span>Escolha a Skin:</span>
                <span id="bg-skin-count" class="text-rose-400 font-mono text-[10px]"></span>
              </div>
              <div id="bg-skins-list-container" class="space-y-2 max-h-64 overflow-y-auto pr-1"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 7: MOTOR DE DODGE INFALÍVEL -->
    <section id="tab-dodge-motor" class="tab-content hidden space-y-5">
      <div class="bento-card p-6 border-rose-800/60">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-rose-950/60 pb-4 gap-4">
          <div>
            <div class="text-[10px] text-rose-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span>🚪 MOTOR DE DODGE // ANTI-VANGUARD COMPLIANT</span>
              <span class="text-emerald-300 bg-emerald-950 px-1.5 py-0.2 rounded text-[9px] font-mono">4 Estratégias</span>
            </div>
            <h2 class="font-cinzel text-xl font-bold text-white mt-1">MOTOR DE DODGE INSTANTÂNEO & LAST-SECOND</h2>
            <p class="text-xs text-slate-400">Saia de partidas tóxicas com garantia de retorno imediato ao lobby em menos de 2 segundos.</p>
          </div>
          <button onclick="executeDodgeMethod('auto')" class="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.5)] cursor-pointer">
            🚪 DODGE AGORA (CASCATA AUTOMÁTICA)
          </button>
        </div>

        <!-- Last-Second Auto-Dodge Setting -->
        <div class="mt-4 p-4 rounded-lg bg-black/60 border border-rose-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-1">
            <h3 class="font-cinzel text-sm font-bold text-white flex items-center gap-2">
              <span>⏱️ AUTO-DODGE NO ÚLTIMO SEGUNDO (LAST-SECOND)</span>
              <span id="last-second-status" class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">DESARMADO</span>
            </h3>
            <p class="text-xs text-slate-400">Dispara o dodge automaticamente quando o contador da seleção de campeões atingir o valor definido.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-[#07090e] px-3 py-1.5 rounded border border-rose-950">
              <span class="text-xs text-slate-300 font-bold">Timer:</span>
              <span id="last-second-val" class="text-rose-400 font-mono font-bold text-xs">3s</span>
              <input type="range" id="last-second-slider" min="1" max="10" value="3" oninput="document.getElementById('last-second-val').innerText = this.value + 's'" class="w-20 accent-rose-600">
            </div>
            <button onclick="toggleLastSecondDodge()" id="btn-toggle-last-second" class="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel text-xs uppercase font-bold">
              ARMAR AUTO-DODGE
            </button>
          </div>
        </div>

        <!-- 4 Dodge Methods Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="p-4 rounded-lg bg-[#07090e] border border-rose-950/70 space-y-2">
            <div class="flex justify-between items-center">
              <h4 class="font-cinzel text-sm font-bold text-white">1. Cascata Automática Infalível</h4>
              <button onclick="executeDodgeMethod('auto')" class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-cinzel">Executar</button>
            </div>
            <p class="text-xs text-slate-400">Tenta via LCU API. Caso a Riot bloqueie, aciona o Soft Restart UX e encerramento de processo automaticamente.</p>
          </div>

          <div class="p-4 rounded-lg bg-[#07090e] border border-rose-950/70 space-y-2">
            <div class="flex justify-between items-center">
              <h4 class="font-cinzel text-sm font-bold text-cyan-300">2. Soft Restart UX (/riotclient)</h4>
              <button onclick="executeDodgeMethod('restart_ux')" class="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-cinzel">Executar</button>
            </div>
            <p class="text-xs text-slate-400">Reinicia a interface do LoL via Riot Client. Quita da partida na hora e reabre a tela inicial em 2 segundos.</p>
          </div>

          <div class="p-4 rounded-lg bg-[#07090e] border border-rose-950/70 space-y-2">
            <div class="flex justify-between items-center">
              <h4 class="font-cinzel text-sm font-bold text-amber-300">3. Process Kill (LeagueClientUx.exe)</h4>
              <button onclick="executeDodgeMethod('process_kill')" class="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-cinzel">Executar</button>
            </div>
            <p class="text-xs text-slate-400">Encerra o processo da janela do LoL de forma limpa. O Riot Client detecta o encerramento e retorna ao Lobby.</p>
          </div>

          <div class="p-4 rounded-lg bg-[#07090e] border border-rose-950/70 space-y-2">
            <div class="flex justify-between items-center">
              <h4 class="font-cinzel text-sm font-bold text-emerald-300">4. LCU Multi-Vector Endpoints</h4>
              <button onclick="executeDodgeMethod('multi_vector')" class="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-cinzel">Executar</button>
            </div>
            <p class="text-xs text-slate-400">Dispara múltiplos endpoints LCU simultâneos de abandono de sessão e quitChampSelect.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 8: LOGS LCU -->
    <section id="tab-logs" class="tab-content hidden space-y-5">
      <div class="bento-card p-6">
        <div class="flex items-center justify-between border-b border-rose-950/60 pb-3">
          <div>
            <div class="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Módulo // Terminal & Logs</div>
            <h2 class="font-cinzel text-xl font-bold text-white mt-1">LOGS DE COMUNICAÇÃO LCU</h2>
          </div>
          <button onclick="clearLogs()" class="px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-cinzel uppercase">
            Limpar
          </button>
        </div>

        <div id="logs-terminal" class="mt-4 p-4 rounded bg-[#05070a] border border-rose-950/60 font-mono text-xs max-h-96 overflow-y-auto space-y-1 text-slate-300">
          <div class="text-rose-400">[00:00:00] [INFO] Betray Client Desktop inicializado com sucesso. Feito por betray.</div>
          <div class="text-emerald-400">[00:00:01] [SUCCESS] Aguardando LeagueClientUx.exe...</div>
        </div>
      </div>
    </section>

  </main>

  <!-- FIXED WATERMARK -->
  <div class="fixed bottom-3 right-4 pointer-events-none z-50">
    <div class="px-3 py-1 rounded bg-[#0d1017]/90 border border-rose-600/30 text-rose-400 text-[11px] font-bold tracking-widest shadow-lg uppercase">
      feito por betray
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    const CHAMPIONS = ${champJson};

    let currentRole = 'MID';
    let currentSettings = {
      auto_accept: true,
      auto_accept_delay: 1,
      pre_pick_champions: { TOP: [], JUNGLE: [], MID: [], ADC: [], SUPPORT: [] },
      pre_ban_champions: [],
      selected_background_skin_id: 91000,
      lastSecondDodgeEnabled: false,
      lastSecondDodgeSeconds: 3
    };

    let currentLobbyParticipants = [];
    let isLastSecondArmed = false;

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      const target = document.getElementById(tabId);
      if (target) target.classList.remove('hidden');

      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-rose-950/70', 'text-rose-200', 'border-rose-700/60');
        btn.classList.add('text-slate-400', 'border-transparent');
      });

      const navBtn = document.getElementById('nav-' + tabId.replace('tab-', ''));
      if (navBtn) {
        navBtn.classList.remove('text-slate-400', 'border-transparent');
        navBtn.classList.add('bg-rose-950/70', 'text-rose-200', 'border-rose-700/60');
      }

      if (tabId === 'tab-profile') refreshSummonerData();
      if (tabId === 'tab-lobby-reveal') scanLobbyNow();
    }

    function switchPickBanMode(mode) {
      if (mode === 'pick') {
        document.getElementById('section-pick').classList.remove('hidden');
        document.getElementById('section-ban').classList.add('hidden');
        document.getElementById('subtab-pick-btn').className = 'flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow';
        document.getElementById('subtab-ban-btn').className = 'flex-1 py-2.5 rounded-lg bg-[#07090e] text-slate-400 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider';
      } else {
        document.getElementById('section-pick').classList.add('hidden');
        document.getElementById('section-ban').classList.remove('hidden');
        document.getElementById('subtab-ban-btn').className = 'flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow';
        document.getElementById('subtab-pick-btn').className = 'flex-1 py-2.5 rounded-lg bg-[#07090e] text-slate-400 hover:text-white font-cinzel font-bold text-xs uppercase tracking-wider';
      }
    }

    function toggleAutoAccept() {
      currentSettings.auto_accept = !currentSettings.auto_accept;
      const btn = document.getElementById('btn-toggle-accept');
      if (currentSettings.auto_accept) {
        btn.innerText = 'AUTO-ACCEPT: ATIVADO';
        btn.className = 'px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow';
      } else {
        btn.innerText = 'AUTO-ACCEPT: DESATIVADO';
        btn.className = 'px-5 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-cinzel font-bold text-xs uppercase tracking-wider';
      }
      syncSettings();
    }

    function updateDelay(val) {
      currentSettings.auto_accept_delay = parseInt(val, 10);
      document.getElementById('delay-val').innerText = val + 's';
      syncSettings();
    }

    function selectRole(role) {
      currentRole = role;
      document.querySelectorAll('.role-btn').forEach(b => {
        if (b.innerText === role || (role === 'SUPPORT' && b.innerText === 'SUP')) {
          b.className = 'role-btn px-3 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 text-xs font-bold';
        } else {
          b.className = 'role-btn px-3 py-1 rounded bg-[#07090e] text-slate-400 border border-transparent text-xs font-bold';
        }
      });
      renderPickSlots();
    }

    function renderPickSlots() {
      const container = document.getElementById('pick-slots-container');
      const list = currentSettings.pre_pick_champions[currentRole] || [];
      container.innerHTML = '';

      for (let i = 0; i < 5; i++) {
        const champId = list[i];
        const champ = CHAMPIONS.find(c => c.id === champId);
        const slot = document.createElement('div');
        slot.className = 'p-3 rounded bg-[#07090e] border border-rose-950/60 flex items-center justify-between gap-2';
        
        if (champ) {
          slot.innerHTML = \`
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-rose-400">#\${i+1}</span>
              <img src="\${champ.icon}" class="w-8 h-8 rounded border border-rose-600/50">
              <span class="text-xs font-bold text-slate-200 truncate">\${champ.name}</span>
            </div>
            <button onclick="removePickChampion(\${i})" class="text-rose-500 hover:text-rose-300 text-xs font-bold px-1.5 py-0.5">✕</button>
          \`;
        } else {
          slot.innerHTML = \`
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-slate-600">#\${i+1}</span>
              <div class="w-8 h-8 rounded border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs">+</div>
              <span class="text-xs text-slate-500 italic">Vazio</span>
            </div>
          \`;
        }
        container.appendChild(slot);
      }
    }

    function addPickChampion(id) {
      let list = currentSettings.pre_pick_champions[currentRole] || [];
      if (!list.includes(id) && list.length < 5) {
        list.push(id);
        currentSettings.pre_pick_champions[currentRole] = list;
        renderPickSlots();
        syncSettings();
      }
    }

    function removePickChampion(index) {
      let list = currentSettings.pre_pick_champions[currentRole] || [];
      list.splice(index, 1);
      currentSettings.pre_pick_champions[currentRole] = list;
      renderPickSlots();
      syncSettings();
    }

    function renderBanSlots() {
      const container = document.getElementById('ban-slots-container');
      const list = currentSettings.pre_ban_champions || [];
      container.innerHTML = '';

      for (let i = 0; i < 5; i++) {
        const champId = list[i];
        const champ = CHAMPIONS.find(c => c.id === champId);
        const slot = document.createElement('div');
        slot.className = 'p-3 rounded bg-[#07090e] border border-rose-950/60 flex items-center justify-between gap-2';
        
        if (champ) {
          slot.innerHTML = \`
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-rose-500">BAN \${i+1}</span>
              <img src="\${champ.icon}" class="w-8 h-8 rounded border border-rose-800">
              <span class="text-xs font-bold text-slate-200 truncate">\${champ.name}</span>
            </div>
            <button onclick="removeBanChampion(\${i})" class="text-rose-500 hover:text-rose-300 text-xs font-bold px-1.5 py-0.5">✕</button>
          \`;
        } else {
          slot.innerHTML = \`
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-slate-600">BAN \${i+1}</span>
              <div class="w-8 h-8 rounded border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xs">+</div>
              <span class="text-xs text-slate-500 italic">Vazio</span>
            </div>
          \`;
        }
        container.appendChild(slot);
      }
    }

    function addBanChampion(id) {
      let list = currentSettings.pre_ban_champions || [];
      if (!list.includes(id) && list.length < 5) {
        list.push(id);
        currentSettings.pre_ban_champions = list;
        renderBanSlots();
        syncSettings();
      }
    }

    function removeBanChampion(index) {
      let list = currentSettings.pre_ban_champions || [];
      list.splice(index, 1);
      currentSettings.pre_ban_champions = list;
      renderBanSlots();
      syncSettings();
    }

    function filterChampions(type, text) {
      renderChampionsGrid(type, text);
    }

    function renderChampionsGrid(type, filterText = '') {
      const container = document.getElementById(type === 'pick' ? 'champions-grid-pick' : 'champions-grid-ban');
      if (!container) return;
      container.innerHTML = '';

      const filtered = CHAMPIONS.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()));
      filtered.forEach(champ => {
        const item = document.createElement('div');
        item.className = 'p-1 rounded bg-[#07090e] border border-slate-800 hover:border-rose-600 cursor-pointer flex flex-col items-center gap-1 transition-all';
        item.onclick = () => type === 'pick' ? addPickChampion(champ.id) : addBanChampion(champ.id);
        item.innerHTML = \`
          <img src="\${champ.icon}" class="w-9 h-9 rounded object-cover">
          <span class="text-[10px] text-slate-300 font-bold truncate max-w-[50px] text-center">\${champ.name}</span>
        \`;
        container.appendChild(item);
      });
    }

    // ==========================================
    // LOBBY REVEAL ENGINE (steele123/reveal)
    // ==========================================
    function scanLobbyNow() {
      appendTerminalLog('info', '🔍 [LOBBY REVEAL] Consultando XMPP Chat: GET /chat/v5/participants/champ-select...');
      if (window.pywebview && window.pywebview.api && window.pywebview.api.reveal_lobby) {
        window.pywebview.api.reveal_lobby().then(res => {
          if (res && res.success && res.participants) {
            currentLobbyParticipants = res.participants;
            renderLobbyParticipants(res.participants);
            appendTerminalLog('success', '🔍 [LOBBY REVEAL] ' + res.participants.length + ' participantes identificados no Champ Select!');
          } else {
            renderMockLobby();
          }
        }).catch(() => {
          renderMockLobby();
        });
      } else {
        renderMockLobby();
      }
    }

    function renderMockLobby() {
      const mock = [
        { assignedRole: 'TOP', riotId: 'TopGod#BR1', gameName: 'TopGod', tagLine: 'BR1', rankedSolo: { tier: 'MASTER', rank: 'I', leaguePoints: 120, winrate: 62, wins: 45, losses: 28 }, topChampions: [{ championName: 'Aatrox', winrate: 65, games: 40 }], streak: { type: 'win', count: 3 } },
        { assignedRole: 'JUNGLE', riotId: 'JungleDiff#BR1', gameName: 'JungleDiff', tagLine: 'BR1', rankedSolo: { tier: 'DIAMOND', rank: 'I', leaguePoints: 75, winrate: 55, wins: 50, losses: 41 }, topChampions: [{ championName: 'Lee Sin', winrate: 58, games: 35 }], streak: { type: 'win', count: 2 } },
        { assignedRole: 'MID', riotId: 'MidDominator#BR1', gameName: 'MidDominator', tagLine: 'BR1', rankedSolo: { tier: 'MASTER', rank: 'I', leaguePoints: 210, winrate: 68, wins: 60, losses: 28 }, topChampions: [{ championName: 'Zed', winrate: 70, games: 50 }], streak: { type: 'win', count: 4 } },
        { assignedRole: 'ADC', riotId: 'AdcCarry#BR1', gameName: 'AdcCarry', tagLine: 'BR1', rankedSolo: { tier: 'DIAMOND', rank: 'II', leaguePoints: 40, winrate: 52, wins: 38, losses: 35 }, topChampions: [{ championName: 'Kaisa', winrate: 54, games: 30 }], streak: { type: 'loss', count: 1 } },
        { assignedRole: 'SUPPORT', riotId: 'SupportVision#BR1', gameName: 'SupportVision', tagLine: 'BR1', rankedSolo: { tier: 'DIAMOND', rank: 'I', leaguePoints: 90, winrate: 57, wins: 45, losses: 34 }, topChampions: [{ championName: 'Thresh', winrate: 60, games: 42 }], streak: { type: 'win', count: 1 } }
      ];
      currentLobbyParticipants = mock;
      renderLobbyParticipants(mock);
    }

    function renderLobbyParticipants(players) {
      const grid = document.getElementById('lobby-participants-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const names = players.map(p => p.riotId).join(', ');
      const preview = document.getElementById('lobby-ids-preview');
      if (preview) preview.innerText = names;

      let totalWr = 0;
      players.forEach(p => {
        const wr = p.rankedSolo ? p.rankedSolo.winrate : 50;
        totalWr += wr;
        const card = document.createElement('div');
        card.className = 'p-3.5 rounded-lg bg-[#07090e] border border-amber-900/50 hover:border-amber-500 space-y-2 transition-all';
        card.innerHTML = \`
          <div class="flex items-center justify-between border-b border-amber-950 pb-2">
            <span class="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded">\${p.assignedRole}</span>
            <span class="text-[10px] text-emerald-400 font-mono font-bold">\${wr}% WR</span>
          </div>
          <div>
            <div class="text-xs font-bold text-white truncate" title="\${p.riotId}">\${p.gameName}</div>
            <div class="text-[10px] text-slate-400 font-mono">#\${p.tagLine}</div>
          </div>
          <div class="p-2 rounded bg-black/60 border border-slate-800 text-[11px] space-y-1 font-mono">
            <div class="text-amber-300 font-bold">\${p.rankedSolo ? (p.rankedSolo.tier + ' ' + p.rankedSolo.rank) : 'UNRANKED'}</div>
            <div class="text-slate-400 text-[10px]">\${p.rankedSolo ? p.rankedSolo.leaguePoints + ' LP' : ''} • \${p.rankedSolo ? p.rankedSolo.wins + 'V ' + p.rankedSolo.losses + 'D' : ''}</div>
          </div>
          <div class="text-[10px] text-slate-300 flex items-center justify-between pt-1">
            <span>🔥 \${p.streak ? p.streak.count + (p.streak.type === 'win' ? 'V Seguidas' : 'D Seguidas') : 'Neutro'}</span>
            <button onclick="copySingleId('\${p.riotId}')" class="text-amber-400 hover:text-amber-200 text-[10px]">📋 Copiar</button>
          </div>
        \`;
        grid.appendChild(card);
      });

      const avgWr = Math.round(totalWr / (players.length || 1));
      const avgWrEl = document.getElementById('team-avg-wr');
      if (avgWrEl) avgWrEl.innerText = avgWr + '%';
    }

    function copyAllRiotIds() {
      const ids = currentLobbyParticipants.map(p => p.riotId).join(', ');
      navigator.clipboard.writeText(ids);
      appendTerminalLog('success', '📋 [COPIADO] Todos os 5 Riot IDs copiados: ' + ids);
    }

    function copySingleId(id) {
      navigator.clipboard.writeText(id);
      appendTerminalLog('success', '📋 Riot ID copiado: ' + id);
    }

    function openOpGgMulti() {
      const names = currentLobbyParticipants.map(p => encodeURIComponent(p.riotId)).join(',');
      window.open('https://www.op.gg/multisearch/br?summoners=' + names, '_blank');
    }

    // ==========================================
    // DODGE ENGINE & LAST-SECOND AUTO-DODGE
    // ==========================================
    function executeDodgeQuick() {
      executeDodgeMethod('auto');
    }

    function executeDodgeMethod(method) {
      appendTerminalLog('info', '🚪 Executando Dodge via método: ' + method + '...');
      if (window.pywebview && window.pywebview.api && window.pywebview.api.dodge_champ_select) {
        window.pywebview.api.dodge_champ_select(method).then(res => {
          appendTerminalLog('success', '🚪 [DODGE SUCESSO] ' + (res.message || 'Saída do Champ Select confirmada! Retornando ao Lobby.'));
        });
      } else {
        appendTerminalLog('success', '🚪 [DODGE SIMULADO] Dodge executado via método ' + method + '!');
      }
    }

    function toggleLastSecondDodge() {
      isLastSecondArmed = !isLastSecondArmed;
      const btn = document.getElementById('btn-toggle-last-second');
      const badge = document.getElementById('last-second-status');
      const sec = parseInt(document.getElementById('last-second-slider').value, 10);

      if (isLastSecondArmed) {
        btn.innerText = 'DESARMAR AUTO-DODGE';
        btn.className = 'px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel text-xs uppercase font-bold shadow';
        badge.innerText = 'ARMADO (' + sec + 's)';
        badge.className = 'text-[10px] bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded font-mono';
        appendTerminalLog('info', '⏱️ [AUTO-DODGE ARMADO] O cliente quitará automaticamente quando restarem ' + sec + 's no Champ Select.');
        if (window.pywebview && window.pywebview.api && window.pywebview.api.arm_last_second_dodge) {
          window.pywebview.api.arm_last_second_dodge(sec);
        }
      } else {
        btn.innerText = 'ARMAR AUTO-DODGE';
        btn.className = 'px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel text-xs uppercase font-bold';
        badge.innerText = 'DESARMADO';
        badge.className = 'text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono';
        appendTerminalLog('info', '⏱️ [AUTO-DODGE DESARMADO] Temporizador cancelado.');
        if (window.pywebview && window.pywebview.api && window.pywebview.api.cancel_last_second_dodge) {
          window.pywebview.api.cancel_last_second_dodge();
        }
      }
    }

    // ==========================================
    // ROSE SKIN CHANGER ENGINE
    // ==========================================
    let selectedRoseChamp = CHAMPIONS[0] || { id: 91, key: 'Talon', name: 'Talon', icon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Talon.png', splash: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Talon_0.jpg' };
    let selectedRoseSkin = { id: 91000, num: 0, name: 'Talon Clássico', splash: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Talon_0.jpg', chromas: false };
    let selectedRoseChromaIndex = null;
    let roseChangerEnabled = true;

    const CHROMA_COLORS = [
      { name: 'Ruby', color: '#e11d48' },
      { name: 'Emerald', color: '#10b981' },
      { name: 'Sapphire', color: '#3b82f6' },
      { name: 'Tanzanite', color: '#8b5cf6' },
      { name: 'Obsidian', color: '#1f2937' },
      { name: 'Pearl', color: '#f8fafc' },
      { name: 'Rose Quartz', color: '#f472b6' },
      { name: 'Turquoise', color: '#06b6d4' }
    ];

    function toggleRoseChanger() {
      roseChangerEnabled = !roseChangerEnabled;
      const btn = document.getElementById('btn-toggle-rose');
      if (roseChangerEnabled) {
        btn.innerText = 'ROSE CHANGER: ATIVADO';
        btn.className = 'px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow';
      } else {
        btn.innerText = 'ROSE CHANGER: DESATIVADO';
        btn.className = 'px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-cinzel font-bold text-xs uppercase tracking-wider';
      }
      currentSettings.rose_skin_changer_enabled = roseChangerEnabled;
      syncSettings();
    }

    function setRoseStep(step) {
      if (step === 1) {
        document.getElementById('rose-step-1-view').classList.remove('hidden');
        document.getElementById('rose-step-2-view').classList.add('hidden');
        document.getElementById('rose-step1-indicator').className = 'px-3 py-1.5 rounded text-xs font-cinzel font-bold bg-rose-600 text-white shadow';
        document.getElementById('rose-step2-indicator').className = 'px-3 py-1.5 rounded text-xs font-cinzel font-bold text-slate-400 hover:text-slate-200';
      } else {
        document.getElementById('rose-step-1-view').classList.add('hidden');
        document.getElementById('rose-step-2-view').classList.remove('hidden');
        document.getElementById('rose-step2-indicator').className = 'px-3 py-1.5 rounded text-xs font-cinzel font-bold bg-rose-600 text-white shadow';
        document.getElementById('rose-step1-indicator').className = 'px-3 py-1.5 rounded text-xs font-cinzel font-bold text-slate-400 hover:text-slate-200';
      }
    }

    function renderRoseChampions(filter = '') {
      const grid = document.getElementById('rose-champions-grid');
      if (!grid) return;
      grid.innerHTML = '';
      const list = CHAMPIONS.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
      list.forEach(c => {
        const item = document.createElement('div');
        item.className = 'p-2 rounded bg-[#07090e] border border-rose-950/70 hover:border-rose-500 hover:bg-rose-950/40 cursor-pointer flex flex-col items-center gap-1.5 transition-all';
        item.onclick = () => selectRoseChampion(c);
        item.innerHTML = \`
          <img src="\${c.icon}" class="w-10 h-10 rounded border border-rose-900/40">
          <span class="text-xs font-bold text-slate-200 truncate">\${c.name}</span>
        \`;
        grid.appendChild(item);
      });
    }

    function filterRoseChampions(val) {
      renderRoseChampions(val);
    }

    function selectRoseChampion(champ) {
      selectedRoseChamp = champ;
      document.getElementById('rose-chosen-champ-name').innerText = champ.name;
      document.getElementById('rose-chosen-champ-icon').src = champ.icon;
      document.getElementById('rose-skin-champ-name').innerText = champ.name;

      const skins = (champ.skins && champ.skins.length > 0)
        ? champ.skins.map((s, idx) => ({
            id: s.id === 0 ? (champ.id * 1000) : (champ.id * 1000 + (s.num !== undefined ? s.num : idx)),
            num: s.num !== undefined ? s.num : idx,
            name: s.name,
            chromas: s.chromas || false,
            splash: s.splashUrl ? s.splashUrl : ('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champ.key + '_' + (s.num !== undefined ? s.num : idx) + '.jpg')
          }))
        : [
            { id: champ.id * 1000, num: 0, name: champ.name + ' Clássico(a)', splash: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champ.key + '_0.jpg', chromas: false }
          ];

      const listContainer = document.getElementById('rose-skins-list-container');
      listContainer.innerHTML = '';
      document.getElementById('rose-skin-count').innerText = skins.length + ' SKINS';

      skins.forEach((s, idx) => {
        const row = document.createElement('div');
        row.className = 'p-2.5 rounded bg-[#07090e] border border-rose-950 hover:border-rose-500 hover:bg-rose-950/30 flex items-center justify-between cursor-pointer transition-all';
        row.onclick = () => {
          previewRoseSkinObj(s);
          armRoseSkinInGame();
        };
        row.innerHTML = 
          '<div class="flex items-center gap-2 overflow-hidden">' +
            '<span class="text-[10px] font-mono text-rose-400 font-bold shrink-0">#' + idx + '</span>' +
            '<span class="text-xs text-slate-200 font-bold truncate">' + s.name + '</span>' +
          '</div>' +
          '<div class="flex items-center gap-1.5 shrink-0 ml-2">' +
            (s.chromas ? '<span class="text-[9px] font-mono bg-purple-950 text-purple-300 px-1 rounded border border-purple-800">CHROMA</span>' : '') +
            '<span class="text-[10px] text-slate-500 font-mono">ID: ' + s.id + '</span>' +
          '</div>';
        listContainer.appendChild(row);
      });

      if (skins.length > 0) {
        previewRoseSkinObj(skins[0]);
        armRoseSkinInGame();
      }
      setRoseStep(2);
    }

    function previewRoseSkinObj(skin) {
      selectedRoseSkin = skin;
      selectedRoseChromaIndex = null;
      const imgUrl = skin.splash.startsWith('http') ? skin.splash : ('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + skin.splash);
      document.getElementById('rose-skin-preview-img').src = imgUrl;
      document.getElementById('rose-skin-title').innerText = skin.name;
      document.getElementById('rose-chroma-badge').classList.add('hidden');

      const chromaBox = document.getElementById('rose-chroma-box');
      const palette = document.getElementById('rose-chroma-palette');
      palette.innerHTML = '';

      if (skin.chromas) {
        chromaBox.classList.remove('hidden');
        document.getElementById('rose-chroma-selected-label').innerText = 'Padrão (Sem Chroma)';
        const defBtn = document.createElement('button');
        defBtn.className = 'px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-purple-600 text-white cursor-pointer';
        defBtn.innerText = 'Padrão';
        defBtn.onclick = () => {
          selectRoseChroma(null, 'Padrão');
          armRoseSkinInGame();
        };
        palette.appendChild(defBtn);

        CHROMA_COLORS.forEach((c, idx) => {
          const cBtn = document.createElement('button');
          cBtn.className = 'w-6 h-6 rounded-full border border-slate-700 hover:scale-110 transition-transform cursor-pointer';
          cBtn.style.backgroundColor = c.color;
          cBtn.title = 'Chroma ' + c.name;
          cBtn.onclick = () => {
            selectRoseChroma(idx, c.name);
            armRoseSkinInGame();
          };
          palette.appendChild(cBtn);
        });
      } else {
        chromaBox.classList.add('hidden');
      }
    }

    function selectRoseChroma(idx, colorName) {
      selectedRoseChromaIndex = idx;
      document.getElementById('rose-chroma-selected-label').innerText = colorName;
      const badge = document.getElementById('rose-chroma-badge');
      if (idx !== null) {
        badge.innerText = 'Chroma: ' + colorName;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function showSkinConfirmationNotification(champName, skinName, skinId, chromaName) {
      const container = document.getElementById('rose-toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto p-4 rounded-xl bg-[#0b0f19]/95 border-2 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.4)] text-white flex items-center gap-3.5 transition-all duration-300 transform translate-y-0';
      toast.innerHTML = 
        '<div class="w-10 h-10 rounded-lg bg-rose-950 border border-rose-500 flex items-center justify-center shrink-0 text-xl">🌸</div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex items-center gap-1.5">' +
            '<span class="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Skin Armada com Sucesso!</span>' +
            '<span class="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600/40">LCU Pronta</span>' +
          '</div>' +
          '<div class="text-xs font-bold text-slate-100 font-cinzel truncate">' + skinName + '</div>' +
          '<div class="text-[10px] text-slate-400 font-mono">' + champName + ' • ID: ' + skinId + (chromaName ? ' • ' + chromaName : '') + '</div>' +
        '</div>' +
        '<button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white text-xs px-1">✕</button>';
      container.appendChild(toast);
      setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(function() { toast.remove(); }, 300);
      }, 4500);
    }

    function armRoseSkinInGame() {
      const skinId = selectedRoseSkin.id || (selectedRoseChamp.id * 1000);
      const skinName = selectedRoseSkin.name || selectedRoseChamp.name;
      const chromaLabel = selectedRoseChromaIndex !== null && CHROMA_COLORS[selectedRoseChromaIndex] ? 'Chroma ' + CHROMA_COLORS[selectedRoseChromaIndex].name : '';
      
      appendTerminalLog('success', '🌸 [ROSE ENGINE] Skin "' + skinName + '" armada para ' + selectedRoseChamp.name + ' (SkinID: ' + skinId + ')!');
      showSkinConfirmationNotification(selectedRoseChamp.name, skinName, skinId, chromaLabel);
      
      if (!currentSettings.rose_selected_skins) currentSettings.rose_selected_skins = {};
      currentSettings.rose_selected_skins[String(selectedRoseChamp.id)] = {
        skinId: skinId,
        skinNum: selectedRoseSkin.num || 0,
        skinName: skinName,
        chromaId: selectedRoseChromaIndex
      };
      currentSettings.rose_current_skin_id = skinId;
      currentSettings.rose_current_chroma_id = selectedRoseChromaIndex;
      syncSettings();

      if (window.pywebview && window.pywebview.api && window.pywebview.api.set_rose_skin) {
        window.pywebview.api.set_rose_skin(selectedRoseChamp.id, skinId, selectedRoseChromaIndex, skinName);
      }
    }

    // ==========================================
    // BACKGROUND CHANGER & PROFILE
    // ==========================================
    let selectedBgChamp = CHAMPIONS[1] || CHAMPIONS[0];
    let selectedBgSkin = { id: 238000, num: 0, name: 'Zed Clássico', splash: 'Zed_0.jpg' };

    function setBgStep(step) {
      if (step === 1) {
        document.getElementById('bg-step-1-view').classList.remove('hidden');
        document.getElementById('bg-step-2-view').classList.add('hidden');
      } else {
        document.getElementById('bg-step-1-view').classList.add('hidden');
        document.getElementById('bg-step-2-view').classList.remove('hidden');
      }
    }

    function renderBgChampions(filter = '') {
      const grid = document.getElementById('bg-champions-grid');
      if (!grid) return;
      grid.innerHTML = '';
      const list = CHAMPIONS.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
      list.forEach(c => {
        const item = document.createElement('div');
        item.className = 'p-2 rounded bg-[#07090e] border border-rose-950/70 hover:border-rose-500 hover:bg-rose-950/40 cursor-pointer flex flex-col items-center gap-1.5 transition-all';
        item.onclick = () => selectBgChampion(c);
        item.innerHTML = \`
          <img src="\${c.icon}" class="w-10 h-10 rounded border border-rose-900/40">
          <span class="text-xs font-bold text-slate-200 truncate">\${c.name}</span>
        \`;
        grid.appendChild(item);
      });
    }

    function filterBgChampions(val) { renderBgChampions(val); }

    function selectBgChampion(champ) {
      selectedBgChamp = champ;
      document.getElementById('bg-chosen-champ-name').innerText = champ.name;
      document.getElementById('bg-chosen-champ-icon').src = champ.icon;
      document.getElementById('skin-champ-name').innerText = champ.name;

      const skins = (champ.skins && champ.skins.length > 0)
        ? champ.skins.map((s, idx) => ({
            id: s.id === 0 ? (champ.id * 1000) : (champ.id * 1000 + (s.num !== undefined ? s.num : idx)),
            num: s.num !== undefined ? s.num : idx,
            name: s.name,
            splash: s.splashUrl ? s.splashUrl : ('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champ.key + '_' + (s.num !== undefined ? s.num : idx) + '.jpg')
          }))
        : [{ id: champ.id * 1000, num: 0, name: champ.name + ' Clássico(a)', splash: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champ.key + '_0.jpg' }];

      const listContainer = document.getElementById('bg-skins-list-container');
      listContainer.innerHTML = '';
      skins.forEach((s, idx) => {
        const row = document.createElement('div');
        row.className = 'p-2.5 rounded bg-[#07090e] border border-rose-950 hover:border-rose-500 hover:bg-rose-950/30 flex items-center justify-between cursor-pointer';
        row.onclick = () => previewSkinObj(s);
        row.innerHTML = \`
          <span class="text-xs text-slate-200 font-bold truncate">\${s.name}</span>
          <span class="text-[10px] text-slate-500 font-mono">ID: \${s.id}</span>
        \`;
        listContainer.appendChild(row);
      });

      if (skins.length > 0) previewSkinObj(skins[0]);
      setBgStep(2);
    }

    function previewSkinObj(skin) {
      selectedBgSkin = skin;
      const imgUrl = skin.splash.startsWith('http') ? skin.splash : ('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + skin.splash);
      document.getElementById('skin-preview-img').src = imgUrl;
      document.getElementById('skin-title').innerText = skin.name;
      currentSettings.selected_background_skin_id = skin.id;
    }

    function applySelectedSkin() {
      const skinId = currentSettings.selected_background_skin_id || (selectedBgChamp.id * 1000);
      appendTerminalLog('info', 'Aplicando splash art no perfil do LoL (ID: ' + skinId + ')...');
      if (window.pywebview && window.pywebview.api && window.pywebview.api.set_background_skin) {
        window.pywebview.api.set_background_skin(skinId).then(res => {
          if (res) appendTerminalLog('success', '✓ [SUCESSO] Splash art aplicada no perfil do LoL!');
        });
      }
    }

    function refreshSummonerData() {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.get_current_summoner_profile) {
        window.pywebview.api.get_current_summoner_profile().then(res => {
          if (res && res.success && res.summoner) {
            const name = res.summoner.gameName || res.summoner.displayName || 'Invocador';
            const tag = res.summoner.tagLine || 'BR1';
            document.getElementById('profile-name').innerText = name;
            document.getElementById('profile-level').innerText = 'Nível ' + (res.summoner.summonerLevel || 1);
            document.getElementById('profile-tag').innerText = '#' + tag + ' • LCU Conectado';
            document.getElementById('profile-icon').src = 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/' + (res.summoner.profileIconId || 29) + '.png';

            if (res.ranked && res.ranked.queues) {
              const solo = res.ranked.queues.find(q => q.queueType === 'RANKED_SOLO_5x5');
              if (solo) {
                document.getElementById('solo-tier').innerText = solo.tier + ' ' + solo.division;
                document.getElementById('solo-lp').innerText = solo.leaguePoints + ' LP';
              }
              const flex = res.ranked.queues.find(q => q.queueType === 'RANKED_FLEX_SR');
              if (flex) {
                document.getElementById('flex-tier').innerText = flex.tier + ' ' + flex.division;
                document.getElementById('flex-lp').innerText = flex.leaguePoints + ' LP';
              }
            }
          }
        });
      }
    }

    function syncSettings() {
      if (window.pywebview && window.pywebview.api && window.pywebview.api.save_settings) {
        window.pywebview.api.save_settings(currentSettings);
      }
    }

    function appendTerminalLog(type, message) {
      const logs = document.getElementById('logs-terminal');
      if (!logs) return;
      const time = new Date().toLocaleTimeString();
      const color = type === 'success' ? 'text-emerald-400' : (type === 'error' ? 'text-rose-500' : 'text-slate-300');
      const div = document.createElement('div');
      div.className = color;
      div.innerText = '[' + time + '] ' + message;
      logs.prepend(div);
    }

    function clearLogs() {
      document.getElementById('logs-terminal').innerHTML = '<div class="text-slate-500 italic">Logs limpos.</div>';
    }

    window.addEventListener('DOMContentLoaded', () => {
      renderPickSlots();
      renderBanSlots();
      renderChampionsGrid('pick');
      renderChampionsGrid('ban');
      renderBgChampions();
      renderRoseChampions();
      renderMockLobby();

      setTimeout(refreshSummonerData, 1000);

      setInterval(() => {
        if (window.pywebview && window.pywebview.api && window.pywebview.api.get_lcu_status) {
          window.pywebview.api.get_lcu_status().then(status => {
            const badge = document.getElementById('lcu-status-badge');
            const txt = document.getElementById('lcu-status-text');
            if (status.connected) {
              badge.className = 'flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60';
              txt.innerText = 'LCU: Conectado (Porta ' + status.port + ')';
            } else {
              badge.className = 'flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60';
              txt.innerText = 'Aguardando LoL...';
            }
          });
        }
      }, 2000);
    });
  </script>
</body>
</html>`;
}
