import type { TColor } from '../types';

export type TColorOption = {
  name: TColor;
  class: string;
};

export type BoardColorOption = TColorOption & {
  borderClass: string;
  fillClass: string;
  /** Canvas fill / stroke (same token as the picker swatch). */
  cssVar: string;
  semiCssVar: string;
  noteTextCssVar: string;
};

/**
 * Единая палитра доски: те же имена, что у DefaultColorStyle,
 * и те же токены, что в редакторе (`elementColors`).
 */
export const BOARD_COLORS: BoardColorOption[] = [
  {
    name: 'black',
    class: 'bg-gray-100',
    borderClass: 'border-gray-100',
    fillClass: 'fill-gray-100',
    cssVar: 'var(--xi-gray-100)',
    semiCssVar: 'var(--xi-gray-10)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'blue',
    class: 'bg-brand-80',
    borderClass: 'border-brand-80',
    fillClass: 'fill-brand-80',
    cssVar: 'var(--xi-brand-80)',
    semiCssVar: 'var(--xi-brand-0)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'red',
    class: 'bg-red-100',
    borderClass: 'border-red-100',
    fillClass: 'fill-red-100',
    cssVar: 'var(--xi-red-100)',
    semiCssVar: 'var(--xi-red-0)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'green',
    class: 'bg-green-80',
    borderClass: 'border-green-80',
    fillClass: 'fill-green-80',
    cssVar: 'var(--xi-green-80)',
    semiCssVar: 'var(--xi-green-0)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'orange',
    class: 'bg-orange-100',
    borderClass: 'border-orange-100',
    fillClass: 'fill-orange-100',
    cssVar: 'var(--xi-orange-100)',
    semiCssVar: 'var(--xi-orange-0)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'yellow',
    class: 'bg-yellow-100',
    borderClass: 'border-yellow-100',
    fillClass: 'fill-yellow-100',
    cssVar: 'var(--xi-yellow-100)',
    semiCssVar: 'var(--xi-yellow-20)',
    noteTextCssVar: 'var(--xi-gray-90)',
  },
  {
    name: 'violet',
    class: 'bg-violet-100',
    borderClass: 'border-violet-100',
    fillClass: 'fill-violet-100',
    cssVar: 'var(--xi-violet-100)',
    semiCssVar: 'var(--xi-violet-20)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'light-violet',
    class: 'bg-pink-100',
    borderClass: 'border-pink-100',
    fillClass: 'fill-pink-100',
    cssVar: 'var(--xi-pink-100)',
    semiCssVar: 'var(--xi-pink-20)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'light-blue',
    class: 'bg-cyan-100',
    borderClass: 'border-cyan-100',
    fillClass: 'fill-cyan-100',
    cssVar: 'var(--xi-cyan-100)',
    semiCssVar: 'var(--xi-cyan-20)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'grey',
    class: 'bg-gray-60',
    borderClass: 'border-gray-60',
    fillClass: 'fill-gray-60',
    cssVar: 'var(--xi-gray-60)',
    semiCssVar: 'var(--xi-gray-10)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
];

/** Цвета, которых нет в пикере, но они встречаются на старых стикерах/импортах. */
const BOARD_ALIAS_COLORS: BoardColorOption[] = [
  {
    name: 'light-red',
    class: 'bg-orange-100',
    borderClass: 'border-orange-100',
    fillClass: 'fill-orange-100',
    cssVar: 'var(--xi-orange-100)',
    semiCssVar: 'var(--xi-orange-0)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'pink',
    class: 'bg-pink-100',
    borderClass: 'border-pink-100',
    fillClass: 'fill-pink-100',
    cssVar: 'var(--xi-pink-100)',
    semiCssVar: 'var(--xi-pink-20)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
  {
    name: 'cyan',
    class: 'bg-cyan-100',
    borderClass: 'border-cyan-100',
    fillClass: 'fill-cyan-100',
    cssVar: 'var(--xi-cyan-100)',
    semiCssVar: 'var(--xi-cyan-20)',
    noteTextCssVar: 'var(--xi-gray-0)',
  },
];

export const BOARD_THEME_COLORS: BoardColorOption[] = [...BOARD_COLORS, ...BOARD_ALIAS_COLORS];

export const colorOptions: TColorOption[] = BOARD_COLORS.map(({ name, class: cls }) => ({
  name,
  class: cls,
}));

export const borderColorOptions = BOARD_COLORS.map(({ name, borderClass }) => ({
  name,
  class: borderClass,
}));

export const DEFAULT_BG_COLOR = 'bg-gray-100';
export const DEFAULT_BORDER_COLOR = 'border-gray-100';

export const getBoardColorOption = (name: string): BoardColorOption | undefined =>
  BOARD_THEME_COLORS.find((option) => option.name === name);
