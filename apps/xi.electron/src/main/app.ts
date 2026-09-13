import { app, BrowserWindow } from 'electron';
import { APP_ID } from '../shared/constants';
import { ConferenceController } from './conference/controller';
import {
  consumePendingDeepLink,
  dispatchDeepLink,
  findDeepLinkInArgv,
  registerDeepLinkProtocol,
} from './deep-link';
import { EVENTS } from '../shared/channels';
import { registerIpc } from './ipc';
import { configureSovliumSession } from './session';
import { initUpdater } from './updater';
import { createMainWindow, showMainWindow } from './windows/main-window';

export class SovliumDesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private quitting = false;
  private readonly conference = new ConferenceController(() => this.mainWindow);

  async start(): Promise<void> {
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
      app.quit();
      return;
    }

    if (process.platform === 'win32') {
      app.setAppUserModelId(APP_ID);
    }

    registerDeepLinkProtocol();
    configureSovliumSession();
    registerIpc({
      getMainWindow: () => this.mainWindow,
      conference: this.conference,
    });

    app.on('second-instance', (_event, argv) => {
      showMainWindow(this.mainWindow);
      const url = findDeepLinkInArgv(argv);
      if (url) dispatchDeepLink(this.mainWindow, url);
    });

    app.on('open-url', (event, url) => {
      event.preventDefault();
      dispatchDeepLink(this.mainWindow, url);
    });

    app.on('before-quit', () => {
      this.quitting = true;
    });

    await app.whenReady();
    this.mainWindow = createMainWindow();
    this.attachMainWindow(this.mainWindow);

    const bootLink = findDeepLinkInArgv(process.argv) ?? consumePendingDeepLink();
    if (bootLink) {
      this.mainWindow.webContents.once('did-finish-load', () => {
        const current = this.mainWindow;
        if (!current) return;
        if (bootLink.startsWith('sovlium://')) {
          dispatchDeepLink(current, bootLink);
        } else {
          current.webContents.send(EVENTS.deepLink, bootLink);
        }
      });
    }

    app.on('activate', () => {
      if (!this.mainWindow || this.mainWindow.isDestroyed()) {
        this.mainWindow = createMainWindow();
        this.attachMainWindow(this.mainWindow);
        return;
      }
      showMainWindow(this.mainWindow);
    });

    void initUpdater();
  }

  private attachMainWindow(window: BrowserWindow): void {
    window.on('resize', () => this.conference.handleMainResize());
    window.webContents.on('did-change-theme-color', () => this.conference.handleMainResize());
    window.webContents.on('enter-html-full-screen', () => this.conference.handleMainResize());
    window.webContents.on('leave-html-full-screen', () => this.conference.handleMainResize());
    window.webContents.on('focus', () => {
      window.webContents.send(EVENTS.windowFocus, true);
    });
    window.on('blur', () => {
      window.webContents.send(EVENTS.windowFocus, false);
    });
    window.on('focus', () => {
      window.webContents.send(EVENTS.windowFocus, true);
    });

    window.on('close', (event) => {
      if (this.quitting || !this.conference.isActive()) {
        return;
      }
      event.preventDefault();
      if (!this.conference.isFloating()) {
        void this.conference.enterFloatingMode();
      }
      window.hide();
    });

    window.on('closed', () => {
      this.mainWindow = null;
      if (!this.conference.isActive()) {
        app.quit();
      }
    });
  }
}
