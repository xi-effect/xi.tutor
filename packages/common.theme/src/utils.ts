import type { ThemeT } from './types';

export const THEME_STORAGE_KEY = 'sovlium-theme';
export const THEME_CHOSEN_STORAGE_KEY = 'sovlium-theme-chosen';

export const THEME_VALUES: ThemeT[] = ['light', 'dark'];

export const isTheme = (value: string | null | undefined): value is ThemeT =>
  value != null && THEME_VALUES.includes(value as ThemeT);

/** Нормализует тему из storage/API; устаревшее значение `system` → `light`. */
export const normalizeTheme = (value: string | null | undefined): ThemeT | null => {
  if (isTheme(value)) return value;
  if (value === 'system') return 'light';
  return null;
};

export const readThemeChosen = (): boolean => {
  try {
    return localStorage.getItem(THEME_CHOSEN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const writeThemeChosen = (chosen: boolean) => {
  try {
    if (chosen) {
      localStorage.setItem(THEME_CHOSEN_STORAGE_KEY, '1');
      return;
    }

    localStorage.removeItem(THEME_CHOSEN_STORAGE_KEY);
  } catch {
    // localStorage может быть недоступен в приватном режиме
  }
};

export const writeStoredTheme = (theme: ThemeT) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage может быть недоступен в приватном режиме
  }
};

export const readStoredTheme = (): ThemeT | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const theme = normalizeTheme(stored);

    // Мигрируем устаревшее значение `system` в storage.
    if (stored === 'system' && theme) {
      writeStoredTheme(theme);
    }

    return theme;
  } catch {
    return null;
  }
};

/** Тема из localStorage — только после явного выбора в настройках. */
export const readStoredThemePreference = (): ThemeT | null => {
  if (!readThemeChosen()) return null;
  return readStoredTheme();
};
