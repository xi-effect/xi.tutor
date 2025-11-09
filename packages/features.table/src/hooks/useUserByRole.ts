import { useTutorById, useStudentById } from 'common.services';
import { type RoleT } from 'features.table';

/**
 * Хук для получения данных пользователя по роли
 * @param userRole - роль пользователя ('student' или 'tutor')
 * @param userId - ID пользователя
 * @param disabled - отключить запрос
 * @returns данные пользователя
 */
export const useUserByRole = (userRole: RoleT, userId: number, disabled?: boolean) => {
  // Вызываем оба хука, чтобы не нарушать правила хуков React
  const studentData = useStudentById(userId, disabled || userRole !== 'student');
  const tutorData = useTutorById(userId, disabled || userRole !== 'tutor');

  // Возвращаем нужный результат в зависимости от роли
  return userRole === 'student' ? studentData : tutorData;
};
