import { RefObject } from 'react';
import { useInfiniteQuery } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { MaterialsGallerySkeleton } from '../MaterialsGallerySkeleton';
import { MaterialsCard } from 'features.materials.card';
import { useMaterialsDuplicate } from '../../provider';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';

type NotesProps = {
  parentRef: RefObject<HTMLDivElement | null>;
};

export const Notes = ({ parentRef }: NotesProps) => {
  const { t } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { items, isError, isLoading } = useInfiniteQuery(parentRef, 'note');
  const { openModal } = useMaterialsDuplicate();

  const notFoundItems = !items.length && !isLoading && !isError;

  if (isLoading) {
    return <MaterialsGallerySkeleton />;
  }

  if (notFoundItems) {
    return (
      <MaterialsTabEmptyState
        title={t('empty.notesTitle')}
        description={t('empty.notesDescription')}
      />
    );
  }

  return (
    <GridVirtualizer
      parentRef={parentRef}
      items={items}
      defaultRowHeight={160}
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
