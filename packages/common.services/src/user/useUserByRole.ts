import { useTutorById, useStudentById } from 'common.services';
import { type RoleT } from 'common.types';

export const useUserByRole = (userRole: RoleT, userId: number, disabled?: boolean) => {
  const studentData = useStudentById(userId, disabled || userRole !== 'student');
  const tutorData = useTutorById(userId, disabled || userRole !== 'tutor');

  return userRole === 'student' ? studentData : tutorData;
};
