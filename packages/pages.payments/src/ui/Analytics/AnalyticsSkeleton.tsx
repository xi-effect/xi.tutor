export const AnalyticsSkeleton = () => (
  <div className="flex w-full flex-col gap-5 pr-5">
    <div className="bg-background-subtle h-10 w-full max-w-md animate-pulse rounded-[10px]" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-background-surface flex min-h-[120px] flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]"
        >
          <div className="bg-background-subtle h-4 w-24 animate-pulse rounded" />
          <div className="bg-background-subtle h-7 w-32 animate-pulse rounded" />
        </div>
      ))}
    </div>
    <div className="bg-background-surface h-16 animate-pulse rounded-2xl" />
    <div className="bg-background-surface h-[320px] animate-pulse rounded-2xl" />
    <div className="bg-background-surface h-[280px] animate-pulse rounded-2xl" />
  </div>
);
