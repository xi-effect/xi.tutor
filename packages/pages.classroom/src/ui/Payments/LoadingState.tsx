import { Skeleton } from 'common.ui';

// skeleton that copies payments table layout
export const LoadingState = () => {
  return (
    <div className={'flex min-h-30 flex-col rounded-2xl p-4'}>
      <div className="flex w-full flex-row gap-30 pr-2">
        <Skeleton variant="rectangular" className="h-6 min-h-6 w-14 max-w-14 rounded-lg" />
        <Skeleton variant="rectangular" className="h-6 min-h-6 w-20 max-w-20 rounded-lg" />
        <Skeleton variant="rectangular" className="h-6 min-h-6 w-15 max-w-35 rounded-lg" />
        <Skeleton variant="rectangular" className="h-6 min-h-6 w-20 max-w-20 rounded-lg" />
        <Skeleton variant="rectangular" className="h-6 min-h-6 w-18 max-w-18 rounded-lg" />
      </div>
      <div className="mt-10 flex w-full flex-col items-center gap-4">
        <Skeleton variant="rectangular" className="h-12 min-h-12 w-full max-w-full" />
        <Skeleton variant="rectangular" className="h-12 min-h-12 w-full max-w-full" />
        <Skeleton variant="rectangular" className="h-12 min-h-12 w-full max-w-full" />
        <Skeleton variant="rectangular" className="h-12 min-h-12 w-full max-w-full" />
        <Skeleton variant="rectangular" className="h-12 min-h-12 w-full max-w-full" />
        <Skeleton variant="rectangular" className="h-12 min-h-12 w-full max-w-full" />
      </div>
    </div>
  );
};
