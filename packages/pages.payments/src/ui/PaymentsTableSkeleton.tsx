export const PaymentsTableSkeleton = ({ isMobile = false }: { isMobile?: boolean }) => {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-5 py-1 pr-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-background-surface flex min-h-35 flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]"
          >
            <div className="bg-background-subtle h-4 w-28 animate-pulse rounded" />
            <div className="flex items-center gap-2">
              <div className="bg-background-subtle size-8 shrink-0 animate-pulse rounded-full" />
              <div className="bg-background-subtle h-4 w-24 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-background-subtle h-5 w-14 animate-pulse rounded" />
              <div className="bg-background-subtle h-6 w-24 animate-pulse rounded-lg" />
            </div>
            <div className="bg-background-subtle ml-auto h-8 w-28 animate-pulse rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-30 flex-col rounded-2xl p-4">
      <div className="flex w-full flex-row gap-8 pr-2">
        <div className="bg-background-subtle h-6 w-14 animate-pulse rounded-lg" />
        <div className="bg-background-subtle h-6 w-20 animate-pulse rounded-lg" />
        <div className="bg-background-subtle h-6 w-24 animate-pulse rounded-lg" />
        <div className="bg-background-subtle h-6 w-20 animate-pulse rounded-lg" />
        <div className="bg-background-subtle h-6 w-16 animate-pulse rounded-lg" />
      </div>
      <div className="mt-10 flex w-full flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-background-subtle h-12 w-full animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
};
