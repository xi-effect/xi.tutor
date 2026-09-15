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
import { sendToRenderer } from './send';
import { initUpdater } from './updater';
import { createMainWindow, showMainWindow } from './windows/main-window';
import { setDisplaySleepBlocked } from './power';

export class SovliumDesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private readonly conference = new ConferenceController(() => this.mainWindow);

  async start(): Promise<void> {
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
      console.error(
        '[xi.electron] another Sovlium instance is already running. Close it and try again.',
      );
      app.quit();
      return;
    }

    if (process.platform === 'win32') {
      app.setAppUserModelId(APP_ID);
    }

    registerDeepLinkProtocol();
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

    await app.whenReady();
    // protocol.handle() is only allowed after ready. Calling it earlier
    // kills the packaged app with no window and no visible error.
    configureSovliumSession();
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
          sendToRenderer(current.webContents, EVENTS.deepLink, bootLink);
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
      sendToRenderer(window.webContents, EVENTS.windowFocus, true);
    });
    window.on('blur', () => {
      sendToRenderer(window.webContents, EVENTS.windowFocus, false);
    });
    window.on('focus', () => {
      sendToRenderer(window.webContents, EVENTS.windowFocus, true);
    });

    window.on('close', () => {
      void this.conference.leave();
    });

    window.on('closed', () => {
      this.mainWindow = null;
      setDisplaySleepBlocked(false);
      app.quit();
    });
  }
}
