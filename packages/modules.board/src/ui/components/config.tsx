import type { InputMode } from '../../store/useTldrawStore';
import { Cursor, Pen } from '@xipkg/icons';

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
    key: 'geo',
    label: 'Фигуры',
    types: ['geo'],
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
};

export const SHAPE_CATEGORIES: ShapeCategoryT[] = [
  BOARD_SHAPE_CATEGORIES.images,
  BOARD_SHAPE_CATEGORIES.text,
  BOARD_SHAPE_CATEGORIES.drawings,
  BOARD_SHAPE_CATEGORIES.shapes,
  BOARD_SHAPE_CATEGORIES.notes,
  BOARD_SHAPE_CATEGORIES.arrows,
  BOARD_SHAPE_CATEGORIES.media,
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
];
