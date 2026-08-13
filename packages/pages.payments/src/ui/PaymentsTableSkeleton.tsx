export const PaymentsTableSkeleton = () => (
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
