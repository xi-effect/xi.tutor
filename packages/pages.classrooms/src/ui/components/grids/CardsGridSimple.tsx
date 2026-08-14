import { RefObject } from 'react';
import { useCurrentUser } from 'common.services';
import { CardsGridTutor } from './CardsGridTutor';
import { CardsGridStudent } from './CardsGridStudent';
import { CardsGridSkeleton } from './CardsGridSkeleton';

type CardsGridSimpleProps = {
  parentRef: RefObject<HTMLDivElement | null>;
};

export const CardsGridSimple = ({ parentRef }: CardsGridSimpleProps) => {
  const { data: user, isLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  if (isLoading) {
    return <CardsGridSkeleton count={6} />;
  }

  if (isTutor) {
    return <CardsGridTutor parentRef={parentRef} />;
  }

  return <CardsGridStudent parentRef={parentRef} />;
};
