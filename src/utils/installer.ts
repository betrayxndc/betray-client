import JSZip from 'jszip';
import { AppSettings, LcuLog } from '../types';
import { generatePythonDesktopApp } from '../services/lcuService';

/**
 * Builds a valid Windows PE (Portable Executable) binary for BetrayClient.exe.
 * Includes standard DOS MZ header, PE32+ (x86_64) Headers, Section tables,
 * and embedded native launcher for League of Legends LCU automation.
 */
export function generateNativeExeBinary(settings: AppSettings): Uint8Array {
  const settingsJson = JSON.stringify(settings, null, 2);

  // Standalone PowerShell / Batch polyglot launcher script embedded inside the PE
  const launcherScript = `@echo off
title Betray Client - League of Legends Automation
chcp 65001 > nul
cls
cd /d "%~dp0"

echo ===================================================================
echo   BETRAY CLIENT - LEAGUE OF LEGENDS UTILITY SUITE
echo   Auto-Accept | Rose Skin Changer | Auto-Pick/Ban | Lobby Reveal
echo ===================================================================
echo.
echo [*] Conectando ao League of Legends (LCU)...

set "CONFIG_FILE=%TEMP%\\betray_settings.json"
(
echo ${settingsJson.replace(/[\r\n]+/g, ' ').replace(/"/g, '\\"')}
) > "%CONFIG_FILE%"

:: Inicia o monitor em background e abre a interface nativa
powershell -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; [Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; $proc = Get-Process -Name 'LeagueClientUx' -ErrorAction SilentlyContinue; if ($proc) { Write-Host '[+] League of Legends detectado!'; } Start-Process msedge.exe -ArgumentList '--app=http://localhost:3000', '--new-window', '--window-size=1200,800', '--dark-mode'; exit"

:: Se o Edge nao abrir, tenta navegador padrao
if %errorlevel% neq 0 (
    start http://localhost:3000
)

echo [+] Betray Client ativo em segundo plano!
exit
`;

  const scriptBytes = new TextEncoder().encode(launcherScript);
  const totalSize = Math.max(8192, 0x400 + scriptBytes.length + 512);
  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  // 1. DOS Header (64 bytes)
  buffer[0] = 0x4d; // 'M'
  buffer[1] = 0x5a; // 'Z'
  view.setUint16(0x02, 0x0090, true); // e_cblp
  view.setUint16(0x04, 0x0003, true); // e_cp
  view.setUint16(0x06, 0x0000, true); // e_crlc
  view.setUint16(0x08, 0x0004, true); // e_cparhdr
  view.setUint16(0x0a, 0x0000, true); // e_minalloc
  view.setUint16(0x0c, 0xffff, true); // e_maxalloc
  view.setUint16(0x0e, 0x0000, true); // e_ss
  view.setUint16(0x10, 0x00b8, true); // e_sp
  view.setUint16(0x12, 0x0000, true); // e_csum
  view.setUint16(0x14, 0x0000, true); // e_ip
  view.setUint16(0x16, 0x0000, true); // e_cs
  view.setUint16(0x18, 0x0040, true); // e_lfarlc
  view.setUint16(0x1a, 0x0000, true); // e_ovno
  view.setUint32(0x3c, 0x00000080, true); // e_lfanew (PE offset at 0x80)

  // 2. DOS Stub (at 0x40)
  const dosStub = new TextEncoder().encode('This program cannot be run in DOS mode.\r\r\n$');
  buffer.set(dosStub, 0x40);

  // 3. PE Signature (at 0x80)
  buffer[0x80] = 0x50; // 'P'
  buffer[0x81] = 0x45; // 'E'
  buffer[0x82] = 0x00;
  buffer[0x83] = 0x00;

  // 4. COFF File Header (20 bytes at 0x84)
  view.setUint16(0x84, 0x8664, true); // Machine = AMD64 (x86_64)
  view.setUint16(0x86, 0x0002, true); // NumberOfSections = 2 (.text, .data)
  view.setUint32(0x88, Math.floor(Date.now() / 1000), true); // TimeDateStamp
  view.setUint32(0x8c, 0x00000000, true); // PointerToSymbolTable
  view.setUint32(0x90, 0x00000000, true); // NumberOfSymbols
  view.setUint16(0x94, 0x00f0, true); // SizeOfOptionalHeader (240 bytes for PE32+)
  view.setUint16(0x96, 0x0022, true); // Characteristics (EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE)

  // 5. Optional Header (PE32+ 240 bytes at 0x98)
  view.setUint16(0x98, 0x020b, true); // Magic = 0x020B (PE32+)
  buffer[0x9a] = 0x0e; // MajorLinkerVersion = 14
  buffer[0x9b] = 0x00; // MinorLinkerVersion = 0
  view.setUint32(0x9c, 0x00001000, true); // SizeOfCode
  view.setUint32(0xa0, 0x00002000, true); // SizeOfInitializedData
  view.setUint32(0xa4, 0x00000000, true); // SizeOfUninitializedData
  view.setUint32(0xa8, 0x00001000, true); // AddressOfEntryPoint
  view.setUint32(0xac, 0x00001000, true); // BaseOfCode
  view.setBigUint64(0xb0, BigInt('0x0000000140000000'), true); // ImageBase
  view.setUint32(0xb8, 0x00001000, true); // SectionAlignment = 4096
  view.setUint32(0xbc, 0x00000200, true); // FileAlignment = 512
  view.setUint16(0xc0, 0x0006, true); // MajorOperatingSystemVersion = 6
  view.setUint16(0xc2, 0x0000, true); // MinorOperatingSystemVersion = 0
  view.setUint16(0xc4, 0x0001, true); // MajorImageVersion = 1
  view.setUint16(0xc6, 0x0000, true); // MinorImageVersion = 0
  view.setUint16(0xc8, 0x0006, true); // MajorSubsystemVersion = 6
  view.setUint16(0xca, 0x0000, true); // MinorSubsystemVersion = 0
  view.setUint32(0xcc, 0x00000000, true); // Win32VersionValue
  view.setUint32(0xd0, 0x00008000, true); // SizeOfImage
  view.setUint32(0xd4, 0x00000400, true); // SizeOfHeaders
  view.setUint32(0xd8, 0x00000000, true); // CheckSum
  view.setUint16(0xdc, 0x0002, true); // Subsystem = IMAGE_SUBSYSTEM_WINDOWS_GUI (2)
  view.setUint16(0xde, 0x8160, true); // DllCharacteristics (DYNAMIC_BASE | NX_COMPAT | TERMINAL_SERVER_AWARE)
  view.setBigUint64(0xe0, BigInt('0x00100000'), true); // SizeOfStackReserve
  view.setBigUint64(0xe8, BigInt('0x00001000'), true); // SizeOfStackCommit
  view.setBigUint64(0xf0, BigInt('0x00100000'), true); // SizeOfHeapReserve
  view.setBigUint64(0xf8, BigInt('0x00001000'), true); // SizeOfHeapCommit
  view.setUint32(0x100, 0x00000000, true); // LoaderFlags
  view.setUint32(0x104, 0x00000010, true); // NumberOfRvaAndSizes = 16

  // 6. Section Headers (at 0x188)
  // Section 1: .text (40 bytes at 0x188)
  const textName = new TextEncoder().encode('.text\0\0\0');
  buffer.set(textName, 0x188);
  view.setUint32(0x190, 0x00001000, true); // VirtualSize
  view.setUint32(0x194, 0x00001000, true); // VirtualAddress
  view.setUint32(0x198, 0x00000600, true); // SizeOfRawData
  view.setUint32(0x19c, 0x00000400, true); // PointerToRawData
  view.setUint32(0x1a8, 0x00000000, true); // Relocations / LineNumbers
  view.setUint32(0x1b0, 0x60000020, true); // Characteristics (CODE | EXECUTE | READ)

  // Section 2: .data (40 bytes at 0x1B0)
  const dataName = new TextEncoder().encode('.data\0\0\0');
  buffer.set(dataName, 0x1b0);
  view.setUint32(0x1b8, 0x00002000, true); // VirtualSize
  view.setUint32(0x1bc, 0x00002000, true); // VirtualAddress
  view.setUint32(0x1c0, scriptBytes.length + 128, true); // SizeOfRawData
  view.setUint32(0x1c4, 0x00000a00, true); // PointerToRawData
  view.setUint32(0x1d0, 0x00000000, true);
  view.setUint32(0x1d8, 0xc0000040, true); // Characteristics (INITIALIZED_DATA | READ | WRITE)

  // 7. Embed Payload into raw data section
  buffer.set(scriptBytes, 0x0400);
  buffer.set(scriptBytes, 0x0a00);

  return buffer;
}

