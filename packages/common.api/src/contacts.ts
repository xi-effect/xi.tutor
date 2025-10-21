import { env } from 'common.env';
import { HttpMethod } from './config';

enum ContactsQueryKey {
  GetStudentContactById = 'GetStudentContactById',
  GetTutorContactById = 'GetTutorContactById',
}

const contactsApiConfig = {
  [ContactsQueryKey.GetStudentContactById]: {
    getUrl: (studentId: string | number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/students/${studentId}/contacts/`,
    method: HttpMethod.GET,
  },
  [ContactsQueryKey.GetTutorContactById]: {
    getUrl: (tutorId: string | number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/student/tutors/${tutorId}/contacts/`,
    method: HttpMethod.GET,
  },
};

export { contactsApiConfig, ContactsQueryKey };
