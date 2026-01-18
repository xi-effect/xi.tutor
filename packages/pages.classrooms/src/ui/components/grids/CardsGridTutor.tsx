import { useRef } from 'react';
import { useInfiniteQuery } from '../../../hooks';
import { Card } from '../cards';
import { CardsGridSkeletonAdvanced } from './CardsGridSkeletonAdvanced';

export const CardsGridTutor = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Используем бесконечный запрос с реальным API для репетитора
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery(parentRef);

  if (isLoading) {
    return <CardsGridSkeletonAdvanced count={12} />;
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-50">Ошибка загрузки кабинетов</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-[90dvh] flex-col items-center justify-center gap-2">
        <p className="text-xl-base text-center font-semibold text-gray-100">
          Здесь будут ваши ученики и группы
        </p>
        <p className="text-m-base text-gray-80 text-center">Пригласите кого-нибудь</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-204px)] w-full overflow-auto pr-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8">
        {items.map((classroom) => (
          <div key={classroom.id} className="classroom-card">
            <Card {...classroom} />
          </div>
        ))}
      </div>

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
