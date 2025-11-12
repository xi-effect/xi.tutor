import { env } from 'common.env';
import { HttpMethod } from '../config';

enum ClassroomNotesQueryKey {
  GetNoteStorageItem = 'GetNoteStorageItem',
  AddNoteStorageItem = 'AddNoteStorageItem',
}

const classroomNotesApiConfig = {
  [ClassroomNotesQueryKey.GetNoteStorageItem]: {
    getUrl: (classroomId: string) => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/note/storage-item/`;
    },
    method: HttpMethod.GET,
  },
  [ClassroomNotesQueryKey.AddNoteStorageItem]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/classrooms/${classroomId}/note/storage-item/`,
    method: HttpMethod.POST,
  },
};

export { classroomNotesApiConfig, ClassroomNotesQueryKey };
