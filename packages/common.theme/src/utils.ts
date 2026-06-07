import type { ThemeT } from './types';

export const THEME_VALUES: ThemeT[] = ['light', 'dark', 'system'];

export const isTheme = (value: string | null | undefined): value is ThemeT =>
  value != null && THEME_VALUES.includes(value as ThemeT);

export const resolveThemeAppearance = (theme: ThemeT): 'light' | 'dark' => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
};
