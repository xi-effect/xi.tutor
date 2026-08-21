import { describe, expect, it } from 'vitest';
import { BOARD_COLORS, getBoardColorOption } from '../boardColors';
import { createBoardDrawTheme } from '../boardDrawTheme';

describe('boardColors', () => {
  it('держит уникальные имена в пикере', () => {
    const names = BOARD_COLORS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('мапит алиасы старых стикеров на те же токены', () => {
    expect(getBoardColorOption('light-red')?.cssVar).toBe(getBoardColorOption('orange')?.cssVar);
    expect(getBoardColorOption('pink')?.cssVar).toBe(getBoardColorOption('light-violet')?.cssVar);
  });
});

describe('boardDrawTheme', () => {
  it('синхронизирует noteFill со solid для цветов пикера', () => {
    const theme = createBoardDrawTheme();
    for (const color of BOARD_COLORS) {
      const light = theme.colors.light[color.name];
      expect(light).toMatchObject({
        solid: color.cssVar,
        noteFill: color.cssVar,
        semi: color.semiCssVar,
      });
    }
  });
});
