export const Skeleton = () => {
  return (
    <div className="flex flex-row items-center pl-4">
      <div className="flex flex-col items-start gap-1">
        {/* UserProfile скелетон - точно как в реальном компоненте */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        {/* Предмет скелетон - точно как text-m-base */}
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="ml-auto flex flex-row items-center gap-2">
        {/* Badge статуса скелетон - размер m */}
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
        {/* Telegram badge скелетон - размер m */}
        <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
};
