export const MaterialsListSkeleton = () => (
  <div className="bg-background-surface flex h-44 w-full flex-col rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]">
    <div className="flex w-full items-center gap-2">
      <div className="bg-background-subtle size-10 shrink-0 animate-pulse rounded-[10px]" />
      <div className="bg-background-subtle h-7 w-24 animate-pulse rounded-lg" />
      <div className="bg-background-subtle ml-auto size-8 shrink-0 animate-pulse rounded-lg" />
    </div>
    <div className="mt-4 flex w-full flex-col gap-1">
      <div className="bg-background-subtle h-5 w-full animate-pulse rounded" />
      <div className="bg-background-subtle h-5 w-3/4 animate-pulse rounded" />
    </div>
    <div className="mt-auto flex w-full flex-col gap-1 pt-3">
      <div className="bg-background-subtle h-4 w-32 animate-pulse rounded" />
      <div className="bg-background-subtle h-4 w-40 animate-pulse rounded" />
    </div>
  </div>
);
