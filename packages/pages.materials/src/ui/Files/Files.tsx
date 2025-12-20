import { useRef } from 'react';
import { Card } from './Card';
import { useResponsiveGrid, useInfiniteQuery, useVirtualGrid } from '../../hooks';
import { NotFoundItems } from '../NotFoundItems';
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
        <NotFoundItems text="Здесь пока нет файлов" />
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
