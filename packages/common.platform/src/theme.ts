/**
 * Shell theme preference persisted on the native side.
 *
 * Needed because production desktop navigates from the local splash origin to
 * `*.sovlium.ru`, so `localStorage` alone cannot carry the theme across boots.
 */

import { isNativeShell } from './detect';
import { invokeCommand } from './native';

export type ShellTheme = 'light' | 'dark';

const THEME_ATTR = 'data-theme';
const THEME_PREF_ATTR = 'data-theme-preference';

function normalizeTheme(value: unknown): ShellTheme {
  return value === 'dark' ? 'dark' : 'light';
}

/** Applies theme classes/attrs on `<html>` (same contract as `common.theme`). */
export function applyDocumentTheme(theme: ShellTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'system');
  root.classList.add(theme);
  root.setAttribute(THEME_ATTR, theme);
  root.setAttribute(THEME_PREF_ATTR, theme);
}

export async function getShellTheme(): Promise<ShellTheme> {
  if (!isNativeShell()) {
    if (typeof document !== 'undefined') {
      return normalizeTheme(document.documentElement.getAttribute(THEME_ATTR));
    }
    return 'light';
  }
  try {
    const theme = await invokeCommand<string>('get_shell_theme');
    return normalizeTheme(theme);
  } catch (err) {
    console.warn('[common.platform] get_shell_theme failed', err);
    return 'light';
  }
}

export async function setShellTheme(theme: ShellTheme): Promise<void> {
  applyDocumentTheme(theme);
  if (!isNativeShell()) return;
  try {
    await invokeCommand('set_shell_theme', { theme });
  } catch (err) {
    console.warn('[common.platform] set_shell_theme failed', err);
  }
}

/** Reads persisted shell theme and applies it before first paint of splash UI. */
export async function hydrateShellTheme(): Promise<ShellTheme> {
  const theme = await getShellTheme();
  applyDocumentTheme(theme);
  return theme;
}
