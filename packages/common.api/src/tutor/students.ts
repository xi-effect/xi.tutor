import { env } from 'common.env';
import { HttpMethod } from '../config';

enum StudentsQueryKey {
  AllStudents = 'AllStudents',
  StudentById = 'StudentById',
  DeleteStudent = 'DeleteStudent',
  GetClassroomStudents = 'GetClassroomStudents',
  AddStudentToClassroom = 'AddStudentToClassroom',
  RemoveStudentFromClassroom = 'RemoveStudentFromClassroom',
}

const studentsApiConfig = {
  [StudentsQueryKey.AllStudents]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/students/`,
    method: HttpMethod.GET,
  },
  [StudentsQueryKey.StudentById]: {
    getUrl: (student_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/students/${student_id}/`,
    method: HttpMethod.GET,
  },
  [StudentsQueryKey.DeleteStudent]: {
    getUrl: (student_id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/students/${student_id}/`,
    method: HttpMethod.DELETE,
  },
  [StudentsQueryKey.GetClassroomStudents]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/students/`,
    method: HttpMethod.GET,
  },
  [StudentsQueryKey.AddStudentToClassroom]: {
    getUrl: (classroomId: string, studentId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/students/${studentId}/`,
    method: HttpMethod.POST,
  },
  [StudentsQueryKey.RemoveStudentFromClassroom]: {
    getUrl: (classroomId: string, studentId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/group-classrooms/${classroomId}/students/${studentId}/`,
    method: HttpMethod.DELETE,
  },
};

export { studentsApiConfig, StudentsQueryKey };
