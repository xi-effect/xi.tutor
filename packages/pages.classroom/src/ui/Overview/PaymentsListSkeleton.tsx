import { Skeleton } from 'common.ui';
import { cn } from '@xipkg/utils';

type PaymentsListSkeletonPropsT = {
  className?: string;
};

// skeleton that copies payment card
export const PaymentsListSkeleton = ({ className }: PaymentsListSkeletonPropsT) => (
  <div
    className={cn(
      'border-gray-30 flex min-h-[130px] flex-col gap-4 rounded-2xl border p-4',
      className,
    )}
  >
    <div className="flex flex-row items-start justify-between">
      <Skeleton variant="rectangular" className="h-7 min-h-7 w-20 max-w-20 shrink-0 rounded-sm" />
      <Skeleton variant="rectangular" className="h-6 min-h-6 w-6 max-w-6 rounded-full" />
    </div>
    <div className="flex flex-row items-center gap-2">
      <Skeleton variant="rectangular" className="h-8 min-h-8 w-8 max-w-8 shrink-0 rounded-full" />
      <Skeleton variant="text" className="h-4 min-h-4 max-w-28" />
    </div>
    <div className="flex flex-row items-end">
      <div className="flex h-full w-full flex-col gap-1">
        <Skeleton variant="text" className="h-4 min-h-4 w-28 max-w-28" />
        <Skeleton variant="text" className="h-9 min-h-9 w-10 max-w-10" />
      </div>
      <Skeleton variant="rectangular" className="h-8 min-h-8 w-30 max-w-30 shrink-0 rounded-sm" />
    </div>
  </div>
);
