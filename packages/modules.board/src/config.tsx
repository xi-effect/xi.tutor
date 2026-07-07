import type { DrBoardBackgroundType } from '@ibodr/draw';
import type { InputMode } from './store/useDrawStore';
import { Cursor, Pen } from '@xipkg/icons';

export const DEFAULT_BOARD_BACKGROUND_TYPE: DrBoardBackgroundType = 'dots';
export const DEFAULT_BOARD_BACKGROUND_COLOR = 'white' as const;

export type BoardBackgroundColorId = 'white' | 'gray' | 'cream' | 'green' | 'blue';

export const BOARD_BACKGROUND_TYPE_OPTIONS: {
  value: DrBoardBackgroundType;
  label: string;
}[] = [
  { value: 'dots', label: 'Точки' },
  { value: 'grid', label: 'Сетка' },
  { value: 'hex-grid', label: 'Гексагональная сетка' },
  { value: 'lined', label: 'Тетрадь в линию' },
  { value: 'double-line', label: 'Двойная линия' },
  { value: 'double-line-slash', label: 'Двойная линия с косой чертой' },
  { value: 'checkered', label: 'Тетрадь в клетку' },
];

export const BOARD_BACKGROUND_COLOR_OPTIONS: {
  value: BoardBackgroundColorId;
  label: string;
}[] = [
  { value: 'white', label: 'Белый' },
  { value: 'gray', label: 'Серый' },
  { value: 'cream', label: 'Кремовый' },
  { value: 'green', label: 'Зелёный' },
  { value: 'blue', label: 'Голубой' },
];

export const BOARD_BACKGROUND_COLOR_VALUES: Record<BoardBackgroundColorId, string> = {
  white: 'hsl(210, 20%, 98%)',
  gray: 'hsl(0, 0%, 92%)',
  cream: 'hsl(48, 60%, 94%)',
  green: 'hsl(120, 35%, 94%)',
  blue: 'hsl(210, 55%, 96%)',
};

const BOARD_BACKGROUND_TYPE_SET = new Set<DrBoardBackgroundType>(
  BOARD_BACKGROUND_TYPE_OPTIONS.map(({ value }) => value),
);

const BOARD_BACKGROUND_COLOR_SET = new Set<BoardBackgroundColorId>(
  BOARD_BACKGROUND_COLOR_OPTIONS.map(({ value }) => value),
);

export function isBoardBackgroundType(value: unknown): value is DrBoardBackgroundType {
  return typeof value === 'string' && BOARD_BACKGROUND_TYPE_SET.has(value as DrBoardBackgroundType);
}

export function isBoardBackgroundColorId(value: unknown): value is BoardBackgroundColorId {
  return (
    typeof value === 'string' && BOARD_BACKGROUND_COLOR_SET.has(value as BoardBackgroundColorId)
  );
}

export function normalizeBoardBackgroundType(type: unknown): DrBoardBackgroundType {
  if (type === 'none' || type === 'dots') return 'dots';
  if (isBoardBackgroundType(type)) return type;
  return DEFAULT_BOARD_BACKGROUND_TYPE;
}

export function getBoardBackgroundTypeLabel(type: DrBoardBackgroundType): string {
  return (
    BOARD_BACKGROUND_TYPE_OPTIONS.find(({ value }) => value === normalizeBoardBackgroundType(type))
      ?.label ?? type
  );
}

export function getBoardBackgroundColorLabel(color: BoardBackgroundColorId): string {
  return BOARD_BACKGROUND_COLOR_OPTIONS.find(({ value }) => value === color)?.label ?? color;
}

export type ShapeCategoryT = {
  key: string;
  label: string;
  types: string[];
};

export const DEFAULT_PEN_COLOR = 'black';
export const DEFAULT_PEN_THICKNESS = 'm';
export const DEFAULT_PEN_OPACITY = 1;

export const INPUT_MODE_OPTIONS: { value: InputMode; label: string; icon: React.ReactNode }[] = [
  { value: 'auto', label: 'Авто (по устройству)', icon: null },
  { value: 'pen', label: 'Перо', icon: <Pen /> },
  { value: 'mouse', label: 'Мышь', icon: <Cursor /> },
];

export const BOARD_SHAPE_CATEGORIES: Record<string, ShapeCategoryT> = {
  images: {
    key: 'images',
    label: 'Изображения',
    types: ['image'],
  },

  text: {
    key: 'text',
    label: 'Текст',
    types: ['text'],
  },

  drawings: {
    key: 'drawings',
    label: 'Рисунки',
    types: ['draw', 'highlight'],
  },

  shapes: {
    key: 'shapes',
    label: 'Фигуры',
    types: ['geo', 'xi-geo', 'coordinate-axes'],
  },

  stickers: {
    key: 'stickers',
    label: 'Стикеры',
    types: ['note'],
  },

  frames: {
    key: 'frames',
    label: 'Фреймы',
    types: ['frame'],
  },

  arrows: {
    key: 'arrows',
    label: 'Стрелки',
    types: ['arrow'],
  },

  lines: {
    key: 'lines',
    label: 'Линии',
    types: ['line'],
  },

  notes: {
    key: 'notes',
    label: 'Заметки',
    types: ['note'],
  },

  media: {
    key: 'media',
    label: 'Медиа',
    types: ['pdf', 'audio', 'video', 'embed', 'bookmark'],
  },

  widgets: {
    key: 'widgets',
    label: 'Виджеты',
    types: ['kanban', 'coordinate-axes'],
  },
};

export const SHAPE_CATEGORIES: ShapeCategoryT[] = [
  BOARD_SHAPE_CATEGORIES.images,
  BOARD_SHAPE_CATEGORIES.text,
  BOARD_SHAPE_CATEGORIES.drawings,
  BOARD_SHAPE_CATEGORIES.shapes,
  BOARD_SHAPE_CATEGORIES.notes,
  BOARD_SHAPE_CATEGORIES.arrows,
  BOARD_SHAPE_CATEGORIES.media,
  BOARD_SHAPE_CATEGORIES.widgets,
];

export const ERASER_CATEGORIES: ShapeCategoryT[] = [
  BOARD_SHAPE_CATEGORIES.text,
  BOARD_SHAPE_CATEGORIES.images,
  BOARD_SHAPE_CATEGORIES.media,
  BOARD_SHAPE_CATEGORIES.shapes,
  BOARD_SHAPE_CATEGORIES.stickers,
  BOARD_SHAPE_CATEGORIES.frames,
  BOARD_SHAPE_CATEGORIES.arrows,
  BOARD_SHAPE_CATEGORIES.lines,
  BOARD_SHAPE_CATEGORIES.widgets,
];