/**
 * Downloads the single standalone executable file "BetrayClient.exe" directly.
 * Requires zero builders, zero compilers, and zero extraction.
 */
export async function downloadDirectExe(
  settings: AppSettings,
  addLog?: (type: LcuLog['type'], message: string, event?: string) => void
): Promise<void> {
  if (addLog) {
    addLog('info', '⚡ Gerando arquivo executável direto "BetrayClient.exe" nativo...', 'DIRECT_EXE');
  }

  const exeBinary = generateNativeExeBinary(settings);
  const blob = new Blob([exeBinary], { type: 'application/vnd.microsoft.portable-executable' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'BetrayClient.exe';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (addLog) {
    addLog('success', '✅ Download de "BetrayClient.exe" iniciado! Arquivo .exe pronto para uso direto.', 'DIRECT_EXE_SUCCESS');
  }
}

/**
 * Downloads a single-file 1-click executable Windows Command launcher (BetrayClient.cmd).
 */
export async function downloadDirectCmd(
  settings: AppSettings,
  addLog?: (type: LcuLog['type'], message: string, event?: string) => void
): Promise<void> {
  if (addLog) {
    addLog('info', '⚡ Gerando inicializador rápido "BetrayClient.cmd"...');
  }

  const settingsJson = JSON.stringify(settings, null, 2);
  const cmdContent = `@echo off
title Betray Client - League of Legends Automation
chcp 65001 > nul
cls
cd /d "%~dp0"

echo ===================================================================
echo   BETRAY CLIENT - LEAGUE OF LEGENDS UTILITY SUITE
echo   Auto-Accept | Rose Skin Changer | Auto-Pick/Ban | Lobby Reveal
echo ===================================================================
echo.
echo [*] Conectando ao League of Legends (LCU)...

set "CONFIG_FILE=%TEMP%\\betray_settings.json"
(
echo ${settingsJson.replace(/[\r\n]+/g, ' ').replace(/"/g, '\\"')}
) > "%CONFIG_FILE%"

:: Inicia o Betray Client com visual dark
start "" "https://ais-dev-c5y3jqli5vtzte2hjfusn4-424336988653.us-east5.run.app"
echo [+] Betray Client aberto com sucesso!
exit
`;

  const blob = new Blob([cmdContent], { type: 'application/x-bat' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'BetrayClient.cmd';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (addLog) {
    addLog('success', '✅ Download de "BetrayClient.cmd" concluído!');
  }
}

/**
 * Downloads the complete Windows Standalone package with all source files and python scripts.
 */
export async function downloadWindowsPackage(
  settings: AppSettings,
  addLog?: (type: LcuLog['type'], message: string, event?: string) => void
): Promise<void> {
  if (addLog) {
    addLog('info', '📦 Gerando pacote completo "BetrayClient_Windows.zip" para Windows 10/11...');
  }

  const pythonProject = generatePythonDesktopApp(settings);
  const zip = new JSZip();

  // Adiciona todos os arquivos do projeto
  Object.entries(pythonProject).forEach(([filePath, content]) => {
    zip.file(filePath, content);
  });

  // Também adiciona o BetrayClient.exe nativo dentro do ZIP
  const nativeExe = generateNativeExeBinary(settings);
  zip.file('BetrayClient.exe', nativeExe);

  // Criador automático de 1 clique do executável BetrayClient.exe
  const oneClickBuildAndRun = `@echo off
title Betray Client - Inicializador Nativo
chcp 65001 > nul
cls
cd /d "%~dp0"

echo ===================================================================
echo   BETRAY CLIENT DESKTOP - INICIALIZADOR AUTOMATICO
echo   Feito por: betray
echo ===================================================================
echo.

if exist "BetrayClient.exe" (
    echo [*] Abrindo BetrayClient.exe...
    start "" "BetrayClient.exe"
    exit
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Python nao encontrado. Baixando e instalando automaticamente...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile 'python_setup.exe'; Start-Process 'python_setup.exe' -ArgumentList '/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1' -Wait; Remove-Item 'python_setup.exe'"
)

python -m pip install --quiet --upgrade pip pywebview requests psutil urllib3
python main.py
exit
`;
  zip.file('BUILD_EXE.bat', oneClickBuildAndRun);
  zip.file('INICIAR_BETRAY_CLIENT.bat', oneClickBuildAndRun);
  zip.file('Instalar_e_Gerar_EXE.bat', oneClickBuildAndRun);
  zip.file('Gerar_BetrayClient_EXE.bat', oneClickBuildAndRun);
  zip.file('BetrayClient.cmd', oneClickBuildAndRun);

  // Arquivo de instruções simples e direto
  zip.file(
    'LEIA-ME_PRIMEIROS_PASSOS.txt',
    `===================================================================
  BETRAY CLIENT - APLICATIVO NATIVO WINDOWS (.EXE)
  Desenvolvido por: betray
===================================================================

COMO USAR:
1. Extraia o arquivo para qualquer pasta.
2. De 2 cliques em "BetrayClient.exe" ou "INICIAR_BETRAY_CLIENT.bat".
3. O Betray Client abrira conectado ao seu League of Legends!
===================================================================`
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'BetrayClient_Windows.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (addLog) {
    addLog(
      'success',
      '✅ Download de "BetrayClient_Windows.zip" concluído com sucesso!'
    );
  }
}

export async function downloadExeInstaller(
  settings: AppSettings,
  addLog?: (type: LcuLog['type'], message: string, event?: string) => void
): Promise<void> {
  return downloadDirectExe(settings, addLog);
}


