export const Skeleton = () => {
  return (
    <div className="flex flex-row items-center pl-4">
      <div className="flex flex-col items-start gap-1">
        {/* UserProfile скелетон - точно как в реальном компоненте */}
        <div className="flex items-center gap-3">
          <div className="bg-background-canvas h-10 w-10 animate-pulse rounded-full" />
          <div className="bg-background-canvas h-5 w-40 animate-pulse rounded" />
        </div>
        {/* Предмет скелетон - точно как text-m-base */}
        <div className="bg-background-canvas h-5 w-32 animate-pulse rounded" />
      </div>
      <div className="ml-auto flex flex-row items-center gap-2">
        {/* Badge статуса скелетон - размер m */}
        <div className="bg-background-canvas h-6 w-20 animate-pulse rounded-full" />
        {/* Telegram badge скелетон - размер m */}
        <div className="bg-background-canvas h-6 w-24 animate-pulse rounded-full" />
      </div>
    </div>
  );
};
