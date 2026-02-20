import { env } from 'common.env';
import { HttpMethod } from './config';

enum FilesQueryKey {
  UploadImage = 'UploadImage',
  UploadAttachment = 'UploadAttachment',
  GetFile = 'GetFile',
  GetFileMeta = 'GetFileMeta',
}

const filesApiConfig = {
  [FilesQueryKey.UploadAttachment]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/v2/file-kinds/uncategorized/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.UploadImage]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/v2/file-kinds/image/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.GetFile]: {
    getUrl: (fileId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/v2/files/${fileId}/`,
    method: HttpMethod.GET,
  },
  [FilesQueryKey.GetFileMeta]: {
    getUrl: (fileId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/storage-service/v2/files/${fileId}/meta/`,
    method: HttpMethod.GET,
  },
};

export { filesApiConfig, FilesQueryKey };
