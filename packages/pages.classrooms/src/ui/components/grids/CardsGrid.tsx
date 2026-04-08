import { RefObject } from 'react';
import { CardsGridSkeleton } from './CardsGridSkeleton';
import { Card } from '../cards/Card';
import { ClassroomPropsT } from '../../../types';
import { VirtualGridlList } from './VirtualGridlList';

interface ICardsGridProps {
  items: ClassroomPropsT[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  parentRef: RefObject<HTMLDivElement | null>;
  emptyText: string;
  inviteText: string;
}

export const CardsGrid: React.FC<ICardsGridProps> = ({
  items,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  parentRef,
  emptyText,
  inviteText,
}) => {
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
      <div className="flex h-full min-h-[90dvh] flex-col items-center justify-center gap-2">
        <p className="text-xl-base text-center font-semibold text-gray-100">{emptyText}</p>
        <p className="text-m-base text-gray-80 text-center">{inviteText}</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-116px)] w-full overflow-auto">
      <VirtualGridlList
        items={items}
        parentRef={parentRef}
        gap={20}
        defaultRowHeight={145}
        minItemWidth={320}
        maxColumns={4}
        renderItem={(item) => <Card {...item} />}
      />

      {/* Индикатор загрузки следующей страницы */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-300"></div>
        </div>
      )}
      {/* Сообщение о конце списка */}
      {!hasNextPage && items.length > 0 && (
        <div className="py-4 text-center text-gray-500">Все кабинеты загружены</div>
      )}
    </div>
  );
};
