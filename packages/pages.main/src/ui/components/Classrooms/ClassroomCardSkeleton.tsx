export const ClassroomCardSkeleton = () => (
  <div className="bg-background-surface flex h-48 w-full flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
    <div className="flex items-center gap-2">
      <div className="bg-background-subtle h-7 w-20 animate-pulse rounded-lg" />
      <div className="bg-background-subtle h-7 w-24 animate-pulse rounded-lg" />
    </div>
    <div className="flex items-center gap-2">
      <div className="bg-background-subtle size-12 shrink-0 animate-pulse rounded-full" />
      <div className="bg-background-subtle h-5 w-32 animate-pulse rounded" />
    </div>
    <div className="bg-background-subtle h-8 w-full animate-pulse rounded-lg" />
  </div>
);
