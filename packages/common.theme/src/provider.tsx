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
  { label: 'Системная', value: 'system' },
];

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const [theme, setThemeState] = useState<ThemeT>(user?.theme || DEFAULT_THEME);

  const applyTheme = (newTheme: ThemeT) => {
    const root = document.documentElement;

    ALL_THEMES.forEach((t) => {
      root.classList.remove(t.value);
    });

    root.classList.add(newTheme);

    root.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
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
