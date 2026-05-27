import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUpdateProfile, useCurrentUser } from 'common.services';

import { ThemeContext } from './context';

import type { FC, PropsWithChildren } from 'react';
import type { ThemeT, ThemeItemT } from './types';

const DEFAULT_THEME: ThemeT = 'light';
const ALL_THEMES: ThemeItemT[] = [
  { label: 'Светлая', value: 'light' },
  { label: 'Тёмная', value: 'dark' },
  { label: 'Как в системе', value: 'system' },
];

type ResolvedThemeT = 'light' | 'dark';

const resolveTheme = (preference: ThemeT): ResolvedThemeT => {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
};

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const [theme, setThemeState] = useState<ThemeT>(user?.theme || DEFAULT_THEME);

  const applyTheme = (preference: ThemeT) => {
    const root = document.documentElement;
    const resolved = resolveTheme(preference);

    ALL_THEMES.forEach((t) => {
      root.classList.remove(t.value);
    });

    root.classList.add(preference);
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-preference', preference);
  };

  useEffect(() => {
    if (user?.theme) {
      setThemeState(user.theme);
    }
  }, [user?.theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = async (newTheme: ThemeT) => {
    setThemeState(newTheme);

    try {
      const response = await updateProfile.mutateAsync({ theme: newTheme });
      if (response.status === 200) {
        toast('Тема успешно обновлена');
      } else {
        toast('Ошибка при обновлении темы');
      }
    } catch (error) {
      console.error('Ошибка при обновлении темы', error);
      toast('Ошибка при обновлении темы');
    }
  };

  const value = {
    theme,
    setTheme,
    themes: ALL_THEMES,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
