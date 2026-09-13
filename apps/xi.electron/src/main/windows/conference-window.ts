import { BrowserWindow, screen } from 'electron';
import { FLOATING_CONFERENCE, PRODUCT_NAME } from '../../shared/constants';
import { installWindowNavigationGuard } from '../navigation';
import { createWebPreferences } from './main-window';

export function createFloatingConferenceWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay();
  const work = display.workArea;
  const width = FLOATING_CONFERENCE.width;
  const height = FLOATING_CONFERENCE.height;
  const window = new BrowserWindow({
    title: PRODUCT_NAME,
    width,
    height,
    minWidth: FLOATING_CONFERENCE.minWidth,
    minHeight: FLOATING_CONFERENCE.minHeight,
    x: work.x + work.width - width - 16,
    y: work.y + work.height - height - 16,
    show: false,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: false,
    autoHideMenuBar: true,
    webPreferences: createWebPreferences('conference'),
  });

  window.setAlwaysOnTop(true, 'floating');
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  installWindowNavigationGuard(window);
  return window;
}
