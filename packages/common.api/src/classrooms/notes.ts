import { env } from 'common.env';
import { HttpMethod } from '../config';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;

enum ClassroomNotesQueryKey {
  GetNoteStorageItem = 'GetNoteStorageItem',
  AddNoteStorageItem = 'AddNoteStorageItem',
}

const classroomNotesApiConfig = {
  [ClassroomNotesQueryKey.GetNoteStorageItem]: {
    getUrl: (classroomId: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/note/storage-item/`,
    method: HttpMethod.GET,
  },
  [ClassroomNotesQueryKey.AddNoteStorageItem]: {
    getUrl: (classroomId: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/note/storage-item/`,
    method: HttpMethod.POST,
  },
};

export { classroomNotesApiConfig, ClassroomNotesQueryKey };
