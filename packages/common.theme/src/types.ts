export type ThemeT = 'light' | 'dark' | 'system';
export type ThemeItemT = {
  label: string;
  value: ThemeT;
};

export type ThemeContextT = {
  theme: ThemeT;
  setTheme: (newTheme: ThemeT) => void;
  themes: ThemeItemT[];
};
