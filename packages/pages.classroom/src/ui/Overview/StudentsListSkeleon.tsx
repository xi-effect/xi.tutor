import { Skeleton } from 'common.ui';
import { cn } from '@xipkg/utils';

type StudentsListSkeletonPropsT = {
  className?: string;
};

// skeleton that copies student card
export const StudentsListSkeleton = ({ className }: StudentsListSkeletonPropsT) => (
  <div
    className={cn(
      'bg-background-surface flex min-h-[120px] flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]',
      className,
    )}
  >
    <div className="flex w-full flex-row justify-end pr-2">
      <Skeleton variant="rectangular" className="h-6 min-h-6 w-3 max-w-3 shrink-0 rounded-lg" />
    </div>
    <div className="flex w-full flex-row items-center gap-2">
      <Skeleton
        variant="rectangular"
        className="h-12 min-h-12 w-12 max-w-12 shrink-0 rounded-full"
      />
      <Skeleton variant="text" className="h-5 min-h-5 max-w-40" />
    </div>
  </div>
);
