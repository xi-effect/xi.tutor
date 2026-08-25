import { useCurrentUser } from 'common.services';
import { HeaderTutor, HeaderStudent, Skeleton } from './components';

export const Header = () => {
  const { data: user, isLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  if (isLoading || !user) {
    return <Skeleton />;
  }

  if (isTutor) {
    return <HeaderTutor />;
  }

  return <HeaderStudent />;
};
