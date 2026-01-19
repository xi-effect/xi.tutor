// Типы для Electron API, доступного через preload скрипт
// Используется только в Electron версии приложения
export interface ElectronAPI {
  getVersion: () => Promise<string>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  toggleDevTools: () => Promise<void>;
  platform: NodeJS.Platform;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
