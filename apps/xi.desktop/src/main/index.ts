import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
  // process.resourcesPath указывает на папку Resources в собранном приложении
  // На macOS: /path/to/app.app/Contents/Resources
  const resourcesPath =
    process.resourcesPath ||
    (process.platform === 'darwin'
      ? path.join(app.getAppPath(), '..', 'Resources')
      : path.join(app.getAppPath(), 'resources'));

  return path.join(resourcesPath, 'xi.web/build');
};

function createWindow() {
  // Путь к preload скрипту
  // В dev: dist/main/preload.js
  // В production: распакован из asar в resources/app.asar.unpacked/dist/main/preload.js
  let preloadPath: string;
  if (isDev) {
    preloadPath = path.join(__dirname, 'preload.js');
  } else {
    // В production preload распакован из asar
    // app.getAppPath() возвращает путь к app.asar
    // Распакованные файлы находятся в app.asar.unpacked
    const appPath = app.getAppPath();
    if (appPath.endsWith('.asar')) {
      // Заменяем .asar на .asar.unpacked
      preloadPath = path.join(appPath.replace('.asar', '.asar.unpacked'), 'dist/main/preload.js');
    } else {
      // Если не в asar (например, при разработке), используем обычный путь
      preloadPath = path.join(__dirname, 'preload.js');
    }
  }

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
    console.log(`Web app path: ${webAppPath}`);
    console.log(`Resources path: ${process.resourcesPath}`);
    console.log(`App path: ${app.getAppPath()}`);

    // Проверяем существование файла
    if (!fs.existsSync(indexPath)) {
      console.error(`ERROR: index.html not found at: ${indexPath}`);
      console.error(`Trying alternative paths...`);

      // Пробуем альтернативные пути
      const altPaths = [
        path.join(app.getAppPath(), 'xi.web/build/index.html'),
        path.join(__dirname, '../xi.web/build/index.html'),
        path.join(process.resourcesPath || '', 'app/xi.web/build/index.html'),
      ];

      for (const altPath of altPaths) {
        console.log(`Checking: ${altPath}`);
        if (fs.existsSync(altPath)) {
          console.log(`Found at: ${altPath}`);
          win.loadFile(altPath);
          return;
        }
      }

      console.error('Could not find index.html in any location!');
      // Показываем ошибку пользователю
      win.webContents.once('did-finish-load', () => {
        win.webContents.executeJavaScript(`
          document.body.innerHTML = '<div style="padding: 20px; font-family: system-ui; text-align: center;">
            <h1>Ошибка загрузки</h1>
            <p>Не удалось найти файлы приложения.</p>
            <p style="color: #666; font-size: 12px;">Проверьте консоль для деталей.</p>
          </div>';
        `);
      });
      win.loadURL(
        'data:text/html,<html><body style="padding: 20px; font-family: system-ui;"><h1>Ошибка загрузки</h1><p>Не удалось найти файлы приложения.</p></body></html>',
      );
      return;
    }

    // Перехватываем навигацию для поддержки SPA роутинга в Electron
    // Все запросы к несуществующим файлам должны возвращать index.html
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      // Если это ошибка загрузки файла (например, при навигации по маршрутам)
      if (errorCode === -6) {
        // -6 = ERR_FILE_NOT_FOUND
        // Проверяем, что это запрос к файлу в нашей директории
        if (validatedURL.startsWith('file://')) {
          const urlPath = new URL(validatedURL).pathname;
          // Если это не запрос к статическому файлу, загружаем index.html
          const isStaticFile =
            /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map)$/i.test(urlPath);
          if (!isStaticFile) {
            console.log(`SPA routing fallback: loading index.html for ${validatedURL}`);
            win.loadFile(indexPath);
            return;
          }
        }
      }

      // Логируем другие ошибки только если это не SPA роутинг
      if (errorCode !== -6) {
        console.error('Failed to load:', {
          errorCode,
          errorDescription,
          validatedURL,
          webAppPath,
          indexPath,
        });
      }
    });

    win.loadFile(indexPath).catch((error) => {
      console.error('Error loading file:', error);
    });
  }

  // Горячие клавиши для открытия DevTools (работает в dev и production)
  win.webContents.on('before-input-event', (event, input) => {
    // Cmd+Option+I на macOS, Ctrl+Shift+I на Windows/Linux
    if (
      (input.control && input.shift && input.key.toLowerCase() === 'i') ||
      (input.meta && input.alt && input.key.toLowerCase() === 'i')
    ) {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools();
      }
    }
  });
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

  // Открытие/закрытие DevTools
  ipcMain.handle('window:toggleDevTools', (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools();
    } else {
      win.webContents.openDevTools();
    }
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
