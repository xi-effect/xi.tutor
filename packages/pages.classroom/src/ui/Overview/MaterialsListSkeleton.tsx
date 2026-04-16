import { Skeleton } from 'common.ui';
import { cn } from '@xipkg/utils';

type MaterialsListSkeletonPropsT = {
  className?: string;
};

export const MaterialsListSkeleton = ({ className }: MaterialsListSkeletonPropsT) => (
  <div
    className={cn('border-gray-30 bg-gray-0 flex flex-col gap-2 rounded-2xl border p-4', className)}
  >
    <div className="flex flex-row items-center justify-between">
      <Skeleton variant="rectangular" className="h-7 min-h-7 w-40 max-w-40 shrink-0 rounded-full" />
      <Skeleton variant="rectangular" className="h-6 min-h-6 w-3 max-w-3 shrink-0 rounded-lg" />
    </div>
    <div className="flex flex-row items-center gap-2">
      <Skeleton variant="rectangular" className="h-6 min-h-6 w-6 max-w-6 shrink-0 rounded-lg" />
      <Skeleton variant="text" className="h-7 min-h-7 max-w-40" />
    </div>
    <Skeleton variant="text" className="mt-4 h-4 min-h-4 w-36 max-w-36" />
  </div>
);
