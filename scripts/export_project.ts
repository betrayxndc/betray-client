import fs from 'fs';
import path from 'path';
import { generatePythonDesktopApp } from '../src/services/pythonProjectFiles';
import { CHAMPIONS } from '../src/data/champions';
import { AppSettings } from '../src/types';

const defaultSettings: AppSettings = {
  autoAccept: true,
  autoAcceptDelay: 1,
  autoAcceptSound: true,
  autoPickEnabled: true,
  prePickChampions: {
    TOP: [],
    JUNGLE: [],
    MID: [],
    ADC: [],
    SUPPORT: []
  },
  autoLockPick: true,
  autoBanEnabled: true,
  preBanChampions: [],
  selectedBackgroundSkinId: 91008,
  selectedBackgroundSkinName: 'Talon Rosa Negra',
  selectedBackgroundChampName: 'Talon',
  selectedBackgroundSplashUrl: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Talon_8.jpg',
  roseSkinChangerEnabled: true,
  roseAutoDetectChampSelect: true,
  roseSelectedSkins: {},
  roseCurrentChampionKey: 'Zed',
  roseCurrentSkinId: 238000,
  roseCurrentSkinName: 'Zed Clássico',
  roseCurrentChromaId: null,
  lobbyRevealAutoFetch: true,
  lobbyRevealAutoDodgeLossStreak: true,
  lobbyRevealLossStreakThreshold: 3,
  lobbyRevealAutoDodgeWinrate: false,
  lobbyRevealWinrateThreshold: 42,
  dodgeMethod: 'auto',
  lastSecondDodgeEnabled: true,
  lastSecondDodgeSeconds: 3,
  dodgeFallbackTimeoutMs: 1500,
  riotApiKey: '',
  riotRegion: 'BR1',
  lcuPort: '',
  lcuToken: '',
  lcuProtocol: 'https',
  lcuConnected: false,
  soundVolume: 75
};

console.log('Generating files for standalone Python Betray Client...');
const files = generatePythonDesktopApp(defaultSettings);

const rootDir = process.cwd();

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(rootDir, filePath);
  const dirName = path.dirname(fullPath);
  
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`[OK] Created ${filePath}`);
}

console.log('All files successfully exported to workspace root!');
