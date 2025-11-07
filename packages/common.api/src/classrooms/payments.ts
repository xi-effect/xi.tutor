import { env } from 'common.env';
import { HttpMethod } from '../config';

enum ClassroomPaymentsQueryKey {
  StudentPayments = 'StudentPayments',
  TutorPayments = 'TutorPayments',
}

const classroomPaymentsApiConfig = {
  [ClassroomPaymentsQueryKey.StudentPayments]: {
    getUrl: (classroomId: string) => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/student/classrooms/${classroomId}/recipient-invoices/searches/`;
    },
    method: HttpMethod.POST,
  },

  [ClassroomPaymentsQueryKey.TutorPayments]: {
    getUrl: (classroomId: string) => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/invoice-service/roles/tutor/classrooms/${classroomId}/recipient-invoices/searches/`;
    },
    method: HttpMethod.POST,
  },
};

export { classroomPaymentsApiConfig, ClassroomPaymentsQueryKey };
