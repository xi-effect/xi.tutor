import React from 'react';

interface FocusStageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Фокусная сцена - контейнер для основного видео
 * Занимает всё доступное пространство, видео не растягивается
 */
export function FocusStage({ children, className = '' }: FocusStageProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className={`relative h-full overflow-hidden rounded-2xl ${className}`}>
        <div className="relative h-full w-full">{children}</div>
      </div>
    </div>
  );
}
