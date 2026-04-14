import { useRef } from 'react';
import { useInfiniteQueryStudent } from '../../../hooks';
import { CardsGrid } from './CardsGrid';

export const CardsGridStudent = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Используем бесконечный запрос с реальным API для студента
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage } =
    useInfiniteQueryStudent(parentRef);

  return (
    <CardsGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      parentRef={parentRef}
      emptyText="Здесь будут ваши кабинеты"
      inviteText="Вас пока не пригласили ни в один кабинет"
    />
  );
};
