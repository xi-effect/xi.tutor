import { BrowserWindow, session, type Session } from 'electron';
import { PARTITION } from '../shared/constants';
import { isBundledWebMode } from './config';
import { createAppOriginHandler } from './protocol';
import { resolveWebBundle } from './web-bundle';
import { installPermissionHandlers } from './permissions';

let cached: Session | null = null;

export function getSovliumSession(): Session {
  if (cached) return cached;
  cached = session.fromPartition(PARTITION);
  return cached;
}

function installDownloadHandler(ses: Session): void {
  ses.on('will-download', (_event, item, webContents) => {
    const filename = item.getFilename() || 'download';
    const window = BrowserWindow.fromWebContents(webContents);
    item.setSaveDialogOptions({
      defaultPath: filename,
      title: window ? undefined : 'Сохранить файл',
    });
  });
}

export function configureSovliumSession(): Session {
  const ses = getSovliumSession();
  installPermissionHandlers(ses);
  installDownloadHandler(ses);

  if (isBundledWebMode()) {
    const bundle = resolveWebBundle();
    ses.protocol.handle('https', createAppOriginHandler(ses, bundle));
  }

  return ses;
}
