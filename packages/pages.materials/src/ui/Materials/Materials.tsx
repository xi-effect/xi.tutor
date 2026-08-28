import { RefObject } from 'react';
import { useInfiniteQuery } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { MaterialsGallerySkeleton } from '../MaterialsGallerySkeleton';
import { MaterialsCard } from 'features.materials.card';
import { useMaterialsDuplicate } from '../../provider';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';

import { MaterialScopeFilterT } from '../../types';

type MaterialsProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  scopeFilter: MaterialScopeFilterT;
  classroomIds: number[];
};

export const Materials = ({ parentRef, scopeFilter, classroomIds }: MaterialsProps) => {
  const { t } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { items, isError, isLoading } = useInfiniteQuery(
    parentRef,
    'board',
    scopeFilter,
    classroomIds,
  );
  const { openModal } = useMaterialsDuplicate();

  const notFoundItems = !items.length && !isLoading && !isError;

  if (isLoading) {
    return <MaterialsGallerySkeleton />;
  }

  if (notFoundItems) {
    return (
      <MaterialsTabEmptyState
        title={t('empty.boardsTitle')}
        description={
          scopeFilter === 'all'
            ? t('empty.boardsAllDescription')
            : scopeFilter === 'classroom'
              ? classroomIds.length === 0
                ? t('empty.boardsClassroomDescription')
                : classroomIds.length === 1
                  ? t('empty.boardsClassroomOneDescription')
                  : t('empty.boardsClassroomSomeDescription')
              : t('empty.boardsDescription')
        }
      />
    );
  }

  return (
    <GridVirtualizer
      parentRef={parentRef}
      items={items}
      defaultRowHeight={176}
      minItemWidth={300}
      gap={20}
      maxColumns={4}
      isSingleColumn={isMobile}
      renderItem={(material) => (
        <MaterialsCard {...material} onDuplicate={openModal} layout="gallery" className="w-full" />
      )}
    />
  );
};
