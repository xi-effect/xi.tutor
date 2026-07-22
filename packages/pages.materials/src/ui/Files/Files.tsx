import { useRef } from 'react';
import { Card } from './Card';
import { useInfiniteQuery } from '../../hooks';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';

export const Files = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const { items, isLoading, isError } = useInfiniteQuery(parentRef, 'note');

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef} className="h-[calc(100vh-158px)] overflow-auto">
      {notFoundItems ? (
        <MaterialsTabEmptyState
          title="Пока нет файлов"
          description="Загруженные файлы появятся в этом списке."
        />
      ) : (
        <GridVirtualizer
          parentRef={parentRef}
          items={items}
          defaultRowHeight={100}
          minItemWidth={300}
          gap={20}
          maxColumns={4}
          renderItem={(material) => <Card {...material} />}
        />
      )}
    </div>
  );
};
