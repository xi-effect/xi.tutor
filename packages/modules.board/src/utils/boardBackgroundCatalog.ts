import type { DrBoardBackgroundType } from '@ibodr/draw';

/** Нет в @ibodr/draw: узор рисуем сами, в редактор уходит `none`. */
export const STAFF_BOARD_BACKGROUND_TYPE = 'staff' as const;

export type BoardBackgroundPattern = DrBoardBackgroundType | typeof STAFF_BOARD_BACKGROUND_TYPE;

export const DEFAULT_BOARD_BACKGROUND_TYPE: DrBoardBackgroundType = 'dots';

export const BOARD_BACKGROUND_COLORS = ['white', 'gray', 'cream', 'green', 'blue'] as const;

export type BoardBackgroundColorId = (typeof BOARD_BACKGROUND_COLORS)[number];

export const DEFAULT_BOARD_BACKGROUND_COLOR: BoardBackgroundColorId = 'white';

export const BOARD_BACKGROUND_TYPE_CHOICES: readonly {
  value: BoardBackgroundPattern;
  labelKey: string;
}[] = [
  { value: 'none', labelKey: 'background.none' },
  { value: 'dots', labelKey: 'background.dots' },
  { value: 'grid', labelKey: 'background.grid' },
  { value: 'hex-grid', labelKey: 'background.hexGrid' },
  { value: 'lined', labelKey: 'background.lined' },
  { value: STAFF_BOARD_BACKGROUND_TYPE, labelKey: 'background.staff' },
  { value: 'double-line', labelKey: 'background.doubleLine' },
  { value: 'double-line-slash', labelKey: 'background.doubleLineSlash' },
  { value: 'checkered', labelKey: 'background.checkered' },
];

export const BOARD_BACKGROUND_COLOR_CHOICES: readonly {
  value: BoardBackgroundColorId;
  labelKey: string;
}[] = [
  { value: 'white', labelKey: 'background.white' },
  { value: 'gray', labelKey: 'background.gray' },
  { value: 'cream', labelKey: 'background.cream' },
  { value: 'green', labelKey: 'background.green' },
  { value: 'blue', labelKey: 'background.blue' },
];

const BOARD_BACKGROUND_TYPE_SET = new Set<BoardBackgroundPattern>(
  BOARD_BACKGROUND_TYPE_CHOICES.map(({ value }) => value),
);

const BOARD_BACKGROUND_COLOR_SET = new Set<BoardBackgroundColorId>(BOARD_BACKGROUND_COLORS);

export function isBoardBackgroundType(value: unknown): value is BoardBackgroundPattern {
  return (
    typeof value === 'string' && BOARD_BACKGROUND_TYPE_SET.has(value as BoardBackgroundPattern)
  );
}

export function isBoardBackgroundColorId(value: unknown): value is BoardBackgroundColorId {
  return (
    typeof value === 'string' && BOARD_BACKGROUND_COLOR_SET.has(value as BoardBackgroundColorId)
  );
}

export function normalizeBoardBackgroundType(type: unknown): BoardBackgroundPattern {
  if (isBoardBackgroundType(type)) return type;
  return DEFAULT_BOARD_BACKGROUND_TYPE;
}

export function normalizeBoardBackgroundColor(color: unknown): BoardBackgroundColorId {
  if (isBoardBackgroundColorId(color)) return color;
  return DEFAULT_BOARD_BACKGROUND_COLOR;
}
