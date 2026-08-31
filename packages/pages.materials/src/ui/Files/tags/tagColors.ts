export const MAX_TAG_NAME_LENGTH = 100;

export const LIBRARY_TAG_COLORS = [
  {
    id: 'cyan',
    dot: 'bg-cyan-60',
    ring: 'outline-cyan-100',
    chip: 'bg-tag-cyan-background text-tag-cyan-accent',
  },
  {
    id: 'violet',
    dot: 'bg-violet-60',
    ring: 'outline-violet-100',
    chip: 'bg-tag-violet-background text-tag-violet-accent',
  },
  {
    id: 'lilac',
    dot: 'bg-violet-40',
    ring: 'outline-violet-60',
    chip: 'bg-violet-20 text-violet-100',
  },
  {
    id: 'orange',
    dot: 'bg-orange-80',
    ring: 'outline-orange-100',
    chip: 'bg-tag-orange-background text-tag-orange-accent',
  },
  {
    id: 'peach',
    dot: 'bg-orange-40',
    ring: 'outline-orange-80',
    chip: 'bg-orange-0 text-orange-100',
  },
  {
    id: 'magenta',
    dot: 'bg-pink-60',
    ring: 'outline-pink-100',
    chip: 'bg-tag-pink-background text-tag-pink-accent',
  },
  {
    id: 'pink',
    dot: 'bg-pink-40',
    ring: 'outline-pink-60',
    chip: 'bg-pink-20 text-pink-100',
  },
  {
    id: 'indigo',
    dot: 'bg-brand-80',
    ring: 'outline-brand-100',
    chip: 'bg-brand-10 text-brand-100',
  },
] as const;

export type LibraryTagColorId = (typeof LIBRARY_TAG_COLORS)[number]['id'];

export const DEFAULT_TAG_COLOR: LibraryTagColorId = LIBRARY_TAG_COLORS[0].id;

const colorById = new Map(LIBRARY_TAG_COLORS.map((color) => [color.id, color]));

export const isLibraryTagColorId = (value: string): value is LibraryTagColorId =>
  colorById.has(value as LibraryTagColorId);

export const getTagColor = (id: string) =>
  colorById.get(id as LibraryTagColorId) ?? LIBRARY_TAG_COLORS[0];
