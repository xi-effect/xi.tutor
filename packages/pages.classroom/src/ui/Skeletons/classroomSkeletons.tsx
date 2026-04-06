import { Skeleton } from 'common.ui';
import { cn } from '@xipkg/utils';

const CARD_MIN = 'min-w-[350px] w-[350px] shrink-0';

type HorizontalRowProps = {
  children: React.ReactNode;
  className?: string;
};

export const ClassroomCardsRow = ({ children, className }: HorizontalRowProps) => (
  <div className={cn('flex flex-row gap-8', className)}>{children}</div>
);

export const MaterialCardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'border-gray-30 bg-gray-0 flex flex-col gap-2 rounded-2xl border p-4',
      CARD_MIN,
      className,
    )}
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

type PaymentCardSkeletonProps = {
  className?: string;
};

export const PaymentCardSkeleton = ({ className }: PaymentCardSkeletonProps) => (
  <div
    className={cn(
      'border-gray-30 flex min-h-[130px] flex-col gap-4 rounded-2xl border p-4',
      CARD_MIN,
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

export const StudentCardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'border-gray-60 flex min-h-30 flex-col rounded-2xl border p-4',
      CARD_MIN,
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
