import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQueryStudent } from '../../../hooks';
import { CardsGrid } from './CardsGrid';

type CardsGridStudentProps = {
  parentRef: RefObject<HTMLDivElement | null>;
};

export const CardsGridStudent = ({ parentRef }: CardsGridStudentProps) => {
  const { t } = useTranslation('classrooms');

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
