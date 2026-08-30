import { describe, expect, it } from 'vitest';
import { BOARD_COLORS, getBoardColorOption } from '../boardColors';
import { createBoardDrawTheme } from '../boardDrawTheme';

describe('boardColors', () => {
  it('держит уникальные имена в пикере', () => {
    const names = BOARD_COLORS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('включает белый для текста и карандаша', () => {
    expect(BOARD_COLORS.some((color) => color.name === 'white')).toBe(true);
  });

  it('мапит алиасы старых стикеров на те же токены', () => {
    expect(getBoardColorOption('light-red')?.cssVar).toBe(getBoardColorOption('orange')?.cssVar);
    expect(getBoardColorOption('pink')?.cssVar).toBe(getBoardColorOption('light-violet')?.cssVar);
  });
});

describe('boardDrawTheme', () => {
  it('синхронизирует noteFill со swatch в обеих темах', () => {
    const theme = createBoardDrawTheme();
    for (const color of BOARD_COLORS) {
      expect(theme.colors.light[color.name]).toMatchObject({
        noteFill: color.cssVar,
        semi: color.semiCssVar,
      });
      expect(theme.colors.dark[color.name]).toMatchObject({
        noteFill: color.cssVar,
        semi: color.semiCssVar,
      });
    }
  });

  it('в светлой теме рисует текст тем же токеном, что и swatch', () => {
    const theme = createBoardDrawTheme();
    for (const color of BOARD_COLORS) {
      expect(theme.colors.light[color.name]).toMatchObject({
        solid: color.cssVar,
      });
    }
  });

  it('в тёмной теме инвертирует чёрные чернила, не трогая заливку стикера', () => {
    const theme = createBoardDrawTheme();
    const black = BOARD_COLORS.find((color) => color.name === 'black');
    expect(black?.cssVarDark).toBe('var(--xi-gray-0)');
    expect(theme.colors.dark.black).toMatchObject({
      solid: black?.cssVarDark,
      noteFill: black?.cssVar,
    });
    expect(theme.colors.dark.black.solid).not.toBe(theme.colors.dark.black.noteFill);
  });

  it('в тёмной теме оставляет белые чернила светлыми', () => {
    const theme = createBoardDrawTheme();
    const white = BOARD_COLORS.find((color) => color.name === 'white');
    expect(theme.colors.dark.white).toMatchObject({
      solid: white?.cssVarDark ?? white?.cssVar,
    });
  });
});
