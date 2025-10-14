import { env } from 'common.env';
import { HttpMethod } from './config';

enum FilesQueryKey {
  UploadImage = 'UploadImage',
  UploadPublicImage = 'UploadPublicImage',
  UploadAttachment = 'UploadAttachment',
  GetFile = 'GetFile',
  DeleteFile = 'DeleteFile',
  GetFileMeta = 'GetFileMeta',
}

const filesApiConfig = {
  [FilesQueryKey.UploadImage]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/images/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.UploadPublicImage]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/access-groups/public/file-kinds/image/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.UploadAttachment]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/attachments/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.GetFile]: {
    getUrl: (fileId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/${fileId}/`,
    method: HttpMethod.GET,
  },
  [FilesQueryKey.DeleteFile]: {
    getUrl: (fileId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/${fileId}/`,
    method: HttpMethod.DELETE,
  },
  [FilesQueryKey.GetFileMeta]: {
    getUrl: (fileId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/files/${fileId}/meta/`,
    method: HttpMethod.GET,
  },
};

export { filesApiConfig, FilesQueryKey };
