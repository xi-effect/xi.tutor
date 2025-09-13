import { useCurrentUser } from 'common.services';
import { HeaderTutor } from './HeaderTutor';
import { HeaderStudent } from './HeaderStudent';

export const Header = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Условно рендерим нужный компонент в зависимости от роли
  if (isTutor) {
    return <HeaderTutor />;
  }

  return <HeaderStudent />;
};
