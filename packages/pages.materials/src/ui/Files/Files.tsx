import { useRef } from 'react';
import { Card } from './Card';
import { useResponsiveGrid, useInfiniteQuery, useVirtualGrid } from '../../hooks';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { GridList } from '../GridList';

export const Files = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { colCount, rowHeight, GAP } = useResponsiveGrid(parentRef, true);
  const { items, isLoading, isError } = useInfiniteQuery(parentRef, 'note');
  const rowVirtualizer = useVirtualGrid(parentRef, items, colCount, rowHeight);

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef} className="h-[calc(100vh-158px)] overflow-auto">
      {notFoundItems ? (
        <MaterialsTabEmptyState
          title="Пока нет файлов"
          description="Загруженные файлы появятся в этом списке."
        />
      ) : (
        <GridList
          rowVirtualizer={rowVirtualizer}
          colCount={colCount}
          gap={GAP}
          items={items}
          renderItem={(material) => (
            <div key={material.id} className="card-item">
              <Card {...material} />
            </div>
          )}
        />
      )}
    </div>
  );
};
