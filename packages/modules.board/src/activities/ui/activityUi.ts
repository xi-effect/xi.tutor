import type { CSSProperties } from 'react';
import type { ItemStatus } from '../model/types';
import { getBoardColorOption } from '../../utils/boardColors';

export const activityCardClass =
  'border-border-default bg-background-surface text-text-primary box-border rounded-xl border-2 px-3 py-2 text-sm font-medium whitespace-normal shadow-sm';

export const activityDropZoneClass =
  'border-brand-80 bg-status-info-background text-brand-80 flex min-h-12 min-w-20 items-center justify-center rounded-xl border-2 border-dashed px-3 py-2 text-sm font-medium';

export const activityStatusBorderClass: Record<ItemStatus, string> = {
  idle: '',
  correct: 'border-green-600',
  wrong: 'border-red-600',
};

export const activityControlClass = 'outline-none focus-visible:ring-0 focus-visible:ring-offset-0';

export const activitySelectedClass =
  'border-brand-80 bg-action-primary-background-disabled text-text-link hover:bg-action-primary-background-disabled focus:bg-action-primary-background-disabled focus-visible:bg-action-primary-background-disabled active:bg-action-primary-background-disabled';

export function activityCardTintStyle(color?: string): CSSProperties | undefined {
  if (!color) return undefined;
  const option = getBoardColorOption(color);
  if (!option) return undefined;
  return {
    backgroundColor: option.semiCssVar,
    borderColor: option.cssVar,
  };
}
