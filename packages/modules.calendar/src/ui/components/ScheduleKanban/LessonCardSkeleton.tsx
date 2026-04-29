import { memo } from 'react';
import { cn } from '@xipkg/utils';
import { CARD_MIN_WIDTH, CARD_MAX_WIDTH } from '../../../hooks/useKanbanColumns';

interface LessonCardSkeletonProps {
  /** День колонки — сегодня (рамка brand, как у LessonCard) */
  isToday?: boolean;
  /** На всю ширину контейнера (мобильный список) */
  fullWidth?: boolean;
}

export const LessonCardSkeleton = memo<LessonCardSkeletonProps>(({ isToday, fullWidth }) => {
  const barThin = 'bg-gray-20 dark:bg-gray-30 animate-pulse rounded-lg';
  const barBlock = 'bg-gray-20 dark:bg-gray-30 animate-pulse rounded-xl';

  return (
    <div
      className={cn(
        'relative flex min-h-[188px] w-full flex-col rounded-2xl border p-6',
        isToday ? 'border-brand-80 bg-white' : 'border-gray-10 bg-white',
      )}
      style={fullWidth ? { width: '100%' } : { minWidth: CARD_MIN_WIDTH, maxWidth: CARD_MAX_WIDTH }}
      aria-hidden
    >
      <div className="flex flex-col gap-3">
        <div className={cn(barThin, 'h-4 w-[40%] shrink-0')} />
        <div className={cn(barThin, 'h-4 w-full shrink-0')} />
        <div className={cn(barBlock, 'h-14 w-full shrink-0')} />
        <div className="flex w-full flex-col gap-2 pt-1">
          <div className={cn(barThin, 'h-4 w-full shrink-0')} />
          <div className={cn(barThin, 'h-4 w-full shrink-0')} />
        </div>
      </div>
    </div>
  );
});

LessonCardSkeleton.displayName = 'LessonCardSkeleton';
