import { useCurrentUser } from 'common.services';
import { CardsGridTutor } from './CardsGridTutor';
import { CardsGridStudent } from './CardsGridStudent';
import { CardsGridSkeleton } from './CardsGridSkeleton';

export const CardsGridSimple = () => {
  const { data: user, isLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  if (isLoading) {
    return <CardsGridSkeleton count={6} />;
  }

  if (isTutor) {
    return <CardsGridTutor />;
  }

  return <CardsGridStudent />;
};
