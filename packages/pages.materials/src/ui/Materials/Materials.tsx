import { useRef } from 'react';
import { useResponsiveGrid, useInfiniteQuery, useVirtualGrid } from '../../hooks';
import { NotFoundItems } from '../NotFoundItems';
import { GridList } from '../GridList';
import { useMaterialsDuplicate } from '../../provider';
import { MaterialsCard } from 'features.materials.card';

export const Materials = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { colCount, rowHeight, GAP } = useResponsiveGrid(parentRef);
  const { items, isError, isLoading } = useInfiniteQuery(parentRef, 'board');
  const rowVirtualizer = useVirtualGrid(parentRef, items, colCount, rowHeight);
  const { openModal } = useMaterialsDuplicate();

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
              <MaterialsCard {...material} onOpenModal={openModal} />
            </div>
          )}
        />
      )}
    </div>
  );
};
