export const Skeleton = () => {
  return (
    <div className="flex w-full shrink-0 flex-col gap-4 px-5 pt-5 sm:px-8 sm:pt-8 md:px-10 md:pt-10">
      <div className="flex min-w-0 flex-row items-center gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
          <div className="bg-background-subtle size-12 shrink-0 animate-pulse rounded-full" />
          <div className="bg-background-subtle h-8 w-48 animate-pulse rounded-lg sm:h-9 sm:w-72" />
          <div className="bg-background-subtle h-7 w-20 shrink-0 animate-pulse rounded-lg" />
          <div className="bg-background-subtle h-7 w-24 shrink-0 animate-pulse rounded-lg" />
        </div>
        <div className="bg-background-subtle hidden h-12 w-40 shrink-0 animate-pulse rounded-[10px] sm:block" />
      </div>
    </div>
  );
};
