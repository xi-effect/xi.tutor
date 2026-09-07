import { RefObject } from 'react';
import { useInfiniteQuery } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { MaterialsGallerySkeleton } from '../MaterialsGallerySkeleton';
import { FilesFilteredEmpty } from '../Files/FilesFilteredEmpty';
import { MaterialsCard } from 'features.materials.card';
import { useMaterialsDuplicate } from '../../provider';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';

import { MaterialScopeFilterT } from '../../types';

type NotesProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  scopeFilter: MaterialScopeFilterT;
  classroomIds: number[];
  search?: string;
  tagIds?: number[];
  onResetFilters: () => void;
};

export const Notes = ({
  parentRef,
  scopeFilter,
  classroomIds,
  search = '',
  tagIds = [],
  onResetFilters,
}: NotesProps) => {
  const { t } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { items, isError, isLoading } = useInfiniteQuery(
    parentRef,
    'note',
    scopeFilter,
    classroomIds,
    tagIds,
    search,
  );
  const { openModal } = useMaterialsDuplicate();

  const notFoundItems = !items.length && !isLoading && !isError;

  if (isLoading) {
    return <MaterialsGallerySkeleton />;
  }

  if (notFoundItems) {
    if (search.trim() || tagIds.length > 0) {
      return <FilesFilteredEmpty onReset={onResetFilters} />;
    }

    return (
      <MaterialsTabEmptyState
        title={t('empty.notesTitle')}
        description={
          scopeFilter === 'all'
            ? t('empty.notesAllDescription')
            : scopeFilter === 'classroom'
              ? classroomIds.length === 0
                ? t('empty.notesClassroomDescription')
                : classroomIds.length === 1
                  ? t('empty.notesClassroomOneDescription')
                  : t('empty.notesClassroomSomeDescription')
              : t('empty.notesDescription')
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
