import { useCurrentUser } from 'common.services';
import { TabsTutor } from './TabsTutor';
import { TabsStudent } from './TabsStudent';

export const Tabs = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Условно рендерим нужный компонент в зависимости от роли
  if (isTutor) {
    return <TabsTutor />;
  }

  return <TabsStudent />;
};
