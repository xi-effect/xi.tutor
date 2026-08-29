import { DEFAULT_THEME, type DrDefaultColor, type DrTheme } from '@ibodr/editor';
import { BOARD_THEME_COLORS } from './boardColors';

const isDefaultColor = (value: unknown): value is DrDefaultColor =>
  typeof value === 'object' && value !== null && 'noteFill' in value && 'solid' in value;

const applyPalette = (theme: DrTheme, mode: 'light' | 'dark') => {
  const colors = theme.colors[mode] as Record<string, unknown>;

  for (const option of BOARD_THEME_COLORS) {
    const entry = colors[option.name];
    if (!isDefaultColor(entry)) continue;

    // Stickers keep the picker token in both themes (yellow stays yellow).
    entry.noteFill = option.cssVar;
    entry.noteText = option.noteTextCssVar;
    entry.semi = option.semiCssVar;

    // Ink (text, pen, geo stroke) follows theme: black is dark on light canvas
    // and light on dark canvas. Chromatic colors keep the same token.
    const ink = mode === 'dark' ? (option.cssVarDark ?? option.cssVar) : option.cssVar;
    entry.solid = ink;
    entry.fill = ink;
    entry.pattern = ink;
    entry.linedFill = ink;
    entry.frameHeadingStroke = ink;
    entry.frameStroke = ink;
  }
};

export const createBoardDrawTheme = (): DrTheme => {
  const theme = structuredClone(DEFAULT_THEME) as DrTheme;
  applyPalette(theme, 'light');
  applyPalette(theme, 'dark');
  return theme;
};

export const BOARD_DRAW_THEMES = { default: createBoardDrawTheme() };
