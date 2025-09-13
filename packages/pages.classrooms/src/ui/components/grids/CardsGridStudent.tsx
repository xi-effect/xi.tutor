import { useRef } from 'react';
import { useInfiniteQueryStudent } from '../../../hooks';
import { Card } from '../cards';
import { CardsGridSkeletonAdvanced } from './CardsGridSkeletonAdvanced';

export const CardsGridStudent = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Используем бесконечный запрос с реальным API для студента
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage } =
    useInfiniteQueryStudent(parentRef);

  console.log('student items', items);

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
          Здесь будут ваши кабинеты
        </p>
        <p className="text-m-base text-gray-80 text-center">
          Вас пока не пригласили ни в один кабинет
        </p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-204px)] w-full overflow-auto pr-4">
      <div className="max-xs:gap-4 grid grid-cols-1 gap-8 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
