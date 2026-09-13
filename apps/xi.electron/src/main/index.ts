import { app } from 'electron';
import { SovliumDesktopApp } from './app';

app.setName('Sovlium');

const desktop = new SovliumDesktopApp();
void desktop.start().catch((error) => {
  console.error('[xi.electron] failed to start', error);
  app.quit();
});
