import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { useInfiniteQuery } from '../../hooks';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';

const FilesGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="border-border-control bg-background-surface flex h-[96px] items-center gap-4 rounded-2xl border px-4"
      >
        <div className="bg-background-subtle size-10 shrink-0 animate-pulse rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="bg-background-subtle h-4 w-2/3 animate-pulse rounded" />
          <div className="bg-background-subtle h-3 w-24 animate-pulse rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const Files = () => {
  const { t } = useTranslation('materials');
  const parentRef = useRef<HTMLDivElement>(null);

  const { items, isLoading, isError } = useInfiniteQuery(parentRef, 'note');

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef} className="h-[calc(100vh-158px)] overflow-auto">
      {isLoading ? (
        <FilesGridSkeleton />
      ) : notFoundItems ? (
        <MaterialsTabEmptyState
          title={t('empty.filesTitle')}
          description={t('empty.filesDescription')}
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
