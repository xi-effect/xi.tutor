import { useCurrentUser } from 'common.services';
import { TabsTutor } from './TabsTutor';
import { TabsStudent } from './TabsStudent';

export const Tabs = () => {
  const { data: user, isLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  if (isLoading || !user) {
    return null;
  }

  if (isTutor) {
    return <TabsTutor />;
  }

  return <TabsStudent />;
};
