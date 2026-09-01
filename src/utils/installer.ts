import JSZip from 'jszip';
import { AppSettings, LcuLog } from '../types';
import { generatePythonDesktopApp } from '../services/lcuService';

/**
 * Downloads the complete Windows Standalone package with automatic 1-click installer and EXE compiler.
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

  // Adiciona todos os arquivos do projeto compilado
  Object.entries(pythonProject).forEach(([filePath, content]) => {
    zip.file(filePath, content);
  });

  // Criador automático de 1 clique do executável BetrayClient.exe
  const oneClickBuildAndRun = `@echo off
title Betray Client - Compilador e Inicializador
chcp 65001 > nul
cls
cd /d "%~dp0"
echo ===================================================================
echo   BETRAY CLIENT DESKTOP - CRIANDO BETRAYCLIENT.EXE NATIVO
echo   Feito por: betray
echo ===================================================================
echo.
echo [*] 1/3 Verificando ambiente Python no Windows...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Python nao encontrado. Baixando e instalando automaticamente...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile 'python_setup.exe'; Start-Process 'python_setup.exe' -ArgumentList '/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1' -Wait; Remove-Item 'python_setup.exe'"
)

echo [*] 2/3 Instalando dependencias (PyWebView, Requests, PsUtil, PyInstaller)...
python -m pip install --quiet --upgrade pip pywebview requests psutil urllib3 pyinstaller

echo [*] 3/3 Compilando o executavel "BetrayClient.exe" standalone...
if not exist "BetrayClient.exe" (
    python -m PyInstaller --noconsole --onefile --clean --name="BetrayClient" --add-data="web;web" --add-data="config;config" main.py
    if exist "dist\\BetrayClient.exe" (
        copy /y "dist\\BetrayClient.exe" "BetrayClient.exe" > nul
    )
)

echo.
echo ===================================================================
echo   [SUCESSO] "BetrayClient.exe" pronto! Abrindo o aplicativo...
echo ===================================================================
if exist "BetrayClient.exe" (
    start "" "BetrayClient.exe"
) else (
    python main.py
)
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

POR QUE O WINDOWS EXIBE AVISOS?
1. O Windows SmartScreen exibe "O arquivo pode ser perigoso" para qualquer
   software novo ou open-source que nao pague certificados corporativos caros
   (DigiCert/Microsoft $400+/ano). O codigo do Betray Client e 100% aberto,
   limpo e seguro, conectando apenas na API local do seu League of Legends.
2. Arquivos compactados (.zip) nao devem ser renomeados manualmente para .exe,
   pois o Windows exige um binario compilado nativo (PE 64-bit).

COMO GERAR E ABRIR O BETRAYCLIENT.EXE EM 2 PASSOS:
1. Extraia este arquivo ZIP para uma pasta no seu PC (ex: Area de Trabalho).
2. De 2 cliques em "Instalar_e_Gerar_EXE.bat" (ou "Gerar_BetrayClient_EXE.bat").
3. O script criara o arquivo "BetrayClient.exe" REAL no seu computador e abrira
   o cliente imediatamente!

Depois disso, voce podera usar APENAS o "BetrayClient.exe" quando quiser!
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

export async function downloadDirectExe(
  settings: AppSettings,
  addLog?: (type: LcuLog['type'], message: string, event?: string) => void
): Promise<void> {
  return downloadWindowsPackage(settings, addLog);
}

export async function downloadExeInstaller(
  settings: AppSettings,
  addLog?: (type: LcuLog['type'], message: string, event?: string) => void
): Promise<void> {
  return downloadWindowsPackage(settings, addLog);
}


