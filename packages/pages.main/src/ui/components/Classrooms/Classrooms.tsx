import { useCurrentUser } from 'common.services';
import { ClassroomsTutor } from './ClassroomsTutor';
import { ClassroomsStudent } from './ClassroomsStudent';

export const Classrooms = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Условно рендерим нужный компонент в зависимости от роли
  if (isTutor) {
    return <ClassroomsTutor />;
  }

  return <ClassroomsStudent />;
};
