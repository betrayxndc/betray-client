import { Role, Skin } from '../types';

export const DDRAGON_VERSION = '14.24.1';
export const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;
export const DDRAGON_IMG = 'https://ddragon.leagueoflegends.com/cdn/img';

export interface ChampionRawDef {
  id: number;
  key: string;
  name: string;
  title: string;
  roles: Role[];
  difficulty: number;
  skins: string[];
}

export function buildSkins(champKey: string, champName: string, skinNames: string[]): Skin[] {
  const skins: Skin[] = [
    {
      id: 0,
      num: 0,
      name: `${champName} Clássico(a)`,
      chromas: false,
      splashUrl: `${DDRAGON_IMG}/champion/splash/${champKey}_0.jpg`,
      uncenteredSplashUrl: `${DDRAGON_IMG}/champion/splash/${champKey}_0.jpg`,
      tileUrl: `${DDRAGON_IMG}/champion/loading/${champKey}_0.jpg`,
    }
  ];

  skinNames.forEach((name, idx) => {
    const num = idx + 1;
    skins.push({
      id: num,
      num: num,
      name: name,
      chromas: num % 2 === 0,
      splashUrl: `${DDRAGON_IMG}/champion/splash/${champKey}_${num}.jpg`,
      uncenteredSplashUrl: `${DDRAGON_IMG}/champion/splash/${champKey}_${num}.jpg`,
      tileUrl: `${DDRAGON_IMG}/champion/loading/${champKey}_${num}.jpg`,
    });
  });

  return skins;
}

