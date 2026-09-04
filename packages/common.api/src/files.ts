import { env } from 'common.env';
import { HttpMethod } from './config';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;
const UPLOAD_FILE_URL = `${CONTENT_SERVICE_URL}/files/`;

export type FileKind = 'uncategorized' | 'image' | 'document' | 'audio' | 'presentation';

export const FILE_KIND = {
  Uncategorized: 'uncategorized',
  Image: 'image',
  Document: 'document',
  Audio: 'audio',
  Presentation: 'presentation',
} as const satisfies Record<string, FileKind>;

export const FILE_KINDS: FileKind[] = [
  FILE_KIND.Uncategorized,
  FILE_KIND.Image,
  FILE_KIND.Document,
  FILE_KIND.Audio,
  FILE_KIND.Presentation,
];

export interface FileResponse {
  id: string;
  name: string;
  extension: string;
  kind: FileKind;
  content_type: string;
  size_bytes: number;
  created_at: string;
  tag_ids?: number[] | null;
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
  UploadFile = 'UploadFile',
  /** @deprecated Use UploadFile — kind определяет бэкенд по содержимому. */
  UploadImage = 'UploadImage',
  /** @deprecated Use UploadFile — kind определяет бэкенд по содержимому. */
  UploadAudio = 'UploadAudio',
  /** @deprecated Use UploadFile — kind определяет бэкенд по содержимому. */
  UploadDocument = 'UploadDocument',
  /** @deprecated Use UploadFile — kind определяет бэкенд по содержимому. */
  UploadPresentation = 'UploadPresentation',
  /** @deprecated Use UploadFile — kind определяет бэкенд по содержимому. */
  UploadAttachment = 'UploadAttachment',
  GetFile = 'GetFile',
  GetFileMeta = 'GetFileMeta',
  AttachFileToYDoc = 'AttachFileToYDoc',
}

const uploadFileConfig = {
  getUrl: () => UPLOAD_FILE_URL,
  method: HttpMethod.POST,
};

const filesApiConfig = {
  [FilesQueryKey.UploadFile]: uploadFileConfig,
  [FilesQueryKey.UploadAttachment]: uploadFileConfig,
  [FilesQueryKey.UploadImage]: uploadFileConfig,
  [FilesQueryKey.UploadAudio]: uploadFileConfig,
  [FilesQueryKey.UploadDocument]: uploadFileConfig,
  [FilesQueryKey.UploadPresentation]: uploadFileConfig,
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
