import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

// Порт для подключения к xi.web dev server
// Можно переопределить через переменную окружения WEB_APP_PORT
const WEB_APP_PORT = process.env.WEB_APP_PORT ? parseInt(process.env.WEB_APP_PORT, 10) : 5173;

// Путь к собранному веб-приложению (xi.web)
// В dev режиме: относительно исходников
// В production: относительно ресурсов приложения (extraResources)
const getWebAppPath = () => {
  if (isDev) {
    return path.join(__dirname, '../../xi.web/build');
  }
  // В production веб-приложение будет в resources/xi.web/build
  // process.resourcesPath указывает на папку resources в собранном приложении
  return path.join(process.resourcesPath || app.getAppPath(), 'xi.web/build');
};

function createWindow() {
  // Путь к preload скрипту (всегда скомпилированный JS файл)
  const preloadPath = path.join(__dirname, 'preload.js');

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: preloadPath,
      // Включаем поддержку WebSocket для HMR
      webviewTag: false,
    },
  });

  if (isDev) {
    // В dev режиме подключаемся к Vite dev server от xi.web
    // HMR будет работать автоматически через WebSocket
    const devServerUrl = `http://localhost:${WEB_APP_PORT}`;
    console.log(`Loading web app from dev server: ${devServerUrl}`);
    win.loadURL(devServerUrl);

    // Открываем DevTools для отладки
    win.webContents.openDevTools();

    // Перезагружаем окно при изменении (дополнительно к HMR)
    win.webContents.on('did-fail-load', () => {
      // Если dev server еще не запущен, ждем и перезагружаем
      setTimeout(() => {
        win.reload();
      }, 1000);
    });
  } else {
    // В production загружаем собранное веб-приложение
    const webAppPath = getWebAppPath();
    const indexPath = path.join(webAppPath, 'index.html');
    console.log(`Loading web app from: ${indexPath}`);
    win.loadFile(indexPath);
  }
}

// Регистрация IPC обработчиков
function setupIpcHandlers() {
  // Получение версии приложения
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  // Управление окном
  ipcMain.handle('window:minimize', (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle('window:maximize', (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });
}

app.whenReady().then(() => {
  console.log('Electron app is ready');
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
