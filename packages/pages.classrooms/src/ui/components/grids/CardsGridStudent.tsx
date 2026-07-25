import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQueryStudent } from '../../../hooks';
import { CardsGrid } from './CardsGrid';

export const CardsGridStudent = () => {
  const { t } = useTranslation('classrooms');
  const parentRef = useRef<HTMLDivElement>(null);

  // Используем бесконечный запрос с реальным API для студента
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQueryStudent();

  return (
    <CardsGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      parentRef={parentRef}
      emptyText={t('empty.studentTitle')}
      inviteText={t('empty.studentDescription')}
    />
  );
};
