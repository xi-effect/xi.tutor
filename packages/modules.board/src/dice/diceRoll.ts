/** Грани, которые можно бросить с панели доски. */
export const DICE_SIDES = [2, 4, 6, 8, 10, 12, 20] as const;

export type DiceSides = (typeof DICE_SIDES)[number];

/** Сколько крутится кубик, прежде чем показать итог. */
export const DICE_ROLL_MS = 1700;

const SIDE_SET = new Set<number>(DICE_SIDES);

export function isDiceSides(value: number): value is DiceSides {
  return SIDE_SET.has(value);
}

/** Итог считает только бросающий. В фигуру записывается уже готовое число. */
export function rollDie(sides: number, random: () => number = Math.random): number {
  const safeSides = Math.max(1, Math.floor(sides));
  const sample = random();
  const normalized = Number.isFinite(sample) ? Math.min(0.999999, Math.max(0, sample)) : 0;
  return Math.floor(normalized * safeSides) + 1;
}

export function normalizeDiceFace(
  sides: number,
  value: number,
): { sides: DiceSides; value: number } {
  const safeSides = isDiceSides(sides) ? sides : 6;
  const rounded = Math.round(value);
  const safeValue = Number.isInteger(rounded) && rounded >= 1 && rounded <= safeSides ? rounded : 1;
  return { sides: safeSides, value: safeValue };
}
