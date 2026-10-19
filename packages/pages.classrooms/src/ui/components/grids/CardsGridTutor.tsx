import { RefObject } from 'react';
import type { ClassroomStatusT } from 'common.api';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '../../../hooks';
import { CardsGrid } from './CardsGrid';
import { ClassroomsFilteredEmpty } from './ClassroomsFilteredEmpty';

type CardsGridTutorProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  statuses?: ClassroomStatusT[];
  onResetStatuses?: () => void;
};

export const CardsGridTutor = ({
  parentRef,
  statuses = [],
  onResetStatuses,
}: CardsGridTutorProps) => {
  const { t } = useTranslation('classrooms');

  const { items, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(statuses);

  if (!isLoading && !isError && items.length === 0 && statuses.length > 0 && onResetStatuses) {
    return <ClassroomsFilteredEmpty onReset={onResetStatuses} />;
  }

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
