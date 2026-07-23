export const UpcomingLessonCardSkeleton = () => (
  <div className="border-border-default bg-background-surface flex min-h-[220px] w-full max-w-[400px] min-w-[300px] animate-pulse flex-col gap-2 rounded-2xl border p-5 sm:min-w-[320px]">
    <div className="bg-background-subtle h-3 w-24 rounded" />
    <div className="mt-2 flex w-full items-center gap-2">
      <div className="bg-background-subtle h-4 w-16 rounded" />
      <div className="bg-background-subtle h-px flex-1" />
      <div className="bg-background-subtle h-4 w-16 rounded" />
    </div>
    <div className="mt-2 flex flex-col gap-1">
      <div className="bg-background-subtle h-4 w-full rounded" />
      <div className="bg-background-subtle h-4 w-3/4 rounded" />
    </div>
    <div className="mt-auto pt-2">
      <div className="bg-background-subtle h-8 w-full rounded-lg" />
    </div>
  </div>
);
