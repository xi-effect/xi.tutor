import { useState, useEffect } from 'react';
import { useUpdateProfile, useCurrentUser } from 'common.services';

import { THEME_CUSTOMIZATION_ENABLED } from './config';
import { ThemeContext } from './context';
import { isTheme, resolveThemeAppearance } from './utils';

import type { FC, PropsWithChildren } from 'react';
import type { ThemeT, ThemeItemT } from './types';

const DEFAULT_THEME: ThemeT = 'light';
const ALL_THEMES: ThemeItemT[] = [
  { label: 'Светлая', value: 'light' },
  { label: 'Тёмная', value: 'dark' },
  { label: 'Как в системе', value: 'system' },
];

const applyTheme = (newTheme: ThemeT) => {
  const root = document.documentElement;

  ALL_THEMES.forEach((t) => {
    root.classList.remove(t.value);
  });

  root.classList.add(newTheme);
  root.setAttribute('data-theme', resolveThemeAppearance(newTheme));
};

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const [theme, setThemeState] = useState<ThemeT>(DEFAULT_THEME);

  useEffect(() => {
    if (!THEME_CUSTOMIZATION_ENABLED || !isTheme(user?.theme)) return;

    setThemeState((current) => (current === user.theme ? current : user.theme));
  }, [user?.theme]);

  const effectiveTheme = THEME_CUSTOMIZATION_ENABLED ? theme : DEFAULT_THEME;

  useEffect(() => {
    applyTheme(effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    if (!THEME_CUSTOMIZATION_ENABLED || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = async (newTheme: ThemeT) => {
    if (!THEME_CUSTOMIZATION_ENABLED) return;

    const previousTheme = theme;
    setThemeState(newTheme);

    try {
      await updateProfile.mutateAsync({ theme: newTheme });
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
