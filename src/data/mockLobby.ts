import { LobbyParticipant, LobbyTeamAnalysis } from '../types';

export const MOCK_LOBBY_PARTICIPANTS: LobbyParticipant[] = [
  {
    cellId: 0,
    summonerId: '9001',
    puuid: 'puuid-top-lane-1234',
    gameName: 'BrTT Fã',
    tagLine: 'BR1',
    riotId: 'BrTT Fã#BR1',
    assignedRole: 'TOP',
    anonymousAlias: 'Aliado 1 (Topo)',
    summonerLevel: 412,
    profileIconId: 588,
    profileIconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/588.png',
    championId: 266, // Aatrox
    championName: 'Aatrox',
    championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Aatrox.png',
    rankedSolo: {
      tier: 'MASTER',
      rank: 'I',
      leaguePoints: 185,
      wins: 142,
      losses: 110,
      winrate: 56,
      hotStreak: true
    },
    rankedFlex: {
      tier: 'DIAMOND',
      rank: 'II',
      leaguePoints: 45,
      wins: 34,
      losses: 22,
      winrate: 61
    },
    topChampions: [
      {
        championId: 266,
        championName: 'Aatrox',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Aatrox.png',
        games: 86,
        winrate: 59,
        kda: '3.4:1'
      },
      {
        championId: 24,
        championName: 'Jax',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jax.png',
        games: 52,
        winrate: 54,
        kda: '2.8:1'
      },
      {
        championId: 875,
        championName: "Sett",
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Sett.png',
        games: 34,
        winrate: 53,
        kda: '2.5:1'
      }
    ],
    recentHistory: [
      { win: true, championId: 266, championName: 'Aatrox', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Aatrox.png', kills: 8, deaths: 2, assists: 9, kda: '8.5:1', role: 'TOP' },
      { win: true, championId: 266, championName: 'Aatrox', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Aatrox.png', kills: 6, deaths: 4, assists: 11, kda: '4.25:1', role: 'TOP' },
      { win: true, championId: 24, championName: 'Jax', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jax.png', kills: 11, deaths: 3, assists: 5, kda: '5.33:1', role: 'TOP' },
      { win: false, championId: 266, championName: 'Aatrox', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Aatrox.png', kills: 4, deaths: 7, assists: 3, kda: '1.0:1', role: 'TOP' },
      { win: true, championId: 875, championName: 'Sett', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Sett.png', kills: 9, deaths: 5, assists: 8, kda: '3.4:1', role: 'TOP' }
    ],
    streak: {
      type: 'win',
      count: 3
    },
    tags: [
      { label: '🔥 On Fire (3W)', color: 'emerald', tooltip: 'Sequência de 3 vitórias seguidas nas últimas partidas' },
      { label: '🛡️ Rota Principal', color: 'cyan', tooltip: 'Jogador especialista na rota do Topo (88% das partidas)' },
      { label: '⭐ 59% WR Aatrox', color: 'purple', tooltip: 'Alta taxa de vitória com o campeão mais jogado' }
    ]
  },
  {
    cellId: 1,
    summonerId: '9002',
    puuid: 'puuid-jungle-5678',
    gameName: 'Shadow Walker',
    tagLine: 'NOVA',
    riotId: 'Shadow Walker#NOVA',
    assignedRole: 'JUNGLE',
    anonymousAlias: 'Aliado 2 (Selva)',
    summonerLevel: 278,
    profileIconId: 4658,
    profileIconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/4658.png',
    championId: 64, // Lee Sin
    championName: 'Lee Sin',
    championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png',
    rankedSolo: {
      tier: 'GRANDMASTER',
      rank: 'I',
      leaguePoints: 340,
      wins: 210,
      losses: 165,
      winrate: 56,
      hotStreak: true
    },
    rankedFlex: {
      tier: 'MASTER',
      rank: 'I',
      leaguePoints: 80,
      wins: 45,
      losses: 30,
      winrate: 60
    },
    topChampions: [
      {
        championId: 64,
        championName: 'Lee Sin',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png',
        games: 130,
        winrate: 58,
        kda: '4.1:1'
      },
      {
        championId: 121,
        championName: "Kha'Zix",
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Khazix.png',
        games: 78,
        winrate: 62,
        kda: '3.9:1'
      },
      {
        championId: 76,
        championName: 'Nidalee',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Nidalee.png',
        games: 44,
        winrate: 52,
        kda: '2.9:1'
      }
    ],
    recentHistory: [
      { win: true, championId: 64, championName: 'Lee Sin', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png', kills: 9, deaths: 1, assists: 14, kda: '23.0:1', role: 'JUNGLE' },
      { win: true, championId: 121, championName: "Kha'Zix", championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Khazix.png', kills: 14, deaths: 3, assists: 6, kda: '6.67:1', role: 'JUNGLE' },
      { win: true, championId: 64, championName: 'Lee Sin', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png', kills: 7, deaths: 2, assists: 12, kda: '9.5:1', role: 'JUNGLE' },
      { win: true, championId: 64, championName: 'Lee Sin', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png', kills: 5, deaths: 4, assists: 16, kda: '5.25:1', role: 'JUNGLE' },
      { win: false, championId: 76, championName: 'Nidalee', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Nidalee.png', kills: 3, deaths: 6, assists: 5, kda: '1.33:1', role: 'JUNGLE' }
    ],
    streak: {
      type: 'win',
      count: 4
    },
    tags: [
      { label: '🔥 On Fire (4W)', color: 'emerald', tooltip: '4 vitórias consecutivas no histórico recente' },
      { label: '🏆 High ELO (GM 340 LP)', color: 'purple', tooltip: 'Grão-Mestre com elo elevado' },
      { label: '⭐ OTP Lee Sin (130J)', color: 'cyan', tooltip: 'Especialista em Lee Sin e assassinos de selva' }
    ]
  },
  {
    cellId: 2,
    summonerId: '9003',
    puuid: 'puuid-mid-local-9999',
    gameName: 'Betray',
    tagLine: 'BR1',
    riotId: 'Betray#BR1',
    assignedRole: 'MID',
    anonymousAlias: 'Você (Meio)',
    isLocalPlayer: true,
    summonerLevel: 365,
    profileIconId: 548,
    profileIconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/548.png',
    championId: 91, // Talon
    championName: 'Talon',
    championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Talon.png',
    rankedSolo: {
      tier: 'MASTER',
      rank: 'I',
      leaguePoints: 240,
      wins: 168,
      losses: 122,
      winrate: 58,
      hotStreak: true
    },
    rankedFlex: {
      tier: 'DIAMOND',
      rank: 'I',
      leaguePoints: 75,
      wins: 48,
      losses: 25,
      winrate: 66
    },
    topChampions: [
      {
        championId: 91,
        championName: 'Talon',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Talon.png',
        games: 165,
        winrate: 63,
        kda: '4.2:1'
      },
      {
        championId: 238,
        championName: 'Zed',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Zed.png',
        games: 98,
        winrate: 59,
        kda: '3.7:1'
      },
      {
        championId: 7,
        championName: 'LeBlanc',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Leblanc.png',
        games: 45,
        winrate: 56,
        kda: '3.1:1'
      }
    ],
    recentHistory: [
      { win: true, championId: 91, championName: 'Talon', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Talon.png', kills: 16, deaths: 2, assists: 7, kda: '11.5:1', role: 'MID' },
      { win: true, championId: 91, championName: 'Talon', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Talon.png', kills: 12, deaths: 4, assists: 9, kda: '5.25:1', role: 'MID' },
      { win: true, championId: 238, championName: 'Zed', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Zed.png', kills: 10, deaths: 3, assists: 6, kda: '5.33:1', role: 'MID' },
      { win: false, championId: 91, championName: 'Talon', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Talon.png', kills: 8, deaths: 5, assists: 4, kda: '2.4:1', role: 'MID' },
      { win: true, championId: 7, championName: 'LeBlanc', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Leblanc.png', kills: 11, deaths: 1, assists: 10, kda: '21.0:1', role: 'MID' }
    ],
    streak: {
      type: 'win',
      count: 3
    },
    tags: [
      { label: '👑 Local Player (Você)', color: 'emerald', tooltip: 'Sua conta conectada ao cliente' },
      { label: '🗡️ OTP Talon (63% WR)', color: 'purple', tooltip: '165 partidas com taxa de vitória expressiva' },
      { label: '🔥 On Fire (3W)', color: 'emerald', tooltip: 'Sequência positiva nas últimas partidas' }
    ]
  },
  {
    cellId: 3,
    summonerId: '9004',
    puuid: 'puuid-adc-1122',
    gameName: 'KaiSa Only',
    tagLine: 'VOID',
    riotId: 'KaiSa Only#VOID',
    assignedRole: 'ADC',
    anonymousAlias: 'Aliado 3 (ADC)',
    summonerLevel: 195,
    profileIconId: 4425,
    profileIconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/4425.png',
    championId: 145, // Kai'Sa
    championName: "Kai'Sa",
    championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kaisa.png',
    rankedSolo: {
      tier: 'MASTER',
      rank: 'I',
      leaguePoints: 120,
      wins: 115,
      losses: 98,
      winrate: 54,
      hotStreak: false
    },
    rankedFlex: {
      tier: 'DIAMOND',
      rank: 'III',
      leaguePoints: 20,
      wins: 25,
      losses: 20,
      winrate: 55
    },
    topChampions: [
      {
        championId: 145,
        championName: "Kai'Sa",
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kaisa.png',
        games: 110,
        winrate: 57,
        kda: '3.6:1'
      },
      {
        championId: 51,
        championName: 'Caitlyn',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Caitlyn.png',
        games: 45,
        winrate: 51,
        kda: '2.7:1'
      },
      {
        championId: 222,
        championName: 'Jinx',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jinx.png',
        games: 30,
        winrate: 50,
        kda: '2.4:1'
      }
    ],
    recentHistory: [
      { win: false, championId: 145, championName: "Kai'Sa", championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kaisa.png', kills: 4, deaths: 8, assists: 3, kda: '0.88:1', role: 'ADC' },
      { win: false, championId: 145, championName: "Kai'Sa", championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kaisa.png', kills: 2, deaths: 7, assists: 4, kda: '0.86:1', role: 'ADC' },
      { win: false, championId: 51, championName: 'Caitlyn', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Caitlyn.png', kills: 5, deaths: 9, assists: 2, kda: '0.78:1', role: 'ADC' },
      { win: true, championId: 145, championName: "Kai'Sa", championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kaisa.png', kills: 9, deaths: 3, assists: 7, kda: '5.33:1', role: 'ADC' },
      { win: true, championId: 222, championName: 'Jinx', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jinx.png', kills: 12, deaths: 4, assists: 8, kda: '5.0:1', role: 'ADC' }
    ],
    streak: {
      type: 'loss',
      count: 3
    },
    tags: [
      { label: '❄️ Loss Streak (3L)', color: 'rose', tooltip: 'Vem de 3 derrotas seguidas. Possível estado de tilt' },
      { label: '🎯 Main ADC', color: 'cyan', tooltip: 'Especialista na rota inferior (92% das partidas)' },
      { label: '⚠️ Alerta de KDA Recente', color: 'amber', tooltip: 'Média de KDA baixa nas últimas 3 partidas' }
    ]
  },
  {
    cellId: 4,
    summonerId: '9005',
    puuid: 'puuid-support-3344',
    gameName: 'Hook God',
    tagLine: 'HOOK',
    riotId: 'Hook God#HOOK',
    assignedRole: 'SUPPORT',
    anonymousAlias: 'Aliado 4 (Suporte)',
    summonerLevel: 510,
    profileIconId: 4890,
    profileIconUrl: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/4890.png',
    championId: 412, // Thresh
    championName: 'Thresh',
    championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Thresh.png',
    rankedSolo: {
      tier: 'MASTER',
      rank: 'I',
      leaguePoints: 210,
      wins: 180,
      losses: 140,
      winrate: 56,
      hotStreak: true
    },
    rankedFlex: {
      tier: 'DIAMOND',
      rank: 'I',
      leaguePoints: 60,
      wins: 50,
      losses: 30,
      winrate: 62
    },
    topChampions: [
      {
        championId: 412,
        championName: 'Thresh',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Thresh.png',
        games: 210,
        winrate: 59,
        kda: '3.8:1'
      },
      {
        championId: 111,
        championName: 'Nautilus',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Nautilus.png',
        games: 95,
        winrate: 55,
        kda: '3.2:1'
      },
      {
        championId: 89,
        championName: 'Leona',
        championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Leona.png',
        games: 60,
        winrate: 54,
        kda: '2.9:1'
      }
    ],
    recentHistory: [
      { win: true, championId: 412, championName: 'Thresh', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Thresh.png', kills: 2, deaths: 3, assists: 19, kda: '7.0:1', role: 'SUPPORT' },
      { win: true, championId: 412, championName: 'Thresh', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Thresh.png', kills: 1, deaths: 2, assists: 16, kda: '8.5:1', role: 'SUPPORT' },
      { win: true, championId: 111, championName: 'Nautilus', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Nautilus.png', kills: 3, deaths: 4, assists: 14, kda: '4.25:1', role: 'SUPPORT' },
      { win: true, championId: 412, championName: 'Thresh', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Thresh.png', kills: 0, deaths: 1, assists: 22, kda: '22.0:1', role: 'SUPPORT' },
      { win: false, championId: 89, championName: 'Leona', championIcon: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Leona.png', kills: 1, deaths: 5, assists: 8, kda: '1.8:1', role: 'SUPPORT' }
    ],
    streak: {
      type: 'win',
      count: 4
    },
    tags: [
      { label: '🔥 On Fire (4W)', color: 'emerald', tooltip: 'Sequência de 4 vitórias consecutivas' },
      { label: '⚓ OTP Suporte Engage', color: 'cyan', tooltip: 'Mais de 350 jogos de Thresh e Nautilus na temporada' },
      { label: '⭐ 59% WR Thresh', color: 'purple', tooltip: 'Alta consistência no campeão assinatura' }
    ]
  }
];

export function calculateLobbyAnalysis(participants: LobbyParticipant[]): LobbyTeamAnalysis {
  if (!participants || participants.length === 0) {
    return {
      averageWinrate: 0,
      averageTier: 'UNRANKED',
      winStreaksCount: 0,
      lossStreaksCount: 0,
      autofillsCount: 0,
      safetyScore: 50,
      recommendation: 'EQUILIBRADA',
      reasons: ['Aguardando dados da seleção de campeões']
    };
  }

  const validParticipants = participants.filter(p => p.rankedSolo && p.rankedSolo.winrate > 0);
  const totalWr = validParticipants.reduce((acc, p) => acc + p.rankedSolo.winrate, 0);
  const avgWr = validParticipants.length > 0 ? Math.round(totalWr / validParticipants.length) : 50;

  let winStreaks = 0;
  let lossStreaks = 0;
  let autofills = 0;
  const reasons: string[] = [];

  participants.forEach(p => {
    if (p.streak && p.streak.type === 'win' && p.streak.count >= 3) {
      winStreaks++;
    }
    if (p.streak && p.streak.type === 'loss' && p.streak.count >= 3) {
      lossStreaks++;
      reasons.push(`${p.gameName || p.anonymousAlias} está em sequência de ${p.streak.count} derrotas seguidas.`);
    }
    if (p.assignedRole === 'FILL' || p.tags.some(t => t.label.toLowerCase().includes('auto-fill'))) {
      autofills++;
      reasons.push(`${p.gameName || p.anonymousAlias} pode estar fora de sua rota principal (Autofill).`);
    }
  });

  // Calculate score (0-100)
  let score = 50;
  score += (avgWr - 50) * 1.8;
  score += winStreaks * 8;
  score -= lossStreaks * 12;
  score -= autofills * 8;

  score = Math.max(10, Math.min(99, Math.round(score)));

  let recommendation: LobbyTeamAnalysis['recommendation'] = 'EQUILIBRADA';
  if (score >= 75) {
    recommendation = 'FAVORAVEL';
    reasons.unshift(`Lobby altamente favorável com taxa de vitória média de ${avgWr}% e ${winStreaks} aliados On Fire.`);
  } else if (score <= 42 || lossStreaks >= 2) {
    recommendation = 'DODGE_RECOMENDADO';
    if (!reasons.length) {
      reasons.unshift('Probabilidade estatística reduzida. Alto índice de derrotas consecutivas na equipe.');
    }
  } else if (score < 60) {
    recommendation = 'ATENCAO';
  }

  return {
    averageWinrate: avgWr,
    averageTier: 'MASTER (Mestre)',
    winStreaksCount: winStreaks,
    lossStreaksCount: lossStreaks,
    autofillsCount: autofills,
    safetyScore: score,
    recommendation,
    reasons
  };
}
