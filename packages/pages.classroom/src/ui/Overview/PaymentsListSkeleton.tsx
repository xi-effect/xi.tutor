export const PaymentsListSkeleton = () => (
  <div className="bg-background-surface flex h-[156px] w-full flex-col justify-between rounded-2xl px-5 py-4 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
    <div className="bg-background-subtle h-7 w-20 animate-pulse rounded-lg" />
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <div className="bg-background-subtle size-8 shrink-0 animate-pulse rounded-full" />
        <div className="bg-background-subtle h-4 w-28 animate-pulse rounded" />
      </div>
      <div className="bg-background-subtle h-5 w-16 shrink-0 animate-pulse rounded" />
    </div>
    <div className="bg-background-subtle h-8 w-full animate-pulse rounded-lg" />
  </div>
);
