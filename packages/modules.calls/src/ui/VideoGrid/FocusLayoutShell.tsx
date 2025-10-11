import React from 'react';
import { FocusStage } from './FocusStage';
import { PagedCarousel } from './PagedCarousel';

interface FocusLayoutShellProps {
  focus: React.ReactNode; // сюда кладём видео фокусного участника
  thumbs: React.ReactNode[]; // превью участников
  className?: string;
}

/**
 * Композиция FocusLayout: фокусная сцена + карусель превью
 * На десктопе: справа вертикальная карусель
 * На мобильном: снизу горизонтальная карусель
 */
export function FocusLayoutShell({ focus, thumbs, className = '' }: FocusLayoutShellProps) {
  return (
    <div
      className={`grid h-full w-full grid-rows-[1fr_auto] gap-2 p-2 lg:grid-cols-12 lg:grid-rows-1 ${className}`}
    >
      {/* Сцена */}
      <div className="min-h-0 w-full lg:col-span-9">
        <FocusStage label="Focus">{focus}</FocusStage>
      </div>

      {/* Сайдбар (вертикальная карусель на десктопе) */}
      <div className="hidden min-h-0 w-full lg:col-span-3 lg:block">
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

      {/* Нижняя горизонтальная карусель на мобиле */}
      <div className="min-h-0 w-full lg:hidden">
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
    </div>
  );
}
