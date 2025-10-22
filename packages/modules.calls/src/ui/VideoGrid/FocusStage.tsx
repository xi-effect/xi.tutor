import React from 'react';

interface FocusStageProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * Фокусная сцена - контейнер для основного видео
 * Занимает всё доступное пространство, видео не растягивается
 */
export function FocusStage({ children, label, className = '' }: FocusStageProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl bg-black ${className}`}>
      <div className="absolute inset-0">{children}</div>
      {label && (
        <div className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
          {label}
        </div>
      )}
    </div>
  );
}
