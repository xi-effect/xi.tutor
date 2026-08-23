import type { CSSProperties } from 'react';
import type { ItemStatus } from '../model/types';
import { getBoardColorOption } from '../../utils/boardColors';

export const activityCardClass =
  'border-border-default bg-background-page text-text-primary box-border rounded-lg border px-2 py-1.5 text-sm whitespace-normal';

export const activityStatusBorderClass: Record<ItemStatus, string> = {
  idle: '',
  correct: 'border-green-600',
  wrong: 'border-red-600',
};

export const activitySelectedClass = 'border-brand-80';

export function activityCardTintStyle(color?: string): CSSProperties | undefined {
  if (!color) return undefined;
  const option = getBoardColorOption(color);
  if (!option) return undefined;
  return {
    backgroundColor: option.semiCssVar,
    borderColor: option.cssVar,
  };
}
