import { RefObject, useRef } from 'react';
import { useMediaQuery } from '@xipkg/utils';
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
}) => (
  <>
    {isFetchingNextPage && (
      <div className="flex justify-center py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-300" />
      </div>
    )}
    {!hasNextPage && itemsCount > 0 && (
      <div className="py-4 text-center text-gray-500">Все кабинеты загружены</div>
    )}
  </>
);

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
        <p className="text-red-500">Ошибка загрузки кабинетов</p>
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
    <div ref={parentRef} className="h-full min-h-0 w-full overflow-auto px-4">
      <GridVirtualizer
        items={items}
        parentRef={parentRef}
        gap={20}
        defaultRowHeight={126}
        minItemWidth={320}
        maxColumns={4}
        isSingleColumn={isMobile}
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
