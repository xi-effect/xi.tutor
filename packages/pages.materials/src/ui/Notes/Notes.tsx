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
    <div ref={parentRef} className="min-h-0 flex-1 overflow-auto pl-4">
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
              <MaterialsCard {...material} onDuplicate={openModal} className="w-full min-w-auto" />
            </div>
          )}
        />
      )}
    </div>
  );
};
