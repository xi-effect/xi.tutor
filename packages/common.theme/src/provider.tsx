import { useState, useEffect } from 'react';
import { useUpdateProfile, useCurrentUser } from 'common.services';

import { THEME_CUSTOMIZATION_ENABLED } from './config';
import { ThemeContext } from './context';
import {
  normalizeTheme,
  readStoredThemePreference,
  readThemeChosen,
  writeStoredTheme,
  writeThemeChosen,
} from './utils';

import type { FC, PropsWithChildren } from 'react';
import type { ThemeT, ThemeItemT } from './types';

const DEFAULT_THEME: ThemeT = 'light';
const ALL_THEMES: ThemeItemT[] = [
  { label: 'Светлая', value: 'light' },
  { label: 'Тёмная', value: 'dark', badge: 'beta' },
];

const THEME_CLASSES = ['light', 'dark', 'system'] as const;

const applyTheme = (preference: ThemeT) => {
  const root = document.documentElement;

  THEME_CLASSES.forEach((value) => {
    root.classList.remove(value);
  });

  root.classList.add(preference);
  root.setAttribute('data-theme', preference);
  root.setAttribute('data-theme-preference', preference);
};

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const [theme, setThemeState] = useState<ThemeT>(
    () => readStoredThemePreference() ?? DEFAULT_THEME,
  );

  useEffect(() => {
    if (!THEME_CUSTOMIZATION_ENABLED) return;

    const profileTheme = normalizeTheme(user?.theme);
    if (!profileTheme) return;

    const hasChosenLocally = readThemeChosen();
    const shouldSyncFromProfile = hasChosenLocally || profileTheme === 'dark';

    if (!shouldSyncFromProfile) return;

    setThemeState((current) => (current === profileTheme ? current : profileTheme));
  }, [user?.theme]);

  const effectiveTheme = THEME_CUSTOMIZATION_ENABLED ? theme : DEFAULT_THEME;

  useEffect(() => {
    applyTheme(effectiveTheme);
  }, [effectiveTheme]);

  const setTheme = async (newTheme: ThemeT) => {
    if (!THEME_CUSTOMIZATION_ENABLED) return;

    const previousTheme = theme;
    setThemeState(newTheme);

    try {
      await updateProfile.mutateAsync({ theme: newTheme });
      writeStoredTheme(newTheme);
      writeThemeChosen(true);
    } catch (error) {
      setThemeState(previousTheme);
      console.error('Ошибка при обновлении темы', error);
    }
  };

  const value = {
    theme: effectiveTheme,
    setTheme,
    themes: THEME_CUSTOMIZATION_ENABLED
      ? ALL_THEMES
      : ALL_THEMES.filter((t) => t.value === DEFAULT_THEME),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
