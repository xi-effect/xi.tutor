import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import { IPC } from '../../shared/channels';
import type { MediaPermissionKind, SlotBounds } from '../../shared/types';
import type { ConferenceController } from '../conference/controller';
import { PRODUCT_NAME } from '../../shared/constants';
import { openExternalUrl } from '../navigation';
import { getMediaPermissionStatus, requestMediaPermission } from '../permissions';
import { getShellTheme, setShellTheme } from '../theme';
import {
  broadcastShareOverlayStop,
  hideShareOverlayWindow,
  showShareOverlayWindow,
} from '../windows/share-overlay-window';
import { showMainWindow } from '../windows/main-window';
import { asNumber, asRecord, asString, assertTrustedSender } from './validate';

function nativeOs(): 'macos' | 'windows' | 'linux' | 'unknown' {
  if (process.platform === 'darwin') return 'macos';
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'linux') return 'linux';
  return 'unknown';
}

function parseBounds(value: unknown): SlotBounds | null {
  if (value === null) return null;
  const record = asRecord(value);
  const width = asNumber(record.width);
  const height = asNumber(record.height);
  if (width <= 0 || height <= 0) return null;
  return {
    x: asNumber(record.x),
    y: asNumber(record.y),
    width,
    height,
  };
}

export function registerIpc(options: {
  getMainWindow: () => BrowserWindow | null;
  conference: ConferenceController;
}): void {
  const { getMainWindow, conference } = options;

  const handle = (
    channel: string,
    listener: (
      event: Electron.IpcMainInvokeEvent,
      ...args: unknown[]
    ) => unknown | Promise<unknown>,
  ) => {
    ipcMain.handle(channel, async (event, ...args) => {
      assertTrustedSender(event, channel);
      return listener(event, ...args);
    });
  };

  handle(IPC.appGetInfo, async () => ({
    name: PRODUCT_NAME,
    version: app.getVersion(),
    platform: nativeOs(),
    isDebug: !app.isPackaged,
  }));

  handle(IPC.appGetPlatform, async () => nativeOs());

  handle(IPC.windowMinimize, async () => {
    getMainWindow()?.minimize();
  });

  handle(IPC.windowMaximize, async () => {
    const window = getMainWindow();
    if (!window) return;
    if (window.isMaximized()) window.unmaximize();
    else window.maximize();
  });

  handle(IPC.windowClose, async () => {
    getMainWindow()?.close();
  });

  handle(IPC.windowFocus, async () => {
    showMainWindow(getMainWindow());
  });

  handle(IPC.windowUnminimize, async () => {
    const window = getMainWindow();
    if (window?.isMinimized()) window.restore();
  });

  handle(IPC.windowIsMinimized, async () => Boolean(getMainWindow()?.isMinimized()));

  handle(IPC.windowSetTitle, async (_event, title) => {
    const next = asString(title, PRODUCT_NAME);
    getMainWindow()?.setTitle(next);
  });

  handle(IPC.conferenceStart, async (_event, input) => {
    const classroomId = asString(asRecord(input).classroomId);
    return conference.start(classroomId);
  });

  handle(IPC.conferenceLeave, async () => {
    await conference.leave();
  });

  handle(IPC.conferenceSetSlotBounds, async (_event, bounds) => {
    conference.setSlotBounds(parseBounds(bounds));
  });

  handle(IPC.conferenceEnterFloating, async (_event, size) => {
    const record = asRecord(size);
    return conference.enterFloatingMode({
      width: asNumber(record.width, 380),
      height: asNumber(record.height, 280),
    });
  });

  handle(IPC.conferenceExitFloating, async () => {
    await conference.exitFloatingMode();
  });

  handle(IPC.conferenceResizeFloating, async (_event, size) => {
    const record = asRecord(size);
    return conference.resizeFloating({
      width: asNumber(record.width, 380),
      height: asNumber(record.height, 280),
    });
  });

  handle(IPC.conferenceGetState, async () => conference.getState());

  handle(IPC.conferenceEnded, async () => {
    await conference.leave();
  });

  handle(IPC.screenShareOpenControls, async () => {
    showShareOverlayWindow();
  });

  handle(IPC.screenShareCloseControls, async () => {
    hideShareOverlayWindow();
  });

  handle(IPC.screenShareFocusMain, async () => {
    showMainWindow(getMainWindow());
  });

  handle(IPC.screenShareRequestStop, async () => {
    broadcastShareOverlayStop();
  });

  handle(IPC.filesSave, async (event, input) => {
    const record = asRecord(input);
    const defaultName = asString(record.defaultName, 'download');
    const contentsBase64 = asString(record.contentsBase64);
    if (!contentsBase64) return false;
    const window = BrowserWindow.fromWebContents(event.sender) ?? getMainWindow();
    const result = window
      ? await dialog.showSaveDialog(window, { defaultPath: defaultName })
      : await dialog.showSaveDialog({ defaultPath: defaultName });
    if (result.canceled || !result.filePath) return false;
    await fs.writeFile(result.filePath, Buffer.from(contentsBase64, 'base64'));
    return true;
  });

  handle(IPC.externalOpenUrl, async (_event, url) => {
    await openExternalUrl(asString(url));
  });

  handle(IPC.permissionsStatus, async (_event, kind) => {
    return getMediaPermissionStatus(asString(kind) as MediaPermissionKind);
  });

  handle(IPC.permissionsRequest, async (_event, kind) => {
    return requestMediaPermission(asString(kind) as MediaPermissionKind);
  });

  handle(IPC.themeGet, async () => getShellTheme());

  handle(IPC.themeSet, async (_event, theme) => {
    const next = asString(theme) === 'dark' ? 'dark' : 'light';
    setShellTheme(next);
  });
}
