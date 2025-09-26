import { env } from 'common.env';
import { HttpMethod } from './config';

enum EnrollmentsQueryKey {
  GetAllStudents = 'GetAllStudents',
  AddStudentToClassroom = 'AddStudentToClassroom',
  DeleteStudentFromClassroom = 'DeleteStudentFromClassroom',
}

const enrollmentsApiConfig = {
  [EnrollmentsQueryKey.GetAllStudents]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/students`,
    method: HttpMethod.GET,
  },
  [EnrollmentsQueryKey.AddStudentToClassroom]: {
    getUrl: (classroomId: string, studentId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/students/${studentId}/`,
    method: HttpMethod.POST,
  },
  [EnrollmentsQueryKey.DeleteStudentFromClassroom]: {
    getUrl: (classroomId: string, studentId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/students/${studentId}/`,
    method: HttpMethod.DELETE,
  },
};

export { enrollmentsApiConfig, EnrollmentsQueryKey };
