import { DEFAULT_TAG_COLOR, isTagColor, TAG_COLORS, type TagColor } from 'common.services';

export type TagColorStyle = {
  id: TagColor;
  dot: string;
  ring: string;
  chip: string;
};

export const TAG_COLOR_STYLES: TagColorStyle[] = [
  {
    id: 'red',
    dot: 'bg-red-80',
    ring: 'outline-red-100',
    chip: 'bg-red-0 text-red-100',
  },
  {
    id: 'orange',
    dot: 'bg-orange-80',
    ring: 'outline-orange-100',
    chip: 'bg-tag-orange-background text-tag-orange-accent',
  },
  {
    id: 'yellow',
    dot: 'bg-yellow-80',
    ring: 'outline-yellow-100',
    chip: 'bg-yellow-20 text-yellow-100',
  },
  {
    id: 'green',
    dot: 'bg-green-80',
    ring: 'outline-green-80',
    chip: 'bg-green-0 text-green-80',
  },
  {
    id: 'teal',
    dot: 'bg-cyan-60',
    ring: 'outline-cyan-100',
    chip: 'bg-tag-cyan-background text-tag-cyan-accent',
  },
  {
    id: 'blue',
    dot: 'bg-brand-80',
    ring: 'outline-brand-100',
    chip: 'bg-brand-10 text-brand-100',
  },
  {
    id: 'indigo',
    dot: 'bg-brand-100',
    ring: 'outline-brand-100',
    chip: 'bg-brand-0 text-brand-100',
  },
  {
    id: 'purple',
    dot: 'bg-violet-60',
    ring: 'outline-violet-100',
    chip: 'bg-tag-violet-background text-tag-violet-accent',
  },
  {
    id: 'pink',
    dot: 'bg-pink-60',
    ring: 'outline-pink-100',
    chip: 'bg-tag-pink-background text-tag-pink-accent',
  },
  {
    id: 'brown',
    dot: 'bg-orange-100',
    ring: 'outline-orange-100',
    chip: 'bg-orange-0 text-orange-100',
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
