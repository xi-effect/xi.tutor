import { useCurrentUser } from 'common.services';
import { CardsGridTutor } from './CardsGridTutor';
import { CardsGridStudent } from './CardsGridStudent';

export const CardsGridSimple = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Условно рендерим нужный компонент в зависимости от роли
  if (isTutor) {
    return <CardsGridTutor />;
  }

  return <CardsGridStudent />;
};
