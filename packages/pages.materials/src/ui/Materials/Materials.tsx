import { useRef } from 'react';
import { useInfiniteQuery } from '../../hooks';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { MaterialsCard } from 'features.materials.card';
import { useMaterialsDuplicate } from '../../provider';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';

export const Materials = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { items, isError, isLoading } = useInfiniteQuery(parentRef, 'board');
  const { openModal } = useMaterialsDuplicate();

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef}>
      {notFoundItems ? (
        <MaterialsTabEmptyState
          title="Пока нет досок"
          description="Создайте доску — она появится в этом списке."
        />
      ) : (
        <GridVirtualizer
          parentRef={parentRef}
          items={items}
          defaultRowHeight={100}
          minItemWidth={300}
          gap={20}
          maxColumns={4}
          isSingleColumn={isMobile}
          renderItem={(material) => (
            <MaterialsCard {...material} onDuplicate={openModal} className="w-full min-w-auto" />
          )}
        />
      )}
    </div>
  );
};
