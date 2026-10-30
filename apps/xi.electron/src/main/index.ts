import path from 'node:path';
import { app, dialog } from 'electron';
import { SovliumDesktopApp } from './app';

app.setName('sovlium');

// Chromium otherwise drops notification and call sounds until a click in this
// window, so they stay silent in the shell while the site plays them.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// Системный звук macOS/Linux при захвате экрана. На Windows loopback есть и без флагов.
app.commandLine.appendSwitch(
  'enable-features',
  'MacLoopbackAudioForScreenShare,MacSckSystemAudioLoopbackOverride,PulseaudioLoopbackForScreenShare',
);

// Keep the existing data folder: the visible rename must not sign the user out.
app.setPath(
  'userData',
  path.join(app.getPath('appData'), app.isPackaged ? 'Sovlium' : 'Sovlium-dev'),
);

const desktop = new SovliumDesktopApp();
void desktop.start().catch(async (error) => {
  console.error('[xi.electron] failed to start', error);
  try {
    if (!app.isReady()) {
      await app.whenReady();
    }
    dialog.showErrorBox(
      'sovlium',
      error instanceof Error ? (error.stack ?? error.message) : String(error),
    );
  } catch {
    // ignore — still quit below
  }
  app.quit();
});
