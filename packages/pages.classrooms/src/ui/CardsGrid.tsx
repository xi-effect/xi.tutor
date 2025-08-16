import { useRef } from 'react';
import { useInfiniteQuery, useResponsiveGrid, useVirtualGrid } from '../hooks';
import { Card } from './Card';
import { CardsGridSkeleton } from './CardsGridSkeleton';

export const CardsGrid = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Используем бесконечный запрос
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery(parentRef);

  // Настройки адаптивной сетки
  const { colCount, rowHeight, GAP } = useResponsiveGrid(parentRef);

  // Виртуализация
  const rowVirtualizer = useVirtualGrid(parentRef, items, colCount, rowHeight);

  if (isLoading) {
    return <CardsGridSkeleton count={12} />;
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Ошибка загрузки кабинетов</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-204px)] w-full overflow-auto pr-4"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const startIndex = virtualRow.index * colCount;
        const rowItems = items.slice(startIndex, startIndex + colCount);

        return (
          <div
            key={virtualRow.index}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                gap: `${GAP}px`,
              }}
            >
              {rowItems.map((classroom) => (
                <div key={classroom.id} className="classroom-card">
                  <Card {...classroom} />
                </div>
              ))}

              {/* Заполняем пустые ячейки в последней строке */}
              {Array.from({ length: colCount - rowItems.length }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Индикатор загрузки следующей страницы */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-300"></div>
        </div>
      )}

      {/* Сообщение о конце списка */}
      {!hasNextPage && items.length > 0 && (
        <div className="py-4 text-center text-gray-500">Все кабинеты загружены</div>
      )}
    </div>
  );
};
