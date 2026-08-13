import { useRef } from 'react';
import { useInfiniteQuery } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { MaterialsGallerySkeleton } from '../MaterialsGallerySkeleton';
import { MaterialsCard } from 'features.materials.card';
import { useMaterialsDuplicate } from '../../provider';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';

export const Materials = () => {
  const { t } = useTranslation('materials');
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { items, isError, isLoading } = useInfiniteQuery(parentRef, 'board');
  const { openModal } = useMaterialsDuplicate();

  const notFoundItems = !items.length && !isLoading && !isError;

  return (
    <div ref={parentRef}>
      {isLoading ? (
        <MaterialsGallerySkeleton />
      ) : notFoundItems ? (
        <MaterialsTabEmptyState
          title={t('empty.boardsTitle')}
          description={t('empty.boardsDescription')}
        />
      ) : (
        <GridVirtualizer
          parentRef={parentRef}
          items={items}
          defaultRowHeight={160}
          minItemWidth={300}
          gap={20}
          maxColumns={4}
          isSingleColumn={isMobile}
          renderItem={(material) => (
            <MaterialsCard
              {...material}
              onDuplicate={openModal}
              layout="gallery"
              className="w-full"
            />
          )}
        />
      )}
    </div>
  );
};
