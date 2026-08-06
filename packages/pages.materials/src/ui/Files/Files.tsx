import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { useInfiniteQuery } from '../../hooks';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';

export const Files = () => {
  const { t } = useTranslation('materials');
  const parentRef = useRef<HTMLDivElement>(null);

  const { items, isLoading, isError } = useInfiniteQuery(parentRef, 'note');

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef} className="h-[calc(100vh-158px)] overflow-auto">
      {notFoundItems ? (
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
