import { DEFAULT_TAG_COLOR, isTagColor, TAG_COLORS, type TagColor } from 'common.services';

export type TagColorStyle = {
  id: TagColor;
  dot: string;
  ring: string;
  chip: string;
};

/** Только ступени, которые есть в @xipkg/tailwind. В dark — те же alpha, что у status/tag. */
const chip = (bg: string, text: string, darkBg: string, darkText: string) =>
  `${bg} ${text} ${darkBg} ${darkText}`;

export const TAG_COLOR_STYLES: TagColorStyle[] = [
  {
    id: 'red',
    dot: 'bg-red-80',
    ring: 'outline-red-80',
    chip: chip('bg-red-0', 'text-red-100', 'dark:bg-red-100-a20', 'dark:text-red-40'),
  },
  {
    id: 'orange',
    dot: 'bg-orange-80',
    ring: 'outline-orange-80',
    chip: chip('bg-orange-0', 'text-orange-100', 'dark:bg-orange-100-a20', 'dark:text-orange-40'),
  },
  {
    id: 'yellow',
    dot: 'bg-yellow-60',
    ring: 'outline-yellow-60',
    chip: chip('bg-yellow-20', 'text-yellow-100', 'dark:bg-yellow-100-a20', 'dark:text-yellow-40'),
  },
  {
    id: 'green',
    dot: 'bg-green-80',
    ring: 'outline-green-80',
    chip: chip('bg-green-0', 'text-green-100', 'dark:bg-green-100-a20', 'dark:text-green-40'),
  },
  {
    id: 'teal',
    dot: 'bg-cyan-60',
    ring: 'outline-cyan-60',
    chip: chip('bg-cyan-20', 'text-cyan-100', 'dark:bg-cyan-100-a20', 'dark:text-cyan-40'),
  },
  {
    id: 'blue',
    dot: 'bg-brand-80',
    ring: 'outline-brand-80',
    chip: chip('bg-brand-0', 'text-brand-100', 'dark:bg-brand-100-a20', 'dark:text-brand-40'),
  },
  {
    id: 'indigo',
    dot: 'bg-brand-100',
    ring: 'outline-brand-100',
    chip: chip('bg-brand-10', 'text-brand-100', 'dark:bg-brand-100-a30', 'dark:text-brand-40'),
  },
  {
    id: 'purple',
    dot: 'bg-violet-60',
    ring: 'outline-violet-60',
    chip: chip('bg-violet-20', 'text-violet-100', 'dark:bg-violet-100-a20', 'dark:text-violet-40'),
  },
  {
    id: 'pink',
    dot: 'bg-pink-60',
    ring: 'outline-pink-60',
    chip: chip('bg-pink-20', 'text-pink-100', 'dark:bg-pink-100-a20', 'dark:text-pink-40'),
  },
  {
    id: 'brown',
    dot: 'bg-orange-100',
    ring: 'outline-orange-100',
    chip: chip('bg-orange-20', 'text-orange-100', 'dark:bg-orange-100-a20', 'dark:text-orange-40'),
  },
];

const styleById = new Map(TAG_COLOR_STYLES.map((style) => [style.id, style]));

export const getTagColor = (color?: string | null): TagColorStyle => {
  const value = color ?? '';
  const id = isTagColor(value) ? value : DEFAULT_TAG_COLOR;
  return styleById.get(id) ?? TAG_COLOR_STYLES[5];
};

export { TAG_COLORS, DEFAULT_TAG_COLOR, isTagColor };
export type { TagColor };
