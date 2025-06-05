import { createContext } from 'react';

import type { ThemeContextT } from './types';

export const ThemeContext = createContext<ThemeContextT | null>(null);
