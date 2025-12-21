import React from 'react';
import { FocusStage } from './FocusStage';
import { PagedCarousel } from './PagedCarousel';

interface VerticalFocusLayoutProps {
  focus: React.ReactNode; // сюда кладём видео фокусного участника
  thumbs: React.ReactNode[]; // превью участников
  className?: string;
}

/**
 * Вертикальный FocusLayout: фокусная сцена + вертикальная карусель справа
 * Подходит для высоких экранов и вертикальной ориентации
 */
export function VerticalFocusLayout({ focus, thumbs, className = '' }: VerticalFocusLayoutProps) {
  return (
    <div className={`flex h-full w-full flex-row gap-2 p-1 ${className}`}>
      {/* Сцена - занимает основное пространство */}
      <div className="flex min-w-0 flex-1 items-center">
        <FocusStage className="flex w-full items-center">{focus}</FocusStage>
      </div>

      {/* Вертикальная карусель справа */}
      <div className="w-80 min-w-0">
        <PagedCarousel
          items={thumbs}
          orientation="vertical"
          aspectRatio={16 / 9}
          minItemSize={120}
          maxItemSize={200}
          renderItem={(node) => (
            <div className="relative h-full w-full">
              <div className="absolute inset-0">{node}</div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
