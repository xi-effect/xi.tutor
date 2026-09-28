import fs from 'node:fs';
import path from 'node:path';
import { app, screen, type Rectangle } from 'electron';
import { DEFAULT_WINDOW } from '../shared/constants';

type SavedWindowState = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  maximized: boolean;
};

function statePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function isVisible(bounds: Rectangle): boolean {
  return screen.getAllDisplays().some((display) => {
    const area = display.workArea;
    const overlapX =
      Math.min(bounds.x + bounds.width, area.x + area.width) - Math.max(bounds.x, area.x);
    const overlapY =
      Math.min(bounds.y + bounds.height, area.y + area.height) - Math.max(bounds.y, area.y);
    return overlapX > 80 && overlapY > 80;
  });
}

export function loadWindowState(): SavedWindowState {
  try {
    const raw = fs.readFileSync(statePath(), 'utf8');
    const parsed = JSON.parse(raw) as SavedWindowState;
    const width = Math.max(Number(parsed.width) || DEFAULT_WINDOW.width, DEFAULT_WINDOW.minWidth);
    const height = Math.max(
      Number(parsed.height) || DEFAULT_WINDOW.height,
      DEFAULT_WINDOW.minHeight,
    );
    const next: SavedWindowState = {
      width,
      height,
      maximized: Boolean(parsed.maximized),
    };
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      const bounds = { x: parsed.x, y: parsed.y, width, height };
      if (isVisible(bounds)) {
        next.x = parsed.x;
        next.y = parsed.y;
      }
    }
    return next;
  } catch {
    return {
      width: DEFAULT_WINDOW.width,
      height: DEFAULT_WINDOW.height,
      maximized: false,
    };
  }
}

export function saveWindowState(state: SavedWindowState): void {
  try {
    fs.mkdirSync(path.dirname(statePath()), { recursive: true });
    fs.writeFileSync(statePath(), JSON.stringify(state));
  } catch (error) {
    console.warn('[xi.electron] failed to persist window state', error);
  }
}
