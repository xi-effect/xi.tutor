export const UpcomingLessonCardSkeleton = () => (
  <div className="border-gray-10 flex w-full max-w-[400px] min-w-[300px] animate-pulse flex-col gap-2 rounded-2xl border bg-white p-5 sm:min-w-[320px]">
    <div className="bg-gray-10 h-3 w-24 rounded" />
    <div className="mt-2 flex w-full items-center gap-2">
      <div className="bg-gray-10 h-4 w-16 rounded" />
      <div className="bg-gray-10 h-px flex-1" />
      <div className="bg-gray-10 h-4 w-16 rounded" />
    </div>
    <div className="mt-2 flex flex-col gap-1">
      <div className="bg-gray-10 h-4 w-full rounded" />
      <div className="bg-gray-10 h-4 w-3/4 rounded" />
    </div>
    <div className="mt-auto pt-2">
      <div className="bg-gray-10 h-8 w-full rounded-lg" />
    </div>
  </div>
);
