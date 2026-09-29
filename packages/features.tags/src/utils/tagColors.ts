import { DEFAULT_TAG_COLOR, isTagColor, type TagColor } from 'common.api';
import { getTagColor, TAG_COLOR_STYLES, TAG_COLORS } from 'common.ui';

const LEGACY_TAG_COLOR: Record<string, TagColor> = {
  cyan: 'teal',
  violet: 'purple',
  lilac: 'purple',
  peach: 'yellow',
  magenta: 'pink',
};

export const LIBRARY_TAG_COLORS = TAG_COLOR_STYLES;
export type LibraryTagColorId = TagColor;

export { TAG_COLORS, DEFAULT_TAG_COLOR, getTagColor };

export const isLibraryTagColorId = (value: string): value is TagColor =>
  isTagColor(value) || value in LEGACY_TAG_COLOR;

export const normalizeLibraryTagColor = (value?: string | null): TagColor => {
  if (!value) {
    return DEFAULT_TAG_COLOR;
  }
  if (isTagColor(value)) {
    return value;
  }
  return LEGACY_TAG_COLOR[value] ?? DEFAULT_TAG_COLOR;
};

export const MAX_TAG_NAME_LENGTH = 100;