export const ALL_RAW_CHAMPIONS: ChampionRawDef[] = [
  {
    id: 266,
    key: 'Aatrox',
    name: 'Aatrox',
    title: 'a Espada Darkin',
    roles: ['TOP'],
    difficulty: 2,
    skins: ['Aatrox Justiceiro', 'Mecha Aatrox', 'Aatrox Caçador dos Mares', 'Aatrox Lua Sangrenta', 'Aatrox Lua Sangrenta de Prestígio', 'Aatrox Vitorioso', 'Aatrox Odisseia', 'Aatrox Eclipse Lunar', 'Aatrox DRX', 'Aatrox DRX de Prestígio', 'Aatrox Primordiano']
  },
  {
    id: 103,
    key: 'Ahri',
    name: 'Ahri',
    title: 'a Raposa de Nove Caudas',
    roles: ['MID'],
    difficulty: 2,
    skins: ['Ahri da Dinastia', 'Ahri Noturna', 'Ahri Raposa Flamejante', 'Ahri Estrela do Pop', 'Ahri Desafiante', 'Ahri Colegial', 'Ahri Fliperama', 'Ahri Guardiã Estelar', 'Ahri K/DA', 'Ahri de Prestígio K/DA', 'Ahri Sabugueiro', 'Ahri Florescer Espiritual', 'Ahri K/DA ALL OUT', 'Ahri Congregação das Bruxas', 'Ahri Florescer Espiritual de Prestígio', 'Ahri Lenda Imortal']
  },
  {
    id: 84,
    key: 'Akali',
    name: 'Akali',
    title: 'a Assassina Renegada',
    roles: ['MID', 'TOP'],
    difficulty: 2,
    skins: ['Akali Aguilhoada', 'Akali Sinistra', 'Akali All-Star', 'Akali Enfermeira', 'Akali Lua Sangrenta', 'Akali Presas de Prata', 'Akali Caçadora de Cabeças', 'Akali Sashimi', 'Akali K/DA', 'Akali K/DA de Prestígio', 'PROJETO: Akali', 'Akali True Damage', 'Akali K/DA ALL OUT', 'Akali Guardiã Estelar', 'Akali DRX']
  },
  {
    id: 166,
    key: 'Akshan',
    name: 'Akshan',
    title: 'o Sentinela Rebelde',
    roles: ['MID', 'TOP'],
    difficulty: 2,
    skins: ['Akshan Cyberpop', 'Akshan Rosa de Cristal', 'Akshan Três Honras']
  },
  {
    id: 12,
    key: 'Alistar',
    name: 'Alistar',
    title: 'o Minotauro',
    roles: ['SUPPORT'],
    difficulty: 1,
    skins: ['Alistar Dourado', 'Alistar Matador', 'Alistar Longhorn', 'Alistar Infernal', 'Alistar Zagueiro', 'Alistar Saqueador', 'Alistar SKT T1', 'Alistar Vaquinha', 'Alistar Hextec', 'Alistar Conquistador', 'Alistar Fera Lunar', 'Alistar Rosa de Cristal']
  },
  {
    id: 799,
    key: 'Ambessa',
    name: 'Ambessa',
    title: 'a Matriarca da Guerra',
    roles: ['TOP', 'MID'],
    difficulty: 3,
    skins: ['Ambessa Rosa Negra', 'Ambessa Escolhida do Lobo']
  },
  {
    id: 32,
    key: 'Amumu',
    name: 'Amumu',
    title: 'a Múmia Triste',
    roles: ['JUNGLE', 'SUPPORT'],
    difficulty: 1,
    skins: ['Amumu Faraó', 'Amumu de Vancouver', 'Emumu', 'Amumu Presente de Grego', 'Amumu Quase-Rei do Baile', 'Amumu Robozinho', 'Amumu Festa Surpresa', 'Amumu Infernal', 'Amumu Fantasiado de Porquinho', 'Amumu Pesadelo na Cidade do Crime', 'Amumu Porcelana']
  },
  {
    id: 34,
    key: 'Anivia',
    name: 'Anivia',
    title: 'a Criofênix',
    roles: ['MID'],
    difficulty: 3,
    skins: ['Anivia Espírito de Equipe', 'Anivia de Rapina', 'Anivia Notívaga', 'Anivia Hextec', 'Anivia Gelo Sombrio', 'Anivia Carnavalia', 'Anivia Fliperama', 'Anivia Voo Cósmico', 'Anivia Fênix Divina']
  },
  {
    id: 1,
    key: 'Annie',
    name: 'Annie',
    title: 'a Criança Sombria',
    roles: ['MID', 'SUPPORT'],
    difficulty: 1,
    skins: ['Annie Gótica', 'Annie Chapeuzinho', 'Annie no País das Maravilhas', 'Annie Rainha do Baile', 'Annie do Raio de Gelo', 'Annie ao Contrário', 'Annie Panda', 'Annie Queridinha', 'Annie Hextec', 'Supergaláctica Annie', 'Annieversário', 'Annie Fera Lunar', 'Annie Fright Night']
  },
  {
    id: 523,
    key: 'Aphelios',
    name: 'Aphelios',
    title: 'a Arma dos Devotos',
    roles: ['ADC'],
    difficulty: 3,
    skins: ['Aphelios Emissário da Escuridão', 'Aphelios Fera Lunar', 'EDG Aphelios', 'Aphelios Florescer Espiritual', 'Aphelios Heartsteel']
  },
  {
    id: 22,
    key: 'Ashe',
    name: 'Ashe',
    title: 'a Arqueira do Gelo',
    roles: ['ADC', 'SUPPORT'],
    difficulty: 1,
    skins: ['Ashe de Freljord', 'Ashe Sherwood', 'Ashe Woad', 'Ashe Rainha', 'Ashe Ametista', 'Ashe Cupido Mortal', 'Ashe Saqueadora', 'PROJETO: Ashe', 'Ashe Campeonato', 'Ashe Velho Oeste', 'Ashe Sabugueiro', 'Ashe Dragão Feérico', 'Ashe Congregação das Bruxas', 'Ashe Rosa de Cristal']
  },
  {
    id: 136,
    key: 'AurelionSol',
    name: 'Aurelion Sol',
    title: 'o Forjador de Estrelas',
    roles: ['MID'],
    difficulty: 2,
    skins: ['Aurelion Sol Senhor das Cinzas', 'Aurelion Sol Mecha', 'Aurelion Sol Dragão da Tormenta', 'Aurelion Sol Tinta Sombria', 'Aurelion Sol Porcelana']
  },
  {
    id: 893,
    key: 'Aurora',
    name: 'Aurora',
    title: 'a Bruxa entre Mundos',
    roles: ['MID', 'TOP'],
    difficulty: 2,
    skins: ['Aurora Esquadrão Anima']
  },
  {
    id: 268,
    key: 'Azir',
    name: 'Azir',
    title: 'o Imperador das Areias',
    roles: ['MID'],
    difficulty: 3,
    skins: ['Azir Galáctico', 'Azir Senhor do Trovão', 'Azir SKT T1', 'Azir Reinos Combatentes', 'Azir Sabugueiro', 'Azir Mundial 2022']
  },
  {
    id: 432,
    key: 'Bard',
    name: 'Bardo',
    title: 'o Protetor Andarilho',
    roles: ['SUPPORT'],
    difficulty: 3,
    skins: ['Bardo Bosque Sagrado', 'Bardo Dia Nevado', 'Bardo Bardo', 'Bardo Astronauta', 'Bardo Café das Cariátides', 'Bardo Pergaminhos de Shan Hai']
  },
  {
    id: 200,
    key: 'Belveth',
    name: 'Bel\'Veth',
    title: 'a Imperatriz do Vazio',
    roles: ['JUNGLE'],
    difficulty: 2,
    skins: ['Bel\'Veth Chefona', 'Bel\'Veth Matriarca Cósmica']
  },
  {
    id: 53,
    key: 'Blitzcrank',
    name: 'Blitzcrank',
    title: 'o Grande Golem de Vapor',
    roles: ['SUPPORT'],
    difficulty: 1,
    skins: ['Blitzcrank Enferrujado', 'Blitzcrank Goleiro', 'Blitzcrank Nocaute', 'iBlitzcrank', 'Blitzcrank Tunado em Piltover', 'Certamente não é o Blitzcrank', 'Blitzcrank Chefão', 'Blitzcrank Caldeirão da Bruxa', 'Blitzcrank Embalos no Espaço', 'Blitzcrank Vitorioso', 'Blitzcrank Jogo Zenital']
  },
  {
    id: 63,
    key: 'Brand',
    name: 'Brand',
    title: 'a Vingança Flamejante',
    roles: ['MID', 'SUPPORT', 'JUNGLE'],
    difficulty: 2,
    skins: ['Brand Apocalíptico', 'Brand Vândalo', 'Brand Criogênico', 'Brand Zumbi', 'Brand Fogo Espiritual', 'Brand Chefão', 'Brand Arco Celeste', 'Brand Dragão Eterno', 'Brand Galante']
  },
  {
    id: 201,
    key: 'Braum',
    name: 'Braum',
    title: 'o Coração de Freljord',
    roles: ['SUPPORT'],
    difficulty: 2,
    skins: ['Braum Caçador de Dragões', 'Braum El Tigre', 'Braum Coração de Leão', 'Braum Noel', 'Braum Cidade do Crime', 'Braum Curtindo o Verão']
  },
  {
    id: 233,
    key: 'Briar',
    name: 'Briar',
    title: 'a Fome Contida',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Briar Demônio da Rua', 'Briar Primordiana']
  },
  {
    id: 51,
    key: 'Caitlyn',
    name: 'Caitlyn',
    title: 'a Xerife de Piltover',
    roles: ['ADC'],
    difficulty: 1,
    skins: ['Caitlyn Rebelde', 'Caitlyn Caçadora', 'Caitlyn Guerrilheira', 'Caitlyn da Resistência', 'Caitlyn Safári', 'Caitlyn Policial', 'Caitlyn Caçadora de Cabeças', 'Caitlyn Espectro Lunar', 'Caitlyn Curtindo o Verão', 'Caitlyn Fliperama', 'Caitlyn Fliperama de Prestígio', 'Caitlyn Academia de Batalha', 'Caitlyn Arcane', 'Caitlyn Nevada', 'Caitlyn Heartthrob']
  },
  {
    id: 164,
    key: 'Camille',
    name: 'Camille',
    title: 'a Sombra de Aço',
    roles: ['TOP'],
    difficulty: 3,
    skins: ['Camille Cibernética', 'Camille Congregação das Bruxas', 'iG Camille', 'Camille Arcana', 'Camille Comandante de Ataque']
  },
  {
    id: 69,
    key: 'Cassiopeia',
    name: 'Cassiopeia',
    title: 'o Abraço da Serpente',
    roles: ['MID', 'TOP'],
    difficulty: 3,
    skins: ['Cassiopeia Desesperada', 'Cassiopeia Sereia', 'Cassiopeia Helênica', 'Cassiopeia Presas de Jade', 'Cassiopeia Eternum', 'Cassiopeia Florescer Espiritual', 'Cassiopeia Congregação das Bruxas']
  },
  {
    id: 31,
    key: 'Chogath',
    name: 'Cho\'Gath',
    title: 'o Terror do Vazio',
    roles: ['TOP', 'MID'],
    difficulty: 1,
    skins: ['Cho\'Gath Pesadelo', 'Cho\'Gath Cavalheiro', 'Cho\'Gath Lago Ness', 'Cho\'Gath Jurássico', 'Cho\'Gath Máquina de Combate', 'Cho\'Gath Estrela Negra', 'Cho\'Gath Pergaminhos de Shan Hai', 'Cho\'Gath Quebrador de Mundos']
  },
  {
    id: 42,
    key: 'Corki',
    name: 'Corki',
    title: 'o Bombardeiro Ousado',
    roles: ['MID', 'ADC'],
    difficulty: 2,
    skins: ['Corki OVNI', 'Corki Trenó de Gelo', 'Corki Barão Vermelho', 'Corki Caranga Envenenada', 'Corki Asa do Dragão', 'Corki Fliperama', 'Corki Corgi', 'Corki Astronauta']
  },
  {
    id: 122,
    key: 'Darius',
    name: 'Darius',
    title: 'a Mão de Noxus',
    roles: ['TOP'],
    difficulty: 2,
    skins: ['Lord Darius', 'Darius Bioforja', 'Darius Mestre da Enterrada', 'Darius Academia de Batalha', 'Darius Nova Temível', 'Darius Deus-Rei', 'Darius Velho Oeste', 'Darius Fera Lunar', 'Darius Crime City', 'Darius Florescer Espiritual', 'Darius Porcelana']
  },
  {
    id: 131,
    key: 'Diana',
    name: 'Diana',
    title: 'o Escárnio da Lua',
    roles: ['JUNGLE', 'MID'],
    difficulty: 2,
    skins: ['Diana Valquíria Sombria', 'Diana Deusa Lunar', 'Diana Infernal', 'Diana Lua Sangrenta', 'Diana Águas Sombrias', 'Diana Caçadora de Dragões', 'Diana Rainha de Batalha', 'Diana Rainha de Batalha de Prestígio', 'Diana Sentinela', 'Diana Fogos Artificiais', 'Diana Bênção do Inverno']
  },
  {
    id: 36,
    key: 'DrMundo',
    name: 'Dr. Mundo',
    title: 'o Louco de Zaun',
    roles: ['TOP', 'JUNGLE'],
    difficulty: 1,
    skins: ['Mundo Tóxico', 'Sr. Mundoverso', 'Mundo Corp.', 'Mundo Mundo', 'Mundo Carrasco', 'Mundo Enfurecido', 'TPA Mundo', 'Mundo Curtindo o Verão', 'Mundo Príncipe Congelado', 'Mundo Demônio da Rua']
  },
  {
    id: 119,
    key: 'Draven',
    name: 'Draven',
    title: 'o Carrasco de Noxus',
    roles: ['ADC'],
    difficulty: 3,
    skins: ['Draven Ceifador de Almas', 'Draven Gladiador', 'Draven Locutor', 'Draven Curtindo o Verão', 'Draven Caçador de Feras', 'Draven Noel', 'Draven Reinos Mech', 'Draven Ruína', 'Draven Galante', 'Draven Fright Night']
  },
  {
    id: 245,
    key: 'Ekko',
    name: 'Ekko',
    title: 'o Rapaz que Estilhaçou o Tempo',
    roles: ['MID', 'JUNGLE'],
    difficulty: 2,
    skins: ['Ekko Tempestade de Areia', 'Ekko Colegial', 'PROJETO: Ekko', 'Ekko Gostosuras ou Travessuras', 'Ekko True Damage', 'Ekko Pulsefire', 'Ekko Fogos Artificiais', 'Ekko Guardião Estelar', 'Ekko Guardião Estelar de Prestígio']
  },
  {
    id: 60,
    key: 'Elise',
    name: 'Elise',
    title: 'a Rainha das Aranhas',
    roles: ['JUNGLE'],
    difficulty: 3,
    skins: ['Elise Flor de Cerejeira', 'Elise Vitoriosa', 'Elise Lua Sangrenta', 'Elise Galáxia Negra', 'Elise Supergaláctica', 'Elise Feiticeira', 'Elise Rosa Definhada']
  },
  {
    id: 28,
    key: 'Evelynn',
    name: 'Evelynn',
    title: 'o Abraço da Agonia',
    roles: ['JUNGLE'],
    difficulty: 2,
    skins: ['Evelynn Sombria', 'Evelynn Mascarada', 'Evelynn Dançarina de Tango', 'Evelynn Infiltradora', 'Evelynn Lua Sangrenta', 'Evelynn K/DA', 'Evelynn K/DA de Prestígio', 'Evelynn Açucareira', 'Evelynn K/DA ALL OUT', 'Evelynn Congregação das Bruxas', 'Evelynn Florescer Espiritual', 'Evelynn High Noon']
  },
  {
    id: 81,
    key: 'Ezreal',
    name: 'Ezreal',
    title: 'o Explorador Pródigo',
    roles: ['ADC', 'MID'],
    difficulty: 1,
    skins: ['Ezreal de Nottingham', 'Ezreal Atacante', 'Ezreal Galante', 'Ezreal de Gelo Puro', 'Ezreal Explorador', 'Pulsefire Ezreal', 'TPA Ezreal', 'Ezreal Ás de Espadas', 'Ezreal Fliperama', 'Ezreal Guardião das Estrelas', 'SSG Ezreal', 'Ezreal Academia de Batalha', 'Ezreal PsyOps', 'Ezreal Porcelana', 'Ezreal Porcelana de Prestígio', 'Ezreal Heartsteel']
  },
  {
    id: 9,
    key: 'Fiddlesticks',
    name: 'Fiddlesticks',
    title: 'o Terror Ancestral',
    roles: ['JUNGLE', 'SUPPORT'],
    difficulty: 2,
    skins: ['Fiddlesticks Espectral', 'Fiddlesticks Espantalho', 'Fiddlesticks Cabeça de Abóbora', 'Fiddlesticks Bandido', 'Fiddlesticks Perna de Pau', 'Fiddlesticks Festa Surpresa', 'Fiddlesticks Doces Trevas', 'Fiddlesticks Ressurgido', 'Fiddlesticks Pretoriano', 'Fiddlesticks Guardião Estelar Nemesis']
  },
  {
    id: 114,
    key: 'Fiora',
    name: 'Fiora',
    title: 'a Grande Duelista',
    roles: ['TOP'],
    difficulty: 3,
    skins: ['Fiora Guardiã Real', 'Fiora Corvo Noturno', 'Fiora Diretora', 'PROJETO: Fiora', 'Fiora Curtindo o Verão', 'Fiora Espada Crescente', 'Fiora Espada do Coração', 'iG Fiora', 'Fiora Pulso de Fogo', 'Fiora Fera Lunar', 'Fiora Fera Lunar de Prestígio', 'Fiora Feiticeira']
  },
  {
    id: 105,
    key: 'Fizz',
    name: 'Fizz',
    title: 'o Trapaceiro das Marés',
    roles: ['MID', 'JUNGLE'],
    difficulty: 2,
    skins: ['Fizz Atlante', 'Fizz da Tundra', 'Fizz Pescador', 'Fizz do Vazio', 'Fizz Pelo Branquinho', 'Fizz Supergaláctico', 'Fizz Esquadrão Ômega', 'Fizz Doguinho', 'Fizz Doguinho de Prestígio', 'Fizz Pequeno Diabrete', 'Fizz Astronauta']
  },
  {
    id: 3,
    key: 'Galio',
    name: 'Galio',
    title: 'o Colosso',
    roles: ['MID', 'SUPPORT'],
    difficulty: 2,
    skins: ['Galio Enfeitiçado', 'Galio Hextec', 'Galio Comandante', 'Galio Guardião', 'Galio Galante', 'Galio Frango', 'Galio Infernal', 'Galio Dragão Feérico', 'Galio Criador Mítico']
  },
  {
    id: 41,
    key: 'Gangplank',
    name: 'Gangplank',
    title: 'o Terror dos Sete Mares',
    roles: ['TOP', 'MID'],
    difficulty: 3,
    skins: ['Gangplank Fantasma', 'Gangplank Minuto', 'Gangplank Marinheiro', 'Gangplank Soldadinho de Chumbo', 'Gangplank Forças Especiais', 'Gangplank Sultão', 'Gangplank Capitão', 'Gangplank Nova Temível', 'Gangplank Curtindo o Verão', 'FPX Gangplank', 'Gangplank Traidor']
  },
  {
    id: 86,
    key: 'Garen',
    name: 'Garen',
    title: 'o Poder de Demacia',
    roles: ['TOP', 'MID'],
    difficulty: 1,
    skins: ['Garen Sanguinário', 'Garen Cavaleiro do Terror', 'Garen Errante', 'Garen Legionário de Aço', 'Garen Almirante Fugitivo', 'Garen Deus-Rei', 'Garen Demacia Vice', 'Garen Reinos Mech', 'Garen Reinos Mech de Prestígio', 'Garen Academia de Batalha']
  },
  {
    id: 150,
    key: 'Gnar',
    name: 'Gnar',
    title: 'o Yordle Pré-Histórico',
    roles: ['TOP'],
    difficulty: 2,
    skins: ['Dino Gnar', 'Gentleman Gnar', 'Gnar Dia Nevado', 'Gnar El Macho', 'Super Gnar', 'SSG Gnar', 'Gnar Astronauta', 'Gnar Sabugueiro']
  },
  {
    id: 79,
    key: 'Gragas',
    name: 'Gragas',
    title: 'o Baluarte da Bebedeira',
    roles: ['JUNGLE', 'TOP', 'MID'],
    difficulty: 2,
    skins: ['Gragas Mergulhador', 'Gragas Noel', 'Gragas Pé-Grande', 'Gragas Fanático', 'Gragas Nobre', 'Gragas Oktoberfest', 'Gragas Operação no Ártico', 'Gragas Quebrador de Mundos', 'Gragas Embalos no Espaço']
  },
  {
    id: 104,
    key: 'Graves',
    name: 'Graves',
    title: 'o Foragido',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Graves Mercenário', 'Graves Fugitivo', 'Graves Mafioso', 'Graves Curtindo o Verão', 'Graves Degolador', 'Graves Dia Nevado', 'Graves Vitorioso', 'Graves Pretoriano', 'Graves Academia de Batalha', 'Graves Sentinela', 'Graves Porcelana']
  },
  {
    id: 887,
    key: 'Gwen',
    name: 'Gwen',
    title: 'a Costureira Encantada',
    roles: ['TOP', 'JUNGLE'],
    difficulty: 2,
    skins: ['Gwen Embalos no Espaço', 'Gwen Café das Cariátides', 'Gwen Soul Fighter']
  },
  {
    id: 120,
    key: 'Hecarim',
    name: 'Hecarim',
    title: 'a Sombra da Guerra',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Hecarim Cavaleiro Sanguinário', 'Hecarim Ceifador', 'Hecarim Cavaleiro Sem Cabeça', 'Hecarim Fliperama', 'Hecarim Sabugueiro', 'Hecarim Quebrador de Mundos', 'Hecarim Lancer Zero', 'Hecarim Velho Oeste', 'Hecarim Cósmico', 'Hecarim Arcana']
  },
  {
    id: 74,
    key: 'Heimerdinger',
    name: 'Heimerdinger',
    title: 'o Inventor Venerado',
    roles: ['MID', 'TOP', 'SUPPORT'],
    difficulty: 2,
    skins: ['Heimerdinger Invasor Alienígena', 'Heimerdinger em Manutenção', 'Heimerdinger Águas de Sentina', 'Heimerdinger Boneco de Neve', 'Heimerdinger Substâncias Perigosas', 'Heimerdinger Treinador de Dragões', 'Heimerdinger Curtindo o Verão']
  },
  {
    id: 910,
    key: 'Hwei',
    name: 'Hwei',
    title: 'o Visionário',
    roles: ['MID', 'SUPPORT'],
    difficulty: 3,
    skins: ['Hwei Bênção do Inverno']
  },
  {
    id: 420,
    key: 'Illaoi',
    name: 'Illaoi',
    title: 'a Sacerdotisa Cráquen',
    roles: ['TOP'],
    difficulty: 2,
    skins: ['Illaoi Portadora do Caos', 'Illaoi da Resistência', 'Illaoi Cósmica', 'Illaoi Lua Nevada', 'Illaoi Urso Polar']
  },
  {
    id: 39,
    key: 'Irelia',
    name: 'Irelia',
    title: 'a Dançarina das Lâminas',
    roles: ['TOP', 'MID'],
    difficulty: 3,
    skins: ['Irelia Lâminas Noturnas', 'Irelia Aviadora', 'Irelia Ninja', 'Irelia Lâmina Gélida', 'Irelia Ordem do Lótus', 'Irelia Espada Divina', 'iG Irelia', 'PROJETO: Irelia', 'PROJETO: Irelia de Prestígio', 'Irelia Sentinela', 'Irelia Criadora Mítica', 'Irelia Porcelana']
  },
  {
    id: 427,
    key: 'Ivern',
    name: 'Ivern',
    title: 'o Pai do Verde',
    roles: ['JUNGLE', 'SUPPORT'],
    difficulty: 2,
    skins: ['Ivern Rei dos Doces', 'Ivern Mestre Enterrador', 'Ivern Sabugueiro', 'Ivern Astronauta']
  },
  {
    id: 40,
    key: 'Janna',
    name: 'Janna',
    title: 'a Fúria da Tormenta',
    roles: ['SUPPORT'],
    difficulty: 1,
    skins: ['Janna Tempestuosa', 'Janna Hextec', 'Janna Rainha do Gelo', 'Janna Vitoriosa', 'Janna Espada Sagrada', 'Janna Guardiã Estelar', 'Janna Feiticeira', 'Janna Guardiã das Areias', 'Janna Rosa de Cristal', 'Janna Cyber Halo', 'Janna Cyber Halo de Prestígio']
  },
  {
    id: 59,
    key: 'JarvanIV',
    name: 'Jarvan IV',
    title: 'o Exemplo de Demacia',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 1,
    skins: ['Jarvan IV Matador de Dragões', 'Jarvan IV Forja das Trevas', 'Jarvan IV Vitorioso', 'Jarvan IV Reinos Combatentes', 'Fnatic Jarvan IV', 'Jarvan IV Estrela Negra', 'SSG Jarvan IV', 'Jarvan IV Hextec', 'Jarvan IV Mundial 2021', 'Jarvan IV Fera Lunar']
  },
  {
    id: 24,
    key: 'Jax',
    name: 'Jax',
    title: 'o Grão-Mestre das Armas',
    roles: ['TOP', 'JUNGLE'],
    difficulty: 2,
    skins: ['Jax do Grand Canyon', 'Jax Vândalo', 'Jax Pescador', 'PAX Jax', 'Jax Musculoso', 'Jax Nêmesis', 'SKT T1 Jax', 'Jax Vigia', 'Jax Cajado Divino', 'Jax Reinos Mech', 'Jax Conquistador', 'Jax Conquistador de Prestígio', 'PROJETO: Jax', 'Jax Neo PAX']
  },
  {
    id: 126,
    key: 'Jayce',
    name: 'Jayce',
    title: 'o Defensor do Amanhã',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Jayce Armadura Completa', 'Jayce Galante', 'Jayce Abandonado', 'Jayce Martelo Brilhante', 'Jayce Academia de Batalha', 'Jayce da Resistência', 'Jayce Arcane', 'Jayce Zênite', 'Jayce Sobrevivente']
  },
  {
    id: 202,
    key: 'Jhin',
    name: 'Jhin',
    title: 'o Virtuoso',
    roles: ['ADC', 'MID'],
    difficulty: 2,
    skins: ['Jhin Procurado', 'Jhin Lua Sangrenta', 'SKT T1 Jhin', 'PROJETO: Jhin', 'Jhin Cosmos Negro', 'Jhin Pergaminhos de Shan Hai', 'Jhin Emissário da Escuridão', 'Jhin Alma Penada']
  },
  {
    id: 222,
    key: 'Jinx',
    name: 'Jinx',
    title: 'o Gatilho Desenfreado',
    roles: ['ADC'],
    difficulty: 2,
    skins: ['Jinx Mafiosa', 'Jinx Fogos Artificiais', 'Jinx Caçadora de Zumbis', 'Jinx Guardiã Estelar', 'Jinx Duende Ambiciosa', 'Jinx Odisseia', 'PROJETO: Jinx', 'Jinx Heartseeker', 'Jinx Arcane', 'Jinx Gata de Batalha', 'Jinx Gata de Batalha de Prestígio', 'Jinx Café das Cariátides']
  },
  {
    id: 897,
    key: 'KSante',
    name: 'K\'Sante',
    title: 'o Orgulho de Nazumah',
    roles: ['TOP', 'MID'],
    difficulty: 3,
    skins: ['K\'Sante Empíreo', 'K\'Sante Empíreo de Prestígio', 'K\'Sante Heartsteel']
  },
  {
    id: 145,
    key: 'Kaisa',
    name: 'Kai\'Sa',
    title: 'a Filha do Vazio',
    roles: ['ADC'],
    difficulty: 2,
    skins: ['Kai\'Sa Disparos Angelicais', 'Kai\'Sa K/DA', 'Kai\'Sa K/DA de Prestígio', 'iG Kai\'Sa', 'Kai\'Sa Fliperama', 'Kai\'Sa K/DA ALL OUT', 'Kai\'Sa K/DA ALL OUT de Prestígio', 'Kai\'Sa Dragão da Lagoa', 'Kai\'Sa Guardiã Estelar', 'Kai\'Sa Tinta Sombria']
  },
  {
    id: 429,
    key: 'Kalista',
    name: 'Kalista',
    title: 'a Lança da Vingança',
    roles: ['ADC'],
    difficulty: 3,
    skins: ['Kalista Lua Sangrenta', 'Kalista Campeonato', 'SKT T1 Kalista', 'Kalista Saqueadora', 'Kalista Corte das Fadas']
  },
  {
    id: 43,
    key: 'Karma',
    name: 'Karma',
    title: 'a Iluminada',
    roles: ['SUPPORT', 'MID'],
    difficulty: 1,
    skins: ['Karma Flor de Cerejeira', 'Karma Deusa do Sol', 'Karma Tradicional', 'Karma Ordem do Lótus', 'Karma Vigia', 'Karma Inverno Mágico', 'Karma Conquistadora', 'Karma Estrela Negra', 'Karma Emissária da Luz', 'Karma Odisseia', 'Karma Ruína', 'Karma Rainha Fauno']
  },
  {
    id: 30,
    key: 'Karthus',
    name: 'Karthus',
    title: 'a Voz Mortal',
    roles: ['JUNGLE', 'MID', 'ADC'],
    difficulty: 2,
    skins: ['Karthus Fantasma', 'Karthus da Liberdade', 'Karthus Grim Reaper', 'Karthus Pentakill', 'Fnatic Karthus', 'Karthus Bane-Luz', 'Karthus Infernal', 'Karthus Pentakill III']
  },
  {
    id: 38,
    key: 'Kassadin',
    name: 'Kassadin',
    title: 'o Andarilho do Vazio',
    roles: ['MID'],
    difficulty: 2,
    skins: ['Kassadin das Profundezas', 'Kassadin Pré-Vazio', 'Kassadin Emissário das Trevas', 'Kassadin Lâmina do Trovão', 'Kassadin Ceifador Cósmico', 'Kassadin Conde', 'Kassadin Hextec']
  },
  {
    id: 55,
    key: 'Katarina',
    name: 'Katarina',
    title: 'a Lâmina Sinistra',
    roles: ['MID'],
    difficulty: 3,
    skins: ['Katarina Mercenária', 'Katarina Árbitra', 'Katarina Águas de Sentina', 'Katarina Tempestade de Areia', 'Katarina Noite Feliz', 'Katarina Comandante', 'Katarina Reinos Combatentes', 'PROJETO: Katarina', 'Katarina Juramento das Lâminas', 'Katarina Academia de Batalha', 'Katarina Rainha de Batalha', 'Katarina Corte das Fadas']
  },
  {
    id: 10,
    key: 'Kayle',
    name: 'Kayle',
    title: 'a Justa',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Kayle Prateada', 'Kayle Viridiana', 'Kayle Desmascarada', 'Kayle Nascida para Batalhar', 'Kayle Asas Etéreas', 'Riot Kayle', 'Kayle Inquisidora de Ferro', 'Kayle Pentakill', 'Kayle PsyOps', 'Kayle Caçadora de Dragões', 'Kayle Devoradora de Sol']
  },
  {
    id: 141,
    key: 'Kayn',
    name: 'Kayn',
    title: 'o Ceifador das Sombras',
    roles: ['JUNGLE'],
    difficulty: 2,
    skins: ['Kayn Caçador de Almas', 'Kayn Odisseia', 'Kayn Emissário da Luz', 'Kayn Emissário da Luz de Prestígio', 'Kayn Lua Nevada', 'Kayn Heartsteel']
  },
  {
    id: 85,
    key: 'Kennen',
    name: 'Kennen',
    title: 'o Coração da Tempestade',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Kennen Mortífero', 'Kennen Mestre do Pântano', 'Kennen Caratê', 'Kennen Doutor', 'Kennen Operação no Ártico', 'Kennen Lua Sangrenta', 'Kennen Super', 'Kennen Infernal', 'DWG Kennen']
  },
  {
    id: 121,
    key: 'Khazix',
    name: 'Kha\'Zix',
    title: 'o Ceifador do Vazio',
    roles: ['JUNGLE'],
    difficulty: 2,
    skins: ['Mecha Kha\'Zix', 'Kha\'Zix Guardião das Areias', 'Kha\'Zix Florescer Mortal', 'Kha\'Zix Estrela Negra', 'Kha\'Zix Campeonato', 'Kha\'Zix Odisseia', 'Kha\'Zix Lua Lunar']
  },
  {
    id: 203,
    key: 'Kindred',
    name: 'Kindred',
    title: 'os Caçadores Eternos',
    roles: ['JUNGLE'],
    difficulty: 3,
    skins: ['Kindred Fogo Sombrio', 'Kindred Supergalácticos', 'Kindred Florescer Espiritual', 'Kindred Porcelana', 'Kindred DRX', 'Kindred Woof and Lamb']
  },
  {
    id: 240,
    key: 'Kled',
    name: 'Kled',
    title: 'o Cavaleiro Desordeiro',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Sir Kled', 'Conde Kledula', 'Kled Saqueador', 'Kled Kibble-Head']
  },
  {
    id: 96,
    key: 'KogMaw',
    name: 'Kog\'Maw',
    title: 'a Boca do Abismo',
    roles: ['ADC', 'MID'],
    difficulty: 2,
    skins: ['Kog\'Maw Lagarta', 'Kog\'Maw de Sonora', 'Kog\'Maw Monarca', 'Kog\'Maw Rena', 'Kog\'Maw Dança do Leão', 'Kog\'Maw das Profundezas', 'Kog\'Maw Jurássico', 'Kog\'Maw Máquina de Combate', 'Pug\'Maw', 'Kog\'Maw Hextec', 'Kog\'Maw Arcanista', 'Kog\'Maw Abelhinha', 'Kog\'Maw Zap\'Maw']
  },
  {
    id: 7,
    key: 'Leblanc',
    name: 'LeBlanc',
    title: 'a Farsante',
    roles: ['MID', 'SUPPORT'],
    difficulty: 3,
    skins: ['LeBlanc Cruel', 'LeBlanc Prestigiosa', 'LeBlanc Natalina', 'LeBlanc Corvo Perverso', 'LeBlanc Bosque Sagrado', 'PROJETO: LeBlanc', 'LeBlanc Campeonato', 'LeBlanc Congregação das Bruxas', 'LeBlanc Rosa Definhada']
  },
  {
    id: 64,
    key: 'LeeSin',
    name: 'Lee Sin',
    title: 'o Monge Cego',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 3,
    skins: ['Lee Sin Tradicional', 'Lee Sin Acólito', 'Lee Sin Punhos de Aço', 'Lee Sin Muay Thai', 'Lee Sin Curtindo o Verão', 'SKT T1 Lee Sin', 'Lee Sin Punhos Divinos', 'Lee Sin Embaixador', 'Lee Sin Emissário da Escuridão', 'Lee Sin Emissário da Escuridão de Prestígio', 'Lee Sin Dragão da Tormenta', 'FPX Lee Sin', 'Lee Sin Zênite']
  },
  {
    id: 89,
    key: 'Leona',
    name: 'Leona',
    title: 'a Alvorada Radiante',
    roles: ['SUPPORT'],
    difficulty: 1,
    skins: ['Leona Valquíria', 'Leona Paladina', 'Leona Solari de Ferro', 'Leona Curtindo o Verão', 'PROJETO: Leona', 'Leona Churrasqueira', 'Leona Eclipse Solar', 'Leona Eclipse Lunar', 'Leona Reinos Mech', 'Leona Academia de Batalha', 'Leona Academia de Batalha de Prestígio', 'Leona Galante']
  },
  {
    id: 876,
    key: 'Lillia',
    name: 'Lillia',
    title: 'o Florir Tímido',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Lillia Florescer Espiritual', 'Lillia Emissária da Escuridão', 'Lillia Pergaminhos de Shan Hai']
  },
  {
    id: 127,
    key: 'Lissandra',
    name: 'Lissandra',
    title: 'a Bruxa Gélida',
    roles: ['MID'],
    difficulty: 2,
    skins: ['Lissandra Hematita', 'Lissandra Donzela de Ferro', 'Lissandra Cibernética', 'Lissandra Congregação das Bruxas', 'Lissandra Cósmica', 'Lissandra Porcelana', 'Lissandra Porcelana de Prestígio', 'Lissandra Embalos no Espaço']
  },
  {
    id: 236,
    key: 'Lucian',
    name: 'Lucian',
    title: 'o Purificador',
    roles: ['ADC', 'MID'],
    difficulty: 2,
    skins: ['Lucian Mercenário', 'Lucian Atacante', 'PROJETO: Lucian', 'Lucian Coração de Valentim', 'Lucian Velho Oeste', 'Lucian Demacia Vice', 'Lucian Pulsefire', 'Lucian Vitorioso', 'Lucian Arcano', 'Lucian Arcana']
  },
  {
    id: 117,
    key: 'Lulu',
    name: 'Lulu',
    title: 'a Fada Feiticeira',
    roles: ['SUPPORT', 'MID'],
    difficulty: 1,
    skins: ['Lulu Doceira', 'Lulu Perversa', 'Lulu Treinadora de Dragões', 'Lulu Inverno Mágico', 'Lulu Curtindo o Verão', 'Lulu Guardiã Estelar', 'Lulu Pijaminha Estelar', 'Lulu Cósmica', 'Lulu Embalos no Espaço', 'Lulu Embalos no Espaço de Prestígio', 'Lulu Monstro Domador']
  },
  {
    id: 99,
    key: 'Lux',
    name: 'Lux',
    title: 'a Dama da Luz',
    roles: ['SUPPORT', 'MID'],
    difficulty: 1,
    skins: ['Lux Feiticeira', 'Lux Ladra de Almas', 'Lux Comandante', 'Lux Imperial', 'Lux Legionária de Aço', 'Lux Guardiã Estelar', 'Elementalista Lux', 'Lux Pijaminha Estelar', 'Lux Academia de Batalha', 'Lux Academia de Batalha de Prestígio', 'Lux Cósmica', 'Lux Cosmos Negro', 'Lux Embalos no Espaço', 'Lux Porcelana', 'Lux Porcelana de Prestígio', 'Lux Soul Fighter']
  },
  {
    id: 54,
    key: 'Malphite',
    name: 'Malphite',
    title: 'o Fragmento do Monolito',
    roles: ['TOP', 'SUPPORT', 'MID'],
    difficulty: 1,
    skins: ['Malphite Trevo da Sorte', 'Malphite de Coral', 'Malphite de Mármore', 'Malphite Obsidiana', 'Malphite Glacial', 'Mecha Malphite', 'Malphite Barco a Vapor', 'Malphite Odisseia', 'FPX Malphite', 'Malphite Estrela Negra', 'Malphite Estrela Negra de Prestígio', 'Malphite Velho Oeste']
  },
  {
    id: 90,
    key: 'Malzahar',
    name: 'Malzahar',
    title: 'o Profeta do Vazio',
    roles: ['MID'],
    difficulty: 1,
    skins: ['Malzahar Vizir', 'Malzahar Príncipe das Sombras', 'Malzahar Gênio da Lâmpada', 'Malzahar Soberano', 'Malzahar Dia Nevado', 'Malzahar Chefão', 'Malzahar Hextec', 'Malzahar Quebrador de Mundos', 'Malzahar Abelha', 'Malzahar Três Honras']
  },
  {
    id: 57,
    key: 'Maokai',
    name: 'Maokai',
    title: 'o Ente Retorcido',
    roles: ['SUPPORT', 'TOP', 'JUNGLE'],
    difficulty: 1,
    skins: ['Maokai de Carvão', 'Maokai Totêmico', 'Maokai Festivo', 'Maokai Assombrado', 'Maokai Goleiro', 'Miau-kai', 'Maokai Vitorioso', 'Maokai Quebrador de Mundos', 'Maokai Astronauta']
  },
  {
    id: 11,
    key: 'MasterYi',
    name: 'Master Yi',
    title: 'o Espadachim Wuju',
    roles: ['JUNGLE'],
    difficulty: 1,
    skins: ['Master Yi Assassino', 'Master Yi o Escolhido', 'Master Yi de Ionia', 'Master Yi Guerreiro Samurai', 'Master Yi Caçador de Cabeças', 'PROJETO: Yi', 'Master Yi Espada Cósmica', 'Master Yi Boneco de Neve', 'Master Yi PsyOps', 'Master Yi Rosa de Cristal', 'Master Yi Tinta Sombria', 'Master Yi Tinta Sombria de Prestígio']
  },
  {
    id: 902,
    key: 'Milio',
    name: 'Milio',
    title: 'a Chama Gentil',
    roles: ['SUPPORT'],
    difficulty: 1,
    skins: ['Milio Corte das Fadas', 'Milio Sapo Cururu']
  },
  {
    id: 21,
    key: 'MissFortune',
    name: 'Miss Fortune',
    title: 'a Caçadora de Recompensas',
    roles: ['ADC'],
    difficulty: 1,
    skins: ['Miss Fortune Vaqueira', 'Miss Fortune de Waterloo', 'Miss Fortune Agente Secreta', 'Miss Fortune Natalina', 'Miss Fortune Guerreira das Estradas', 'Miss Fortune Mafiosa', 'Miss Fortune Fliperama', 'Miss Fortune Capitã', 'Miss Fortune Curtindo o Verão', 'Miss Fortune Guardiã Estelar', 'Vingadora Exocósmica Miss Fortune', 'Miss Fortune Pijaminha Estelar', 'Miss Fortune Feiticeira', 'Miss Fortune Feiticeira de Prestígio', 'Miss Fortune Ruína', 'Miss Fortune Conejo Lunar', 'Miss Fortune Porcelana']
  },
  {
    id: 62,
    key: 'MonkeyKing',
    name: 'Wukong',
    title: 'o Macaco Rei',
    roles: ['TOP', 'JUNGLE'],
    difficulty: 2,
    skins: ['Wukong Vulcânico', 'General Wukong', 'Wukong Dragão de Jade', 'Wukong do Submundo', 'Wukong Radiante', 'Wukong Lancer Stratus', 'Wukong Cavaleiro das Trevas']
  },
  {
    id: 82,
    key: 'Mordekaiser',
    name: 'Mordekaiser',
    title: 'o Renascido de Ferro',
    roles: ['TOP', 'JUNGLE', 'MID'],
    difficulty: 2,
    skins: ['Mordekaiser Dracônico', 'Mordekaiser Infernal', 'Mordekaiser Pentakill', 'Lord Mordekaiser', 'Mordekaiser Rei de Paus', 'Mordekaiser Estrela Negra', 'PROJETO: Mordekaiser', 'Mordekaiser Pentakill III', 'Mordekaiser Velho Oeste']
  },
  {
    id: 25,
    key: 'Morgana',
    name: 'Morgana',
    title: 'a Desolada',
    roles: ['SUPPORT', 'MID', 'JUNGLE'],
    difficulty: 1,
    skins: ['Morgana Exilada', 'Morgana Pesadelo Culinário', 'Morgana Espinhos Negros', 'Morgana Noiva Fantasma', 'Morgana Vitoriosa', 'Morgana Espectral', 'Morgana Feiticeira', 'Morgana Imperatriz Majestosa', 'Morgana Congregação das Bruxas', 'Morgana Emissária da Luz', 'Morgana Feiticeira de Prestígio', 'Morgana Guardiã Estelar Nemesis', 'Morgana Porcelana']
  },
  {
    id: 950,
    key: 'Naafiri',
    name: 'Naafiri',
    title: 'a Matilha das Mil Mordidas',
    roles: ['MID', 'TOP'],
    difficulty: 2,
    skins: ['Naafiri Soul Fighter', 'PROJETO: Naafiri']
  },
  {
    id: 267,
    key: 'Nami',
    name: 'Nami',
    title: 'a Conjuradora das Marés',
    roles: ['SUPPORT'],
    difficulty: 2,
    skins: ['Nami Koi', 'Nami Iara', 'Nami Peixe-Boi', 'Nami Cibernética', 'SKT T1 Nami', 'Nami Cajado Esplêndido', 'Nami Cósmica', 'Nami Feiticeira', 'Nami Embalos no Espaço', 'Nami Embalos no Espaço de Prestígio', 'Nami Corte das Fadas']
  },
  {
    id: 75,
    key: 'Nasus',
    name: 'Nasus',
    title: 'o Curador das Areias',
    roles: ['TOP', 'MID'],
    difficulty: 1,
    skins: ['Nasus Galáctico', 'Nasus Faraônico', 'Nasus Cavaleiro do Terror', 'Riot Nasus', 'Nasus Infernal', 'Archduke Nasus', 'Quebrador de Mundos Nasus', 'Nasus Guardião Lunar', 'Nasus Máquina de Combate', 'Nasus Embalos no Espaço', 'Nasus Titã Blindado']
  },
  {
    id: 111,
    key: 'Nautilus',
    name: 'Nautilus',
    title: 'o Titã das Profundezas',
    roles: ['SUPPORT', 'TOP', 'JUNGLE'],
    difficulty: 1,
    skins: ['Nautilus Abissal', 'Nautilus Subterrâneo', 'Astronautilus', 'Nautilus Vigia', 'Quebrador de Mundos Nautilus', 'Nautilus Conquistador', 'Nautilus Pergaminhos de Shan Hai', 'FPX Nautilus', 'Nautilus Fright Night']
  },
  {
    id: 518,
    key: 'Neeko',
    name: 'Neeko',
    title: 'a Camaleoa Curiosa',
    roles: ['MID', 'SUPPORT', 'TOP'],
    difficulty: 2,
    skins: ['Neeko Maravilha do Inverno', 'Neeko Guardiã Estelar', 'Neeko Guardiã Estelar de Prestígio', 'Neeko Pergaminhos de Shan Hai', 'Neeko Demônio da Rua']
  },
  {
    id: 76,
    key: 'Nidalee',
    name: 'Nidalee',
    title: 'a Caçadora Bestial',
    roles: ['JUNGLE'],
    difficulty: 3,
    skins: ['Nidalee das Neves', 'Nidalee Leopardo', 'Nidalee Camareira Francesa', 'Nidalee Faraônica', 'Nidalee Feiticeira', 'Nidalee Caçadora de Cabeças', 'Nidalee Reinos Combatentes', 'Nidalee Desafiante', 'Supergaláctica Nidalee', 'Nidalee Emissária da Luz', 'Nidalee Rosa Cósmica', 'DWG Nidalee', 'Nidalee Demônio da Rua']
  },
  {
    id: 895,
    key: 'Nilah',
    name: 'Nilah',
    title: 'a Alegria Irrestrita',
    roles: ['ADC'],
    difficulty: 2,
    skins: ['Nilah Guardiã Estelar', 'Nilah Congregação das Bruxas']
  },
  {
    id: 56,
    key: 'Nocturne',
    name: 'Nocturne',
    title: 'o Eterno Pesadelo',
    roles: ['JUNGLE', 'MID'],
    difficulty: 1,
    skins: ['Nocturne Terror Congelante', 'Nocturne do Vazio', 'Nocturne Devastador', 'Nocturne Assombração', 'Nocturne Eternum', 'Nocturne Espectro', 'Nocturne Deuses Antigos', 'Nocturne Hextec', 'Nocturne Quebrador de Mundos']
  },
  {
    id: 20,
    key: 'Nunu',
    name: 'Nunu e Willump',
    title: 'o Garoto e seu Yeti',
    roles: ['JUNGLE', 'MID'],
    difficulty: 1,
    skins: ['Nunu e Willump Pé-Grande', 'Nunu e Willump Elfo Natalino', 'Nunu e Willump Bicho-Papão', 'Nunu e Willump Demolidor', 'Nunu e Willump TPA', 'Nunu e Willump Zumbi', 'Nunu e Willump Robótico', 'Nunu e Willump Embalos no Espaço', 'Nunu e Willump Abelha']
  },
  {
    id: 2,
    key: 'Olaf',
    name: 'Olaf',
    title: 'o Berserker',
    roles: ['TOP', 'JUNGLE'],
    difficulty: 1,
    skins: ['Olaf Esquecido', 'Olaf Glacial', 'Brolaf', 'Olaf Pentakill', 'Olaf Saqueador', 'Olaf Carniceiro', 'SKT T1 Olaf', 'Olaf Caçador de Dragões', 'Olaf Sentinela', 'Olaf Pentakill III']
  },
  {
    id: 61,
    key: 'Orianna',
    name: 'Orianna',
    title: 'a Donzela Mecânica',
    roles: ['MID'],
    difficulty: 2,
    skins: ['Orianna Gótica', 'Orianna Fantoche Macabro', 'Orianna Artesã das Lâminas', 'Orianna Inverno Mágico', 'Orianna Coração de Valentim', 'TPA Orianna', 'Orianna Estrela Negra', 'Orianna Vitoriosa', 'Orianna Curtindo o Verão', 'Orianna Abelha', 'Orianna Guardiã Estelar']
  },
  {
    id: 516,
    key: 'Ornn',
    name: 'Ornn',
    title: 'o Fogo sob a Montanha',
    roles: ['TOP', 'SUPPORT'],
    difficulty: 2,
    skins: ['Ornn Senhor do Trovão', 'Ornn Sabugueiro', 'Ornn Embalos no Espaço', 'Ornn Chopp']
  },
  {
    id: 80,
    key: 'Pantheon',
    name: 'Pantheon',
    title: 'a Lança Indestrutível',
    roles: ['SUPPORT', 'MID', 'TOP'],
    difficulty: 2,
    skins: ['Pantheon Mirmidão', 'Pantheon Implacável', 'Pantheon Perseu', 'Pantheon Metalúrgico', 'Pantheon Guerreiro das Sombras', 'Pantheon Caçador de Dragões', 'Pantheon Espadeiro', 'Pantheon Padeiro', 'Pantheon Pulso de Fogo', 'Pantheon Ascendente', 'Pantheon Ascendente de Prestígio', 'Pantheon Guerreiro das Cinzas']
  },
  {
    id: 78,
    key: 'Poppy',
    name: 'Poppy',
    title: 'a Guardiã do Martelo',
    roles: ['TOP', 'JUNGLE', 'SUPPORT'],
    difficulty: 2,
    skins: ['Poppy de Noxus', 'Poppy Ferreira', 'Poppy Boneca de Pano', 'Poppy Guerreira Real', 'Poppy Martelo Escarlate', 'Poppy Guardiã Estelar', 'Poppy Cervo da Neve', 'Poppy Hextec', 'Poppy Astronauta', 'Poppy Feiticeira']
  },
  {
    id: 555,
    key: 'Pyke',
    name: 'Pyke',
    title: 'o Estripador das Águas Sangrentas',
    roles: ['SUPPORT', 'MID'],
    difficulty: 2,
    skins: ['Pyke Espectro das Areias', 'Pyke Lua Sangrenta', 'PROJETO: Pyke', 'Pyke PsyOps', 'Pyke Sentinela', 'Pyke Guerreiro das Cinzas', 'Pyke Emperador', 'Pyke Alma Penada']
  },
  {
    id: 246,
    key: 'Qiyana',
    name: 'Qiyana',
    title: 'a Imperatriz dos Elementos',
    roles: ['MID', 'JUNGLE'],
    difficulty: 3,
    skins: ['Qiyana Chefe de Batalha', 'Qiyana True Damage', 'Qiyana True Damage de Prestígio', 'Qiyana Rainha de Batalha', 'Qiyana Chocante', 'Qiyana Lunar']
  },
  {
    id: 133,
    key: 'Quinn',
    name: 'Quinn',
    title: 'as Asas de Demacia',
    roles: ['TOP', 'ADC'],
    difficulty: 2,
    skins: ['Quinn Fênix', 'Quinn Exploradora Bretã', 'Quinn Corsária', 'Quinn Cupido Mortal', 'Quinn Guardiã Estelar', 'Quinn Vigia']
  },
  {
    id: 497,
    key: 'Rakan',
    name: 'Rakan',
    title: 'o Encantador',
    roles: ['SUPPORT'],
    difficulty: 2,
    skins: ['Rakan Aurora Cósmica', 'Rakan Queridinho', 'SSG Rakan', 'iG Rakan', 'Rakan Guardião Estelar', 'Rakan Sabugueiro', 'Rakan Arcana', 'Rakan Quebrador de Corações']
  },
  {
    id: 33,
    key: 'Rammus',
    name: 'Rammus',
    title: 'o Tatu Blindado',
    roles: ['JUNGLE'],
    difficulty: 1,
    skins: ['Rei Rammus', 'Rammus Cromo', 'Rammus de Lava', 'Rammus de Freljord', 'Rammus Ninja', 'Rammus Blindado', 'Rammus Zagueiro', 'Rammus Hextec', 'Rammus Astronauta', 'Rammus Durian']
  },
  {
    id: 421,
    key: 'RekSai',
    name: 'Rek\'Sai',
    title: 'a Escavadora do Vazio',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Rek\'Sai Eternum', 'Rek\'Sai Curtindo o Verão', 'Rek\'Sai Rosa Negra', 'Rek\'Sai Sabugueiro']
  },
  {
    id: 526,
    key: 'Rell',
    name: 'Rell',
    title: 'a Dama de Ferro',
    roles: ['SUPPORT', 'JUNGLE'],
    difficulty: 2,
    skins: ['Rell Rainha de Batalha', 'Rell Guardiã Estelar', 'Rell Velho Oeste']
  },
  {
    id: 888,
    key: 'Renata',
    name: 'Renata Glasc',
    title: 'a Baronesa da Química',
    roles: ['SUPPORT'],
    difficulty: 2,
    skins: ['Renata Glasc Almirante', 'Renata Glasc Fright Night', 'Renata Glasc Rainha de Batalha']
  },
  {
    id: 58,
    key: 'Renekton',
    name: 'Renekton',
    title: 'o Carniçal das Areias',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Renekton Galáctico', 'Renekton de Outback', 'Renekton Sanguinário', 'Renekton Guerra Rúnica', 'Renekton Terra Queimada', 'Renekton Curtindo o Verão', 'Renekton Pré-Histórico', 'Renekton SKT T1', 'Renekton Brinquedo Assassino', 'Renekton Hextec', 'PROJETO: Renekton', 'Renekton Mundial 2023']
  },
  {
    id: 107,
    key: 'Rengar',
    name: 'Rengar',
    title: 'o Orgulho da Matilha',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 3,
    skins: ['Rengar Caçador de Cabeças', 'Rengar Caçador Noturno', 'SSW Rengar', 'Mecha Rengar', 'Rengar Gatinho', 'Rengar Guardião das Areias', 'Rengar Sentinela', 'Rengar Demônio da Rua']
  },
  {
    id: 92,
    key: 'Riven',
    name: 'Riven',
    title: 'a Exilada',
    roles: ['TOP', 'MID'],
    difficulty: 3,
    skins: ['Riven Redimida', 'Riven Elite Carmesim', 'Riven Coelhinha de Noxus', 'Riven Campeonato', 'Riven Espada Dracônica', 'Riven Fliperama', 'Riven Emissária da Luz', 'Pulsefire Riven', 'Riven Espada Valorosa', 'Riven Espada Valorosa de Prestígio', 'Riven Sentinela', 'Riven Florescer Espiritual', 'Riven Coelhinha de Batalha Prime']
  },
  {
    id: 68,
    key: 'Rumble',
    name: 'Rumble',
    title: 'a Ameaça Mecânica',
    roles: ['TOP', 'MID', 'JUNGLE'],
    difficulty: 2,
    skins: ['Rumble Rato de Praia', 'Rumble de Selva', 'Supergaláctico Rumble', 'Rumble Barão das Terras Ermas', 'Rumble Embalos no Espaço']
  },
  {
    id: 13,
    key: 'Ryze',
    name: 'Ryze',
    title: 'o Mago Rúnico',
    roles: ['MID', 'TOP'],
    difficulty: 2,
    skins: ['Ryze Jovem', 'Ryze Tribal', 'Ryze Tio Sam', 'Ryze Triunfante', 'Professor Ryze', 'Ryze Zumbi', 'Ryze Cristal Negro', 'Ryze Pirata', 'Ryze Barba Branca', 'SKT T1 Ryze', 'Ryze Campeonato', 'Ryze Guardião das Areias', 'Ryze Arcana']
  },
  {
    id: 360,
    key: 'Samira',
    name: 'Samira',
    title: 'a Rosa do Deserto',
    roles: ['ADC'],
    difficulty: 3,
    skins: ['Samira PsyOps', 'Samira Embalos no Espaço', 'Samira Velho Oeste', 'Soul Fighter Samira']
  },
  {
    id: 113,
    key: 'Sejuani',
    name: 'Sejuani',
    title: 'a Fúria do Norte',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Sejuani Presas de Sabre', 'Sejuani Cavaleira das Trevas', 'Sejuani Tradicional', 'Sejuani Montada em Poro', 'Sejuani Caçadora de Feras', 'Sejuani Fogos Artificiais', 'Sejuani Hextec', 'PROJETO: Sejuani', 'Sejuani Vitoriosa']
  },
  {
    id: 235,
    key: 'Senna',
    name: 'Senna',
    title: 'a Redentora',
    roles: ['SUPPORT', 'ADC'],
    difficulty: 2,
    skins: ['Senna True Damage', 'Senna True Damage de Prestígio', 'Senna Velho Oeste', 'PROJETO: Senna', 'Senna Eclipse Lunar', 'Senna Eclipse Lunar de Prestígio', 'Senna Guardiã Estelar', 'Senna Heartsteel']
  },
  {
    id: 147,
    key: 'Seraphine',
    name: 'Seraphine',
    title: 'a Cantora Sonhadora',
    roles: ['SUPPORT', 'MID', 'ADC'],
    difficulty: 1,
    skins: ['K/DA ALL OUT Seraphine', 'Seraphine Fênix Graciosa', 'Seraphine Rosa de Cristal', 'Seraphine Curtindo o Verão', 'Seraphine Guardiã Estelar', 'Seraphine Corte das Fadas']
  },
  {
    id: 875,
    key: 'Sett',
    name: 'Sett',
    title: 'o Chefe',
    roles: ['TOP', 'MID', 'SUPPORT'],
    difficulty: 1,
    skins: ['Sett Reinos Mech', 'Sett Reinos Mech de Prestígio', 'Sett Dragão de Obsidiana', 'Sett Dragão de Obsidiana de Prestígio', 'Sett Curtindo o Verão', 'Sett Fogos Artificiais', 'Sett Florescer Espiritual', 'Sett Soul Fighter', 'Sett Heartsteel']
  },
  {
    id: 35,
    key: 'Shaco',
    name: 'Shaco',
    title: 'o Bufão Demoníaco',
    roles: ['JUNGLE', 'SUPPORT'],
    difficulty: 3,
    skins: ['Shaco Chapeleiro Maluco', 'Shaco Real', 'Shaco Nutcracker', 'Shaco de Brinquedo', 'Shaco do Asilo', 'Shaco Mascarado', 'Shaco Coringa', 'Shaco Estrela Negra', 'Shaco Arcanista', 'Shaco Cidade do Crime', 'Shaco Fright Night', 'Soul Fighter Shaco']
  },
  {
    id: 98,
    key: 'Shen',
    name: 'Shen',
    title: 'o Olho do Crepúsculo',
    roles: ['TOP', 'SUPPORT'],
    difficulty: 2,
    skins: ['Shen Cirurgião', 'Shen Lua Sangrenta', 'Shen Ninja de Gelo', 'Shen de Armadura Amarela', 'Shen Senhor da Guerra', 'TPA Shen', 'Pulsefire Shen', 'Shen Infernal', 'Shen PsyOps', 'Shen Chocante']
  },
  {
    id: 102,
    key: 'Shyvana',
    name: 'Shyvana',
    title: 'o Meio-Dragão',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 1,
    skins: ['Shyvana Garras de Ferro', 'Shyvana Chamas de Batalha', 'Shyvana Dragão de Gelo', 'Shyvana Campeonato', 'Supergaláctica Shyvana', 'Shyvana Ruína', 'Shyvana Imortal']
  },
  {
    id: 27,
    key: 'Singed',
    name: 'Singed',
    title: 'o Químico Louco',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Riot Singed', 'Singed Hextec', 'Singed Surfista', 'Singed Cientista Louco', 'Singed Dia Nevado', 'Singed SSW', 'Singed Apicultor', 'Singed da Resistência', 'Singed Astronauta']
  },
  {
    id: 14,
    key: 'Sion',
    name: 'Sion',
    title: 'o Colosso Morto-Vivo',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Sion Hextec', 'Sion Bárbaro', 'Sion Lenhador', 'Sion Guerreiro das Forças Especiais', 'Mecha Zero Sion', 'Sion Quebrador de Mundos', 'Sion Velho Oeste']
  },
  {
    id: 15,
    key: 'Sivir',
    name: 'Sivir',
    title: 'a Mestra da Batalha',
    roles: ['ADC'],
    difficulty: 1,
    skins: ['Sivir Princesa Guerreira', 'Sivir Maravilha', 'Sivir Caçadora', 'Sivir Gatuna', 'PAX Sivir', 'Sivir Tempestade de Neve', 'Sivir Vigia', 'Sivir Vitoriosa', 'Sivir Entregadora de Pizza', 'Sivir Lua Sangrenta', 'Sivir Odisseia', 'Sivir Solar', 'Sivir Criadora Mítica', 'Sivir Neo PAX']
  },
  {
    id: 72,
    key: 'Skarner',
    name: 'Skarner',
    title: 'a Soberania Primitiva',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Skarner Ferrão de Areia', 'Skarner Runa da Terra', 'Skarner Máquina de Combate', 'Skarner Guardião das Areias', 'Skarner Cósmico']
  },
  {
    id: 901,
    key: 'Smolder',
    name: 'Smolder',
    title: 'o Herdeiro Flamejante',
    roles: ['ADC', 'MID'],
    difficulty: 2,
    skins: ['Smolder Fera Escamada']
  },
  {
    id: 37,
    key: 'Sona',
    name: 'Sona',
    title: 'a Mestra das Cordas',
    roles: ['SUPPORT'],
    difficulty: 1,
    skins: ['Sona Musa', 'Sona Pentakill', 'Sona Noite Feliz', 'Sona Guqin', 'Sona Fliperama', 'DJ Sona', 'Sona Queridinha', 'Sona Odisseia', 'Sona PsyOps', 'Sona Pentakill III', 'Sona Guardiã Estelar']
  },
  {
    id: 16,
    key: 'Soraka',
    name: 'Soraka',
    title: 'a Filha das Estrelas',
    roles: ['SUPPORT', 'MID'],
    difficulty: 1,
    skins: ['Soraka Dríade', 'Soraka Divina', 'Soraka Celestina', 'Soraka Ceifadora', 'Soraka Ordem do Banana', 'Soraka Cibernética', 'Soraka Guardiã Estelar', 'Soraka Pijaminha Estelar', 'Soraka Emissária da Luz', 'Soraka Emissária da Escuridão', 'Soraka Guardiã Estelar de Prestígio', 'Soraka Café das Cariátides', 'Soraka Florescer Espiritual']
  },
  {
    id: 50,
    key: 'Swain',
    name: 'Swain',
    title: 'o Grande General de Noxus',
    roles: ['SUPPORT', 'MID', 'TOP'],
    difficulty: 2,
    skins: ['Swain da Fronteira', 'Swain Tirano', 'Swain Mestre do Norte', 'Swain Mestre dos Dragões', 'Swain Hextec', 'Swain Rosa de Cristal', 'Swain Bênção do Inverno']
  },
  {
    id: 517,
    key: 'Sylas',
    name: 'Sylas',
    title: 'o Abnegado de Freljord',
    roles: ['MID', 'TOP', 'JUNGLE'],
    difficulty: 3,
    skins: ['Sylas Espectro Lunar', 'Sylas de Freljord', 'PROJETO: Sylas', 'PROJETO: Sylas de Prestígio', 'Sylas Fera Lunar', 'Sylas Guerreiro das Cinzas', 'Sylas Lobo de Batalha']
  },
  {
    id: 134,
    key: 'Syndra',
    name: 'Syndra',
    title: 'a Soberana Sombria',
    roles: ['MID', 'SUPPORT'],
    difficulty: 3,
    skins: ['Syndra Justiceira', 'Syndra Atlante', 'Syndra Dama de Ouros', 'Syndra Dia Nevado', 'SKT T1 Syndra', 'Syndra Guardiã Estelar', 'Syndra Curtindo o Verão', 'Syndra Rosa Definhada', 'Syndra Guardiã Estelar de Prestígio', 'Syndra Florescer Espiritual', 'Syndra Congregação das Bruxas']
  },
  {
    id: 223,
    key: 'TahmKench',
    name: 'Tahm Kench',
    title: 'o Rei do Rio',
    roles: ['SUPPORT', 'TOP'],
    difficulty: 2,
    skins: ['Mestre Cuca Tahm Kench', 'Tahm Kench Urf', 'Tahm Kench Moedas Imperiais', 'Tahm Kench Arcana', 'Tahm Kench Velho Oeste']
  },
  {
    id: 163,
    key: 'Taliyah',
    name: 'Taliyah',
    title: 'a Tecelã das Pedras',
    roles: ['MID', 'JUNGLE', 'SUPPORT'],
    difficulty: 3,
    skins: ['Taliyah de Freljord', 'SSG Taliyah', 'Taliyah Curtindo o Verão', 'Taliyah Guardiã Estelar', 'Taliyah Criadora de Cristais']
  },
  {
    id: 91,
    key: 'Talon',
    name: 'Talon',
    title: 'a Sombra da Lâmina',
    roles: ['MID', 'JUNGLE'],
    difficulty: 2,
    skins: ['Talon Renegado', 'Talon Elite Carmesim', 'Talon Dragonblade', 'SSW Talon', 'Talon Lua Sangrenta', 'Talon Espada Resplandecente', 'Talon Rosa Negra', 'Talon Velho Oeste', 'Talon Velho Oeste de Prestígio', 'Talon Primordiano']
  },
  {
    id: 44,
    key: 'Taric',
    name: 'Taric',
    title: 'o Escudo de Valoran',
    roles: ['SUPPORT', 'TOP'],
    difficulty: 1,
    skins: ['Taric Esmeralda', 'Taric Armadura da Quinta Era', 'Taric Hematita', 'Taric Curtindo o Verão', 'Taric Escudo Resplandecente', 'Taric Embalos no Espaço']
  },
  {
    id: 17,
    key: 'Teemo',
    name: 'Teemo',
    title: 'o Explorador Veloz',
    roles: ['TOP', 'MID', 'SUPPORT'],
    difficulty: 1,
    skins: ['Teemo Elfo Feliz', 'Teemo Batedor', 'Teemo Texugo', 'Astronauta Teemo', 'Teemo Panda', 'Super Teemo', 'Teemo Esquadrão Ômega', 'Teemo Pequeno Diabrete', 'Teemo Abelhinha', 'Teemo Florescer Espiritual', 'Teemo Florescer Espiritual de Prestígio', 'Teemo Fright Night']
  },
  {
    id: 412,
    key: 'Thresh',
    name: 'Thresh',
    title: 'o Guardião das Correntes',
    roles: ['SUPPORT'],
    difficulty: 2,
    skins: ['Thresh Terror Profundo', 'Thresh Campeonato', 'Thresh Lua Sangrenta', 'SSW Thresh', 'Thresh Estrela Negra', 'Thresh Velho Oeste', 'Thresh Pulsefire', 'Thresh Pulsefire de Prestígio', 'Thresh Florescer Espiritual', 'Thresh Liberto', 'Thresh Dragão de Aço', 'Thresh Bênção do Inverno']
  },
  {
    id: 18,
    key: 'Tristana',
    name: 'Tristana',
    title: 'a Artilheira Yordle',
    roles: ['ADC', 'MID'],
    difficulty: 1,
    skins: ['Tristana Garota Riot', 'Tristana Elfa Natalina', 'Tristana Bombeira', 'Tristana Guerrilheira', 'Tristana Bucaneira', 'Tristana Treinadora de Dragões', 'Tristana Feiticeira', 'Tristana Esquadrão Ômega', 'Tristana Pequena Demoníaca', 'Tristana Pingu', 'Tristana Fogos Artificiais', 'Tristana Espírito das Fadas']
  },
  {
    id: 48,
    key: 'Trundle',
    name: 'Trundle',
    title: 'o Rei dos Trolls',
    roles: ['TOP', 'JUNGLE'],
    difficulty: 1,
    skins: ['Trundle Rebatedor', 'Trundle Ferro-Velho', 'Trundle Tradicional', 'Trundle Guarda Real', 'Quebrador de Mundos Trundle', 'Trundle Dragão Caçador', 'Trundle Fright Night']
  },
  {
    id: 23,
    key: 'Tryndamere',
    name: 'Tryndamere',
    title: 'o Rei Bárbaro',
    roles: ['TOP', 'MID'],
    difficulty: 1,
    skins: ['Tryndamere das Terras Altas', 'Tryndamere Rei', 'Tryndamere Viking', 'Tryndamere Lâmina Demoníaca', 'Tryndamere Sultão', 'Tryndamere Reinos Combatentes', 'Tryndamere Pesadelo', 'Tryndamere Quimtech', 'Tryndamere Lua Sangrenta', 'Tryndamere Emissário da Escuridão', 'Tryndamere Vitorioso']
  },
  {
    id: 4,
    key: 'TwistedFate',
    name: 'Twisted Fate',
    title: 'o Mestre das Cartas',
    roles: ['MID', 'ADC'],
    difficulty: 2,
    skins: ['PAX Twisted Fate', 'Twisted Fate Valete de Copas', 'Twisted Fate o Magnífico', 'Twisted Fate Dançarino de Tango', 'Twisted Fate Velho Oeste', 'Twisted Fate Mosqueteiro', 'Twisted Fate Submundo', 'Twisted Fate Árbitro', 'Twisted Fate Curtindo o Verão', 'Twisted Fate Odisseia', 'Twisted Fate Cidade do Crime', 'Twisted Fate Galante', 'Twisted Fate Espada do Destino']
  },
  {
    id: 29,
    key: 'Twitch',
    name: 'Twitch',
    title: 'o Semeador da Peste',
    roles: ['ADC', 'SUPPORT'],
    difficulty: 2,
    skins: ['Twitch Chefe da Máfia', 'Twitch da Vila Nevada', 'Twitch Medieval', 'Twitch Gangster', 'Twitch Vândalo', 'Twitch Trombadinha', 'SSW Twitch', 'Twitch Esquadrão Ômega', 'Twitch Rei do Gelo', 'Twitch Sombras Silenciosas', 'Twitch Dragão da Caverna', 'Twitch Velho Oeste']
  },
  {
    id: 77,
    key: 'Udyr',
    name: 'Udyr',
    title: 'o Andarilho Espiritual',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 2,
    skins: ['Udyr Faixa Preta', 'Udyr Xamã', 'Udyr Guardião Espiritual', 'Certamente não é o Udyr', 'Udyr Oráculo Dragão', 'Udyr Tinta Sombria']
  },
  {
    id: 6,
    key: 'Urgot',
    name: 'Urgot',
    title: 'o Encouraçado',
    roles: ['TOP', 'MID'],
    difficulty: 2,
    skins: ['Urgot Inimigo Gigante', 'Urgot Açougueiro', 'Urgot Máquina de Combate', 'Urgot Velho Oeste', 'Urgot Pijaminha Estelar', 'Urgot Fright Night']
  },
  {
    id: 110,
    key: 'Varus',
    name: 'Varus',
    title: 'a Flecha da Vingança',
    roles: ['ADC', 'MID'],
    difficulty: 2,
    skins: ['Varus Cristal Maldito', 'Varus Luz Celeste', 'Varus Operação no Ártico', 'Varus Cupido Mortal', 'Varus Dardos Velozes', 'Varus Estrela Negra', 'Varus Conquistador', 'Varus Infernal', 'PROJETO: Varus', 'Varus Velho Oeste', 'Varus Empíreo']
  },
  {
    id: 67,
    key: 'Vayne',
    name: 'Vayne',
    title: 'a Caçadora Noturna',
    roles: ['ADC', 'TOP'],
    difficulty: 2,
    skins: ['Vayne Defensora', 'Vayne Aristocrata', 'Vayne Caçadora de Dragões', 'Vayne Cupido Mortal', 'SKT T1 Vayne', 'Vayne Arco Celeste', 'Soulstealer Vayne', 'PROJETO: Vayne', 'Vayne Fogos Artificiais', 'Vayne Fogos Artificiais de Prestígio', 'Vayne Florescer Espiritual', 'Vayne Sentinela', 'Vayne Guardiã da Luz']
  },
  {
    id: 45,
    key: 'Veigar',
    name: 'Veigar',
    title: 'o Pequeno Mestre do Mal',
    roles: ['MID', 'SUPPORT', 'ADC'],
    difficulty: 1,
    skins: ['Veigar Mago Branco', 'Veigar Curling', 'Veigar Cinzento', 'Veigar Duende Irlandês', 'Veigar Barão Von', 'Veigar Vilão Alado', 'Veigar Noel Macabro', 'Veigar Chefão Final', 'Veigar Sabugueiro', 'Veigar Cosplay de Fúria', 'Veigar Astronauta', 'Veigar Monstro Domador']
  },
  {
    id: 161,
    key: 'Velkoz',
    name: 'Vel\'Koz',
    title: 'o Olho do Vazio',
    roles: ['SUPPORT', 'MID'],
    difficulty: 2,
    skins: ['Vel\'Koz Máquina de Combate', 'Vel\'Koz Arco Celeste', 'Certamente não é o Vel\'Koz', 'Vel\'Koz Infernal', 'Vel\'Koz Rosa Negra', 'Vel\'Koz Abelha']
  },
  {
    id: 711,
    key: 'Vex',
    name: 'Vex',
    title: 'a Melancólica',
    roles: ['MID'],
    difficulty: 2,
    skins: ['Vex Emissária da Luz', 'Vex Embalos no Espaço']
  },
  {
    id: 254,
    key: 'Vi',
    name: 'Vi',
    title: 'a Defensora de Piltover',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 1,
    skins: ['Vi Golpes de Neon', 'Vi Policial', 'Vi Galante', 'Vi Demônio da Rua', 'Vi Reinos Combatentes', 'PROJETO: Vi', 'Vi Destruidora de Corações', 'Vi PsyOps', 'Vi Arcane', 'Vi Primordiana']
  },
  {
    id: 234,
    key: 'Viego',
    name: 'Viego',
    title: 'o Rei Destruído',
    roles: ['JUNGLE', 'MID'],
    difficulty: 3,
    skins: ['Viego Fera Lunar', 'Viego Dissonância de Pentakill', 'EDG Viego', 'Viego Soul Fighter', 'Viego Rei de Paus']
  },
  {
    id: 112,
    key: 'Viktor',
    name: 'Viktor',
    title: 'o Arauto das Máquinas',
    roles: ['MID', 'TOP'],
    difficulty: 3,
    skins: ['Viktor Autômato', 'Viktor Protótipo', 'Viktor Criador', 'Viktor Juramento das Lâminas', 'Viktor PsyOps', 'Viktor Velho Oeste']
  },
  {
    id: 8,
    key: 'Vladimir',
    name: 'Vladimir',
    title: 'o Ceifador Carmesim',
    roles: ['MID', 'TOP'],
    difficulty: 2,
    skins: ['Conde Vladimir', 'Marquês Vladimir', 'Vladimir Nosferatu', 'Vladimir Vândalo', 'Lord Vladimir', 'Vladimir Ladrão de Almas', 'Vladimir Colegial', 'Vladimir Águas Sombrias', 'Vladimir Emissário da Escuridão', 'Vladimir Café das Cariátides', 'Vladimir Florescer Espiritual']
  },
  {
    id: 106,
    key: 'Volibear',
    name: 'Volibear',
    title: 'o Trovão Relampejante',
    roles: ['TOP', 'JUNGLE'],
    difficulty: 1,
    skins: ['Volibear Senhor do Trovão', 'Volibear Nevado', 'Volibear Armadura Rúnica', 'Capitão Volibear', 'Volibear El Rayo', 'O Urso dos Mil Flagelos', 'Volibear Dragão da Dualidade', 'Volibear Dragão da Dualidade de Prestígio', 'Volibear Tinta Sombria']
  },
  {
    id: 19,
    key: 'Warwick',
    name: 'Warwick',
    title: 'a Ira Desimpedida de Zaun',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 1,
    skins: ['Warwick Cinzento', 'Urffento', 'Warwick Selvagem', 'Warwick Lobo Mau', 'Warwick Caçador da Tundra', 'Warwick Hiena', 'Warwick Presas de Fogo', 'Warwick Saqueador', 'Warwick Guardião Lunar', 'PROJETO: Warwick', 'Warwick Deuses Antigos', 'Warwick Bênção do Inverno', 'Warwick Bênção do Inverno de Prestígio']
  },
  {
    id: 498,
    key: 'Xayah',
    name: 'Xayah',
    title: 'a Rebelde',
    roles: ['ADC'],
    difficulty: 2,
    skins: ['Xayah Crepúsculo Cósmico', 'Xayah Queridinha', 'SSG Xayah', 'Xayah Guardiã Estelar', 'Xayah Sabugueiro', 'Xayah Arcana', 'Xayah Quebradora de Corações', 'Xayah Quebradora de Corações de Prestígio']
  },
  {
    id: 101,
    key: 'Xerath',
    name: 'Xerath',
    title: 'o Mago Ascendente',
    roles: ['SUPPORT', 'MID'],
    difficulty: 2,
    skins: ['Xerath Rúnico', 'Xerath Terra Queimada', 'Xerath Blindado', 'Xerath Guardião das Areias', 'Xerath Estrela Negra', 'Xerath Arcana', 'Xerath Astronauta']
  },
  {
    id: 5,
    key: 'XinZhao',
    name: 'Xin Zhao',
    title: 'o Senescal de Demacia',
    roles: ['JUNGLE', 'TOP'],
    difficulty: 1,
    skins: ['Xin Zhao Comandante', 'Xin Zhao Imperial', 'Xin Zhao Viscero', 'Xin Zhao Hussardo Alado', 'Xin Zhao Reinos Combatentes', 'Xin Zhao Agente Secreto', 'Xin Zhao Caçador de Dragões', 'Xin Zhao Cósmico', 'Xin Zhao Saqueador', 'Xin Zhao Fogos Artificiais']
  },
  {
    id: 157,
    key: 'Yasuo',
    name: 'Yasuo',
    title: 'o Imperdoável',
    roles: ['MID', 'TOP', 'ADC'],
    difficulty: 3,
    skins: ['Yasuo Procurado', 'PROJETO: Yasuo', 'Yasuo Emissário da Escuridão', 'Yasuo Odisseia', 'Yasuo Chefão', 'Yasuo True Damage', 'Yasuo True Damage de Prestígio', 'Yasuo Florescer Espiritual', 'Yasuo Dragão da Verdade', 'Yasuo Dragão dos Sonhos', 'Yasuo Lobo do Mar', 'Yasuo Tinta Sombria', 'Yasuo Profecia']
  },
  {
    id: 777,
    key: 'Yone',
    name: 'Yone',
    title: 'o Inesquecido',
    roles: ['MID', 'TOP'],
    difficulty: 3,
    skins: ['Yone Florescer Espiritual', 'Yone Academia de Batalha', 'Yone Emissário da Luz', 'Yone Canção do Oceano', 'Yone Tinta Sombria', 'Yone Florescer Espiritual de Prestígio', 'Yone Heartsteel', 'Yone Heartsteel de Prestígio']
  },
  {
    id: 83,
    key: 'Yorick',
    name: 'Yorick',
    title: 'o Pastor de Almas',
    roles: ['TOP'],
    difficulty: 2,
    skins: ['Yorick Necróforo', 'Yorick Pentakill', 'Yorick Arco Celeste', 'Miau-rick', 'Yorick da Resistência', 'Yorick Pentakill III', 'Yorick Florescer Espiritual']
  },
  {
    id: 350,
    key: 'Yuumi',
    name: 'Yuumi',
    title: 'a Gata Mágica',
    roles: ['SUPPORT'],
    difficulty: 1,
    skins: ['Diretora de Batalha Yuumi', 'Yuumi Queridinha', 'Yuumi Feiticeira', 'EDG Yuumi', 'Yuumi Cãozinho', 'Yuumi Cyberpop']
  },
  {
    id: 154,
    key: 'Zac',
    name: 'Zac',
    title: 'a Arma Secreta',
    roles: ['JUNGLE', 'TOP', 'SUPPORT'],
    difficulty: 2,
    skins: ['Arma Especial Zac', 'Zac Curtindo o Verão', 'SKT T1 Zac', 'Zac Máquina de Combate', 'Zac Empíreo']
  },
  {
    id: 238,
    key: 'Zed',
    name: 'Zed',
    title: 'o Mestre das Sombras',
    roles: ['MID', 'JUNGLE'],
    difficulty: 3,
    skins: ['Zed Lâmina do Trovão', 'SKT T1 Zed', 'PROJETO: Zed', 'Zed Campeonato', 'Zed Dizimador de Galáxias', 'Zed PsyOps', 'PROJETO: Zed de Prestígio', 'Zed Galante', 'Zed Empíreo', 'Zed Imortal']
  },
  {
    id: 221,
    key: 'Zeri',
    name: 'Zeri',
    title: 'a Faísca de Zaun',
    roles: ['ADC'],
    difficulty: 2,
    skins: ['Zeri Rosa Definhada', 'Zeri Canção do Oceano', 'Zeri Imortal']
  },
  {
    id: 115,
    key: 'Ziggs',
    name: 'Ziggs',
    title: 'o Especialista em Hexplosivos',
    roles: ['MID', 'ADC'],
    difficulty: 2,
    skins: ['Ziggs Cientista Louco', 'Major Ziggs', 'Ziggs Curtindo o Verão', 'Ziggs Dia Nevado', 'Ziggs Mestre Arcanista', 'Ziggs Chefão', 'Ziggs Odisseia', 'Ziggs Feiticeiro', 'Ziggs BZZZ']
  },
  {
    id: 26,
    key: 'Zilean',
    name: 'Zilean',
    title: 'o Guardião do Tempo',
    roles: ['SUPPORT', 'MID'],
    difficulty: 2,
    skins: ['Zilean Velho Noel', 'Zilean Macabro', 'Zilean Hippie', 'Zilean Guerreiro do Deserto', 'Zilean Máquina do Tempo', 'Zilean Lua de Sangue', 'Zilean Açucareiro', 'Zilean Bênção do Inverno']
  },
  {
    id: 142,
    key: 'Zoe',
    name: 'Zoe',
    title: 'o Aspecto do Crepúsculo',
    roles: ['MID', 'SUPPORT'],
    difficulty: 3,
    skins: ['Zoe Cyberpop', 'Zoe Curtindo o Verão', 'Zoe Guardiã Estelar', 'Zoe Arcanista', 'Zoe Arcanista de Prestígio', 'EDG Zoe']
  },
  {
    id: 143,
    key: 'Zyra',
    name: 'Zyra',
    title: 'a Ascensão dos Espinhos',
    roles: ['SUPPORT', 'MID', 'JUNGLE'],
    difficulty: 2,
    skins: ['Zyra Fogo Selvagem', 'Zyra Assombrada', 'SKT T1 Zyra', 'Zyra Dracomante', 'Zyra Congregação das Bruxas', 'Zyra Congregação das Bruxas de Prestígio', 'Zyra Rosa de Cristal', 'Zyra Dançarina dos Espinhos']
  }
];
