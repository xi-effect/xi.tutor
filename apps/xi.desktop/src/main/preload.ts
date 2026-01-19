import { contextBridge, ipcRenderer } from 'electron';

// Безопасный API для взаимодействия между renderer и main процессами
contextBridge.exposeInMainWorld('electronAPI', {
  // Пример: получение версии приложения
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Пример: работа с окном
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),

  // Открытие/закрытие DevTools
  toggleDevTools: () => ipcRenderer.invoke('window:toggleDevTools'),

  // Получение платформы
  platform: process.platform,
});
