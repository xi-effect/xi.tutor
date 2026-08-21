import { DEFAULT_THEME, type DrDefaultColor, type DrTheme } from '@ibodr/editor';
import { BOARD_THEME_COLORS } from './boardColors';

const isDefaultColor = (value: unknown): value is DrDefaultColor =>
  typeof value === 'object' && value !== null && 'noteFill' in value && 'solid' in value;

const applyPalette = (theme: DrTheme, mode: 'light' | 'dark') => {
  const colors = theme.colors[mode] as Record<string, unknown>;

  for (const option of BOARD_THEME_COLORS) {
    const entry = colors[option.name];
    if (!isDefaultColor(entry)) continue;

    entry.solid = option.cssVar;
    entry.fill = option.cssVar;
    entry.pattern = option.cssVar;
    entry.linedFill = option.cssVar;
    entry.semi = option.semiCssVar;
    entry.noteFill = option.cssVar;
    entry.noteText = option.noteTextCssVar;
    entry.frameHeadingStroke = option.cssVar;
    entry.frameStroke = option.cssVar;
  }
};

export const createBoardDrawTheme = (): DrTheme => {
  const theme = structuredClone(DEFAULT_THEME) as DrTheme;
  applyPalette(theme, 'light');
  applyPalette(theme, 'dark');
  return theme;
};

export const BOARD_DRAW_THEMES = { default: createBoardDrawTheme() };
