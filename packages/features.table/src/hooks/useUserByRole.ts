import { useTutorById, useStudentById } from 'common.services';
import { type RoleT } from 'features.table';

export const useUserByRole = (userRole: RoleT) =>
  userRole === 'student' ? useStudentById : useTutorById;
