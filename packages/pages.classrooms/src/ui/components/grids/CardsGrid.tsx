import { RefObject, useRef } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { useScrollPagination } from '../../../hooks';
import { CardsGridSkeleton } from './CardsGridSkeleton';
import { Card } from '../cards/Card';
import { ClassroomPropsT } from '../../../types';
import { ClassroomsEmptyState } from './ClassroomsEmptyState';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';

type TCardsGridProps = {
  items: ClassroomPropsT[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  parentRef: RefObject<HTMLDivElement | null>;
  emptyText: string;
  inviteText: string;
  withHelpLink?: boolean;
};

const ListFooter = ({
  isFetchingNextPage,
  hasNextPage,
  itemsCount,
}: {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  itemsCount: number;
}) => {
  const { t } = useTranslation('classrooms');

  return (
    <>
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="border-border-strong h-8 w-8 animate-spin rounded-full border-b-2" />
        </div>
      )}
      {!hasNextPage && itemsCount >= 20 && (
        <div className="text-text-primary py-4 text-center">{t('allLoaded')}</div>
      )}
    </>
  );
};

export const CardsGrid: React.FC<TCardsGridProps> = ({
  items,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  parentRef,
  emptyText,
  inviteText,
  withHelpLink = false,
}) => {
  const { t } = useTranslation('classrooms');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const sentinelRef = useRef<HTMLDivElement>(null);

  useScrollPagination({
    sentinelRef,
    rootRef: parentRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    itemsCount: items.length,
  });

  if (isLoading) {
    return <CardsGridSkeleton count={12} />;
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-danger">{t('loadError')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <ClassroomsEmptyState
        title={emptyText}
        description={inviteText}
        withHelpLink={withHelpLink}
      />
    );
  }

  return (
    <>
      <GridVirtualizer
        items={items}
        parentRef={parentRef}
        gap={20}
        defaultRowHeight={160}
        minItemWidth={300}
        maxColumns={4}
        isSingleColumn={isMobile}
        renderItem={(item) => <Card {...item} />}
      />

      <div ref={sentinelRef} className="h-px" aria-hidden />
      <ListFooter
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        itemsCount={items.length}
      />
    </>
  );
};
