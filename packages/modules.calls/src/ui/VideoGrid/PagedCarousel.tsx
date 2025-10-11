import React, { useState } from 'react';
import { PaginationControls } from './PaginationControls';
import { useSize } from '../../hooks/useSize';

type Orientation = 'vertical' | 'horizontal';

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  orientation?: Orientation;
  /** соотношение сторон элементов (ширина/высота) */
  aspectRatio?: number;
  /** отступ между плитками, в px */
  gap?: number;
  /** минимальный размер элемента, в px */
  minItemSize?: number;
  /** максимальный размер элемента, в px */
  maxItemSize?: number;
  className?: string;
}

/**
 * Универсальная карусель с пагинацией
 * Динамически рассчитывает размеры элементов на основе контейнера
 * и соотношения сторон
 */
export function PagedCarousel<T>({
  items,
  renderItem,
  orientation = 'vertical',
  aspectRatio = 16 / 9, // по умолчанию 16:9
  gap = 8,
  minItemSize = 120,
  maxItemSize = 300,
  className,
}: CarouselProps<T>) {
  const [page, setPage] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef as React.RefObject<HTMLDivElement>);

  const isVertical = orientation === 'vertical';

  // Рассчитываем количество элементов на основе контейнера
  const pageSize = React.useMemo(() => {
    if (!containerSize.width || !containerSize.height) {
      return 4;
    }

    if (isVertical) {
      // Для вертикальной карусели: считаем по высоте
      const availableHeight = containerSize.height;
      const itemHeight = Math.max(minItemSize, Math.min(maxItemSize, availableHeight));
      const itemsPerPage = Math.floor(availableHeight / (itemHeight + gap));
      return Math.max(1, itemsPerPage);
    } else {
      // Для горизонтальной карусели: считаем по ширине
      const availableWidth = containerSize.width;
      const itemWidth = Math.max(
        minItemSize,
        Math.min(maxItemSize, containerSize.height * aspectRatio),
      );
      const itemsPerPage = Math.floor(availableWidth / (itemWidth + gap));
      return Math.max(1, itemsPerPage);
    }
  }, [containerSize, orientation, aspectRatio, gap, minItemSize, maxItemSize]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  // Общие классы контейнера
  const containerCls = [
    'relative flex overflow-hidden', // чтобы кнопки располагались поверх
    isVertical ? 'min-h-0 h-full flex-col' : 'h-36 w-full flex-row',
    className ?? '',
  ].join(' ');

  const canPrev = clampedPage > 0;
  const canNext = clampedPage < totalPages - 1;

  return (
    <div ref={containerRef} className={containerCls} style={{ gap }}>
      {pageItems.map((item, i) => (
        <div
          key={i}
          className="shrink-0 overflow-hidden"
          style={{
            aspectRatio: aspectRatio,
            minHeight: isVertical ? `${minItemSize}px` : undefined,
            maxHeight: isVertical ? `${maxItemSize}px` : undefined,
          }}
        >
          {renderItem(item, start + i)}
        </div>
      ))}

      <PaginationControls
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        orientation={orientation}
      />
    </div>
  );
}
