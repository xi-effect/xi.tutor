import { RefObject, useRef } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { useScrollPagination } from '../../../hooks';
import { CardsGridSkeleton } from './CardsGridSkeleton';
import { Card } from '../cards/Card';
import { ClassroomPropsT } from '../../../types';
import { ClassroomsEmptyState } from './ClassroomsEmptyState';
import { VirtualGridlList } from './VirtualGridlList';

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
      {!hasNextPage && itemsCount > 0 && (
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

  if (isMobile) {
    return (
      <div ref={parentRef} className="w-full px-5 pb-5 sm:px-10 sm:pb-10">
        <div className="grid grid-cols-1 gap-5">
          {items.map((item) => (
            <Card key={item.id} {...item} />
          ))}
        </div>
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
        <ListFooter
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          itemsCount={items.length}
        />
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full min-h-0 w-full overflow-auto px-5 pb-5 sm:px-10 sm:pb-10"
    >
      <VirtualGridlList
        items={items}
        parentRef={parentRef}
        gap={20}
        defaultRowHeight={180}
        minItemWidth={256}
        maxColumns={3}
        renderItem={(item) => <Card {...item} />}
      />

      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <ListFooter
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        itemsCount={items.length}
      />
    </div>
  );
};
