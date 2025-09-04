import { env } from 'common.env';
import { HttpMethod } from '../config';

enum StudentsQueryKey {
  AllStudents = 'AllStudents',
  StudentById = 'StudentById',
  DeleteStudent = 'DeleteStudent',
}

const studentsApiConfig = {
  [StudentsQueryKey.AllStudents]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/students/`,
    method: HttpMethod.GET,
  },
  [StudentsQueryKey.StudentById]: {
    getUrl: (student_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/students/${student_id}/`,
    method: HttpMethod.GET,
  },
  [StudentsQueryKey.DeleteStudent]: {
    getUrl: (student_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/roles/tutor/students/${student_id}/`,
    method: HttpMethod.DELETE,
  },
};

export { studentsApiConfig, StudentsQueryKey };
