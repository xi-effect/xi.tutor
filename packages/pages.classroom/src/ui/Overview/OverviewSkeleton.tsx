type OverviewSkeletonPropsT = {
  numberOfSections: number;
};

export const OverviewSkeleton = ({ numberOfSections }: OverviewSkeletonPropsT) => {
  return (
    <div className="flex flex-col">
      {/* Занятия секция */}
      {/* <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-row">
            <div className="h-[186px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]">
              <div className="flex flex-row gap-8">
                {[...new Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="flex min-h-[172px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="flex flex-row items-center justify-start gap-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="mt-auto h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}

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
