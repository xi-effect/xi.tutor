import path from 'node:path';
import { app, dialog } from 'electron';
import { SovliumDesktopApp } from './app';

app.setName('Sovlium');

// Chromium otherwise drops notification and call sounds until a click in this
// window, so they stay silent in the shell while the site plays them.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (!app.isPackaged) {
  app.setPath('userData', path.join(app.getPath('appData'), 'Sovlium-dev'));
}

const desktop = new SovliumDesktopApp();
void desktop.start().catch(async (error) => {
  console.error('[xi.electron] failed to start', error);
  try {
    if (!app.isReady()) {
      await app.whenReady();
    }
    dialog.showErrorBox(
      'Sovlium',
      error instanceof Error ? (error.stack ?? error.message) : String(error),
    );
  } catch {
    // ignore — still quit below
  }
  app.quit();
});
