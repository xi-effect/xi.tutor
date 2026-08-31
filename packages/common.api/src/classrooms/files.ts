import { env } from 'common.env';
import { HttpMethod } from '../config';
import type { FileFilters } from '../libraryFiles';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;

enum ClassroomFilesQueryKey {
  SearchClassroomFilesTutor = 'SearchClassroomFilesTutor',
  SearchClassroomFilesStudent = 'SearchClassroomFilesStudent',
  UploadClassroomFile = 'UploadClassroomFile',
  AttachClassroomFile = 'AttachClassroomFile',
  DetachClassroomFile = 'DetachClassroomFile',
  GetClassroomFileTutor = 'GetClassroomFileTutor',
  GetClassroomFileStudent = 'GetClassroomFileStudent',
  GetClassroomFileMetaTutor = 'GetClassroomFileMetaTutor',
  GetClassroomFileMetaStudent = 'GetClassroomFileMetaStudent',
}

const classroomFilesUrl = (role: 'tutor' | 'student', classroomId: string, path = '') =>
  `${CONTENT_SERVICE_URL}/roles/${role}/classrooms/${classroomId}/files/${path}`;

const classroomFilesApiConfig = {
  [ClassroomFilesQueryKey.SearchClassroomFilesTutor]: {
    getUrl: (classroomId: string) => classroomFilesUrl('tutor', classroomId, 'searches/'),
    method: HttpMethod.POST,
  },
  [ClassroomFilesQueryKey.SearchClassroomFilesStudent]: {
    getUrl: (classroomId: string) => classroomFilesUrl('student', classroomId, 'searches/'),
    method: HttpMethod.POST,
  },
  [ClassroomFilesQueryKey.UploadClassroomFile]: {
    getUrl: (classroomId: string) => classroomFilesUrl('tutor', classroomId),
    method: HttpMethod.POST,
  },
  [ClassroomFilesQueryKey.AttachClassroomFile]: {
    getUrl: (classroomId: string, fileId: string) =>
      classroomFilesUrl('tutor', classroomId, `${fileId}/`),
    method: HttpMethod.PUT,
  },
  [ClassroomFilesQueryKey.DetachClassroomFile]: {
    getUrl: (classroomId: string, fileId: string) =>
      classroomFilesUrl('tutor', classroomId, `${fileId}/`),
    method: HttpMethod.DELETE,
  },
  [ClassroomFilesQueryKey.GetClassroomFileTutor]: {
    getUrl: (classroomId: string, fileId: string) =>
      classroomFilesUrl('tutor', classroomId, `${fileId}/`),
    method: HttpMethod.GET,
  },
  [ClassroomFilesQueryKey.GetClassroomFileStudent]: {
    getUrl: (classroomId: string, fileId: string) =>
      classroomFilesUrl('student', classroomId, `${fileId}/`),
    method: HttpMethod.GET,
  },
  [ClassroomFilesQueryKey.GetClassroomFileMetaTutor]: {
    getUrl: (classroomId: string, fileId: string) =>
      classroomFilesUrl('tutor', classroomId, `${fileId}/meta/`),
    method: HttpMethod.GET,
  },
  [ClassroomFilesQueryKey.GetClassroomFileMetaStudent]: {
    getUrl: (classroomId: string, fileId: string) =>
      classroomFilesUrl('student', classroomId, `${fileId}/meta/`),
    method: HttpMethod.GET,
  },
};

const serializeFileFiltersKey = (filters?: FileFilters | null): (string | boolean | null)[] => {
  const kinds = filters?.kinds?.join(',') ?? '';
  const owner = filters?.is_uploaded_by_owner ?? null;
  return [kinds, owner];
};

const classroomFilesQueryKeys = {
  search: (
    role: 'tutor' | 'student',
    classroomId: string,
    limit: number,
    filters?: FileFilters | null,
  ): (string | number | boolean | null)[] => [
    role === 'tutor'
      ? ClassroomFilesQueryKey.SearchClassroomFilesTutor
      : ClassroomFilesQueryKey.SearchClassroomFilesStudent,
    classroomId,
    limit,
    ...serializeFileFiltersKey(filters),
  ],
  file: (role: 'tutor' | 'student', classroomId: string, fileId: string): string[] => [
    role === 'tutor'
      ? ClassroomFilesQueryKey.GetClassroomFileTutor
      : ClassroomFilesQueryKey.GetClassroomFileStudent,
    classroomId,
    fileId,
  ],
  meta: (role: 'tutor' | 'student', classroomId: string, fileId: string): string[] => [
    role === 'tutor'
      ? ClassroomFilesQueryKey.GetClassroomFileMetaTutor
      : ClassroomFilesQueryKey.GetClassroomFileMetaStudent,
    classroomId,
    fileId,
  ],
};

export { classroomFilesApiConfig, ClassroomFilesQueryKey, classroomFilesQueryKeys };
