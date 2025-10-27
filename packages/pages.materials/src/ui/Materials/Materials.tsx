import { useRef } from 'react';
import { Card } from './Card';
import { useResponsiveGrid, useInfiniteQuery, useVirtualGrid } from '../../hooks';
import { NotFoundItems } from '../NotFoundItems';
import { GridList } from '../GridList';

export const Materials = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { colCount, rowHeight, GAP } = useResponsiveGrid(parentRef);
  const { items, isError, isLoading } = useInfiniteQuery(parentRef, 'board');
  const rowVirtualizer = useVirtualGrid(parentRef, items, colCount, rowHeight);

  console.log('items', items);

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef} className="h-[calc(100vh-158px)] overflow-auto">
      {notFoundItems ? (
        <NotFoundItems text="Здесь пока нет досок" />
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
