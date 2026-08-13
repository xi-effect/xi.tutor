type OverviewSkeletonPropsT = {
  numberOfSections: number;
};

export const OverviewSkeleton = ({ numberOfSections }: OverviewSkeletonPropsT) => {
  return (
    <div className="flex flex-col gap-8 pt-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-2 px-2">
          <div className="bg-background-subtle h-8 w-56 max-w-full animate-pulse rounded-lg sm:h-9" />
          <div className="bg-background-subtle size-10 animate-pulse rounded-[10px]" />
        </div>
        <div className="flex flex-row gap-4 px-2 pb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-background-surface flex min-h-[220px] min-w-[300px] flex-col gap-3 rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]"
            >
              <div className="bg-background-subtle h-4 w-32 animate-pulse rounded" />
              <div className="bg-background-subtle h-4 w-full animate-pulse rounded" />
              <div className="bg-background-subtle h-8 w-3/4 animate-pulse rounded" />
              <div className="bg-background-subtle mt-auto h-8 w-full animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {[...new Array(numberOfSections)].map((_, index) => (
        <div className="flex flex-col gap-4" key={index}>
          <div className="flex flex-row items-center justify-start gap-2 px-2">
            <div className="bg-background-subtle h-8 w-32 animate-pulse rounded-lg sm:h-9" />
            <div className="bg-background-subtle size-8 animate-pulse rounded-lg" />
          </div>
          <div className="flex flex-row gap-4 px-2 pb-4">
            {[...new Array(3)].map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="bg-background-surface flex h-40 min-w-[260px] flex-col gap-2 rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)]"
              >
                <div className="bg-background-subtle h-5 w-32 animate-pulse rounded" />
                <div className="bg-background-subtle h-4 w-24 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
