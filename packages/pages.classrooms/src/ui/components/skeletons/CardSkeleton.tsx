import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-background-surface flex h-40 justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
      <div className="flex max-w-[350px] flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-action-secondary-background-pressed h-6 w-16 animate-pulse rounded-lg" />
          <div className="bg-action-secondary-background-pressed h-6 w-20 animate-pulse rounded-lg" />
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-action-secondary-background-pressed h-12 w-12 animate-pulse rounded-3xl" />
          <div className="bg-action-secondary-background-pressed h-4 w-32 animate-pulse rounded" />
        </div>
      </div>

      <div className="flex h-6 w-6 items-center justify-center">
        <div className="bg-action-secondary-background-pressed h-4 w-4 animate-pulse rounded" />
      </div>
    </div>
  );
};
