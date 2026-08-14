import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '../../../hooks';
import { CardsGrid } from './CardsGrid';

type CardsGridTutorProps = {
  parentRef: RefObject<HTMLDivElement | null>;
};

export const CardsGridTutor = ({ parentRef }: CardsGridTutorProps) => {
  const { t } = useTranslation('classrooms');

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
