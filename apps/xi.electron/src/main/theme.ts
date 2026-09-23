import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { ShellTheme } from '../shared/types';

function themePath(): string {
  return path.join(app.getPath('userData'), 'shell-theme.json');
}

export function getShellTheme(): ShellTheme {
  try {
    const raw = fs.readFileSync(themePath(), 'utf8');
    const parsed = JSON.parse(raw) as { theme?: string };
    return parsed.theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function setShellTheme(theme: ShellTheme): void {
  try {
    fs.mkdirSync(path.dirname(themePath()), { recursive: true });
    fs.writeFileSync(themePath(), JSON.stringify({ theme }));
  } catch (error) {
    console.warn('[xi.electron] failed to persist shell theme', error);
  }
}
