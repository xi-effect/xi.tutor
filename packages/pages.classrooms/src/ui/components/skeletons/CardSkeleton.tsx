import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="border-gray-30 bg-gray-0 flex justify-between rounded-2xl border p-4">
      <div className="flex max-w-[350px] flex-col gap-4">
        {/* Скелетон для UserProfile */}
        <div className="flex items-center gap-3">
          {/* Скелетон для аватара */}
          <div className="bg-gray-20 h-12 w-12 animate-pulse rounded-3xl" />

          {/* Скелетон для имени */}
          <div className="flex flex-col gap-1">
            <div className="bg-gray-20 h-4 w-32 animate-pulse rounded" />
            <div className="bg-gray-20 h-3 w-24 animate-pulse rounded" />
          </div>
        </div>

        {/* Скелетон для бейджей */}
        <div className="mt-auto flex items-center gap-2">
          {/* Скелетон для StatusBadge */}
          <div className="bg-gray-20 h-6 w-16 animate-pulse rounded-full" />

          {/* Скелетон для Badge */}
          <div className="bg-gray-20 h-6 w-20 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Скелетон для кнопки меню */}
      <div className="flex h-6 w-6 items-center justify-center">
        <div className="bg-gray-20 h-4 w-4 animate-pulse rounded" />
      </div>
    </div>
  );
};
