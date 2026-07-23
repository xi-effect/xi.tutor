export type ThemeT = 'light' | 'dark';
export type ThemeItemT = {
  label: string;
  value: ThemeT;
  badge?: string;
};

export type ThemeContextT = {
  theme: ThemeT;
  setTheme: (newTheme: ThemeT) => void;
  themes: ThemeItemT[];
};
