import { RefObject } from 'react';
import type { ClassroomStatusT } from 'common.api';
import { useCurrentUser } from 'common.services';
import { CardsGridTutor } from './CardsGridTutor';
import { CardsGridStudent } from './CardsGridStudent';
import { CardsGridSkeleton } from './CardsGridSkeleton';

type CardsGridSimpleProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  statuses?: ClassroomStatusT[];
  onResetStatuses?: () => void;
};

export const CardsGridSimple = ({
  parentRef,
  statuses = [],
  onResetStatuses,
}: CardsGridSimpleProps) => {
  const { data: user, isLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  if (isLoading) {
    return <CardsGridSkeleton count={6} />;
  }

  if (isTutor) {
    return (
      <CardsGridTutor parentRef={parentRef} statuses={statuses} onResetStatuses={onResetStatuses} />
    );
  }

  return <CardsGridStudent parentRef={parentRef} />;
};
