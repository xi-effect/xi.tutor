import { env } from 'common.env';
import { HttpMethod } from './config';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;

export type FileKind = 'uncategorized' | 'image' | 'document' | 'audio' | 'presentation';

export interface FileResponse {
  id: string;
  name: string;
  extension: string;
  kind: FileKind;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface UploadFileBody {
  upload: File;
}

export type UploadUncategorizedFileBody = UploadFileBody;
export type UploadImageFileBody = UploadFileBody;
export type UploadDocumentFileBody = UploadFileBody;
export type UploadAudioFileBody = UploadFileBody;
export type UploadPresentationFileBody = UploadFileBody;

export type UploadFileResponse = FileResponse;
export type FileMetaResponse = FileResponse;

export interface ContentTokenHeaders {
  'x-content-token': string;
}

export interface ReadFileHeaders extends ContentTokenHeaders {
  'if-none-match'?: string;
  'if-modified-since'?: string | null;
}

enum FilesQueryKey {
  UploadImage = 'UploadImage',
  UploadAudio = 'UploadAudio',
  UploadDocument = 'UploadDocument',
  UploadPresentation = 'UploadPresentation',
  UploadAttachment = 'UploadAttachment',
  GetFile = 'GetFile',
  GetFileMeta = 'GetFileMeta',
  AttachFileToYDoc = 'AttachFileToYDoc',
}

const filesApiConfig = {
  [FilesQueryKey.UploadAttachment]: {
    getUrl: () => `${CONTENT_SERVICE_URL}/file-kinds/uncategorized/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.UploadImage]: {
    getUrl: () => `${CONTENT_SERVICE_URL}/file-kinds/image/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.UploadAudio]: {
    getUrl: () => `${CONTENT_SERVICE_URL}/file-kinds/audio/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.UploadDocument]: {
    getUrl: () => `${CONTENT_SERVICE_URL}/file-kinds/document/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.UploadPresentation]: {
    getUrl: () => `${CONTENT_SERVICE_URL}/file-kinds/presentation/files/`,
    method: HttpMethod.POST,
  },
  [FilesQueryKey.GetFile]: {
    getUrl: (fileId: string) => `${CONTENT_SERVICE_URL}/files/${fileId}/`,
    method: HttpMethod.GET,
  },
  [FilesQueryKey.GetFileMeta]: {
    getUrl: (fileId: string) => `${CONTENT_SERVICE_URL}/files/${fileId}/meta/`,
    method: HttpMethod.GET,
  },
  [FilesQueryKey.AttachFileToYDoc]: {
    getUrl: (ydocId: string, fileId: string) =>
      `${CONTENT_SERVICE_URL}/ydocs/${ydocId}/files/${fileId}/`,
    method: HttpMethod.PUT,
  },
};

function getFileUrl(fileId: string): string {
  return filesApiConfig[FilesQueryKey.GetFile].getUrl(fileId);
}

export { filesApiConfig, FilesQueryKey, getFileUrl };
