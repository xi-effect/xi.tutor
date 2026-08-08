import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '../../../hooks';
import { CardsGrid } from './CardsGrid';

export const CardsGridTutor = () => {
  const { t } = useTranslation('classrooms');
  const parentRef = useRef<HTMLDivElement>(null);

  // Используем бесконечный запрос с реальным API для репетитора
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery();

  return (
    <CardsGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      parentRef={parentRef}
      emptyText={t('empty.tutorTitle')}
      inviteText={t('empty.tutorDescription')}
      withHelpLink
    />
  );
};
