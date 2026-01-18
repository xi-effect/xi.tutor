// Типы для Electron API, доступного через preload скрипт
export interface ElectronAPI {
  getVersion: () => Promise<string>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
