import type { InputMode } from './store/useDrawStore';
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

export const stickers = [
  { id: '0', name: '0', src: '/stickers/0.webp' },
  { id: '1', name: '1', src: '/stickers/1.webp' },
  { id: '2', name: '2', src: '/stickers/2.webp' },
  { id: '3', name: '3', src: '/stickers/3.webp' },
  { id: '4', name: '4', src: '/stickers/4.webp' },
  { id: '5', name: '5', src: '/stickers/5.webp' },
  { id: '6', name: '6', src: '/stickers/6.webp' },
  { id: '7', name: '7', src: '/stickers/7.webp' },
  { id: '8', name: '8', src: '/stickers/8.webp' },
  { id: '9', name: '9', src: '/stickers/9.webp' },
  { id: '10', name: '10', src: '/stickers/10.webp' },
  { id: '11', name: '11', src: '/stickers/11.webp' },
  { id: '12', name: '12', src: '/stickers/12.webp' },
  { id: '13', name: '13', src: '/stickers/13.webp' },
  { id: '14', name: '14', src: '/stickers/14.webp' },
  { id: '15', name: '15', src: '/stickers/15.webp' },
  { id: '16', name: '16', src: '/stickers/16.webp' },
  { id: '17', name: '17', src: '/stickers/17.webp' },
  { id: '18', name: '18', src: '/stickers/18.webp' },
  { id: '19', name: '19', src: '/stickers/19.webp' },
  { id: '20', name: '20', src: '/stickers/20.webp' },
  { id: '21', name: '21', src: '/stickers/21.webp' },
  { id: '22', name: '22', src: '/stickers/22.webp' },
  { id: '23', name: '23', src: '/stickers/23.webp' },
  { id: '24', name: '24', src: '/stickers/24.webp' },
  { id: '25', name: '25', src: '/stickers/25.webp' },
  { id: '26', name: '26', src: '/stickers/26.webp' },
  { id: '27', name: '27', src: '/stickers/27.webp' },
  { id: '28', name: '28', src: '/stickers/28.webp' },
];
