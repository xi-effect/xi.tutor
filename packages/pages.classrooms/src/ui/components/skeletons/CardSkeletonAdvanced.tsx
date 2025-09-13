import React from 'react';

export const CardSkeletonAdvanced: React.FC = () => {
  return (
    <div className="border-gray-30 bg-gray-0 flex justify-between rounded-2xl border p-4">
      <div className="flex max-w-[350px] flex-col gap-4">
        {/* Скелетон для UserProfile */}
        <div className="flex items-center gap-3">
          {/* Скелетон для аватара с градиентом */}
          <div className="bg-gray-20 relative h-12 w-12 overflow-hidden rounded-3xl">
            <div className="via-gray-10 animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent to-transparent" />
          </div>

          {/* Скелетон для имени с разной шириной строк */}
          <div className="flex flex-col gap-1">
            <div className="bg-gray-20 h-4 w-28 animate-pulse rounded" />
            <div className="bg-gray-20 h-3 w-20 animate-pulse rounded" />
          </div>
        </div>

        {/* Скелетон для бейджей */}
        <div className="mt-auto flex items-center gap-2">
          {/* Скелетон для StatusBadge с разной шириной */}
          <div className="bg-gray-20 h-6 w-20 animate-pulse rounded-full" />

          {/* Скелетон для Badge */}
          <div className="bg-gray-20 h-6 w-16 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Скелетон для кнопки меню */}
      <div className="flex h-6 w-6 items-center justify-center">
        <div className="bg-gray-20 h-4 w-4 animate-pulse rounded" />
      </div>
    </div>
  );
};

// Добавляем CSS для анимации shimmer
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}
