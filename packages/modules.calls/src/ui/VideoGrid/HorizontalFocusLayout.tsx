import React from 'react';
import { FocusStage } from './FocusStage';
import { PagedCarousel } from './PagedCarousel';

interface HorizontalFocusLayoutProps {
  focus: React.ReactNode; // сюда кладём видео фокусного участника
  thumbs: React.ReactNode[]; // превью участников
  className?: string;
}

/**
 * Горизонтальный FocusLayout: фокусная сцена + горизонтальная карусель вверху
 * Подходит для широких экранов и горизонтальной ориентации
 */
export function HorizontalFocusLayout({
  focus,
  thumbs,
  className = '',
}: HorizontalFocusLayoutProps) {
  return (
    <div className={`flex h-full w-full flex-col gap-2 p-1 ${className}`}>
      {/* Горизонтальная карусель вверху */}
      <div className="h-auto min-h-36 w-full">
        <PagedCarousel
          items={thumbs}
          orientation="horizontal"
          aspectRatio={16 / 9}
          minItemSize={150}
          maxItemSize={250}
          renderItem={(node) => (
            <div className="relative aspect-video w-full">
              <div className="absolute inset-0">{node}</div>
            </div>
          )}
        />
      </div>

      {/* Сцена - занимает основное пространство */}
      <div className="h-full min-h-0 flex-1">
        <FocusStage className="h-full w-full">{focus}</FocusStage>
      </div>
    </div>
  );
}
