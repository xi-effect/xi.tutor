import { useRef } from 'react';
import { useResponsiveGrid, useInfiniteQuery, useVirtualGrid } from '../../hooks';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { GridList } from '../GridList';
import { MaterialsCard } from 'features.materials.card';
import { useMaterialsDuplicate } from '../../provider';

export const Notes = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { colCount, rowHeight, GAP } = useResponsiveGrid(parentRef);
  const { items, isError, isLoading } = useInfiniteQuery(parentRef, 'note');
  const rowVirtualizer = useVirtualGrid(parentRef, items, colCount, rowHeight);
  const { openModal } = useMaterialsDuplicate();

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef} className="h-full overflow-y-auto px-5 pb-5 sm:px-10 sm:pb-10">
      {notFoundItems ? (
        <MaterialsTabEmptyState
          title="Пока нет заметок"
          description="Создайте заметку — она появится в этом списке."
        />
      ) : (
        <GridList
          rowVirtualizer={rowVirtualizer}
          colCount={colCount}
          gap={GAP}
          items={items}
          renderItem={(material) => (
            <div key={material.id} className="card-item">
              <MaterialsCard
                {...material}
                layout="gallery"
                onDuplicate={openModal}
                className="w-full"
              />
            </div>
          )}
        />
      )}
    </div>
  );
};
