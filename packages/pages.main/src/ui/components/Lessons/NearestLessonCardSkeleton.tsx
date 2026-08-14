export const NearestLessonCardSkeleton = () => (
  <div className="bg-background-surface mr-5 flex w-[calc(100%-1.25rem)] flex-col gap-4 rounded-2xl border-2 border-transparent p-5">
    <div className="bg-background-subtle h-6 w-40 animate-pulse rounded" />
    <div className="flex flex-row items-start gap-4">
      <div className="flex shrink-0 flex-col gap-2">
        <div className="bg-background-subtle h-7 w-14 animate-pulse rounded" />
        <div className="bg-background-subtle h-5 w-10 animate-pulse rounded" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="bg-background-subtle h-3 w-20 animate-pulse rounded" />
        <div className="flex items-center gap-2">
          <div className="bg-background-subtle size-8 shrink-0 animate-pulse rounded-full" />
          <div className="bg-background-subtle h-4 w-32 animate-pulse rounded" />
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-3">
      <div className="bg-background-subtle h-[38px] w-full animate-pulse rounded-lg" />
      <div className="bg-background-subtle h-[38px] w-full animate-pulse rounded-lg" />
    </div>
    <div className="bg-background-subtle mx-auto h-5 w-28 animate-pulse rounded" />
  </div>
);
