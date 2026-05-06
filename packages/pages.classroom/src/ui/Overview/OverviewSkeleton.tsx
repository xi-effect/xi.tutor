type OverviewSkeletonPropsT = {
  numberOfSections: number;
};

export const OverviewSkeleton = ({ numberOfSections }: OverviewSkeletonPropsT) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="bg-gray-20 h-6 w-48 max-w-full animate-pulse rounded" />
          <div className="flex gap-1">
            <div className="bg-gray-20 h-8 w-8 animate-pulse rounded-lg" />
            <div className="bg-gray-20 h-8 w-10 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="h-[200px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
            <div className="flex flex-row gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="border-gray-20 flex min-h-[180px] min-w-[300px] flex-col gap-3 rounded-2xl border p-4"
                >
                  <div className="bg-gray-20 h-4 w-32 animate-pulse rounded" />
                  <div className="bg-gray-20 h-3 w-full animate-pulse rounded" />
                  <div className="bg-gray-20 mx-auto h-6 w-3/4 animate-pulse rounded" />
                  <div className="mt-auto flex gap-2">
                    <div className="bg-gray-20 h-8 flex-1 animate-pulse rounded-lg" />
                    <div className="bg-gray-20 h-8 flex-1 animate-pulse rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Скелетон материалов, оплаты и списка студентов */}
      {[...new Array(numberOfSections)].map((_, index) => (
        <div className="flex flex-col gap-4 p-4" key={index}>
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-row">
            <div className="h-[110px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
              <div className="flex flex-row gap-8">
                {[...new Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
