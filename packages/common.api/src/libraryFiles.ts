import { env } from 'common.env';
import { HttpMethod } from './config';
import type { FileKind } from './files';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;
const TUTOR_LIBRARY_FILES_URL = `${CONTENT_SERVICE_URL}/roles/tutor/files`;

export interface LibraryFile {
  uploader_id: number;
  id: string;
  name: string;
  extension: string;
  kind: FileKind;
  size_bytes: number;
  created_at: string;
}

export interface FileCursor {
  created_at: string;
}

/**
 * Backend FileFiltersSchema is currently empty.
 * Do not add frontend-only filters until the contract is provided.
 */
export type FileFilters = Record<string, never>;

export interface FileSearchRequest {
  cursor: FileCursor | null;
  limit: number;
  filters: FileFilters;
}

export const LIBRARY_FILES_DEFAULT_LIMIT = 12;
export const LIBRARY_FILES_MAX_LIMIT = 99;

export interface LibraryReadFileHeaders {
  'if-none-match'?: string;
  'if-modified-since'?: string | null;
}

enum LibraryFilesQueryKey {
  SearchLibraryFiles = 'SearchLibraryFiles',
  GetLibraryFile = 'GetLibraryFile',
  GetLibraryFileMeta = 'GetLibraryFileMeta',
  DeleteLibraryFile = 'DeleteLibraryFile',
}

function normalizeLibraryFilesLimit(limit?: number): number {
  const value = limit ?? LIBRARY_FILES_DEFAULT_LIMIT;
  return Math.min(Math.max(value, 1), LIBRARY_FILES_MAX_LIMIT);
}

function buildFileSearchRequest(cursor: FileCursor | null, limit?: number): FileSearchRequest {
  return {
    cursor,
    limit: normalizeLibraryFilesLimit(limit),
    filters: {},
  };
}

function getNextLibraryFilesCursor(lastPage: LibraryFile[], limit: number): FileCursor | undefined {
  if (!lastPage.length || lastPage.length < limit) {
    return undefined;
  }

  const lastFile = lastPage[lastPage.length - 1];
  if (!lastFile?.created_at) {
    return undefined;
  }

  return { created_at: lastFile.created_at };
}

const libraryFilesApiConfig = {
  [LibraryFilesQueryKey.SearchLibraryFiles]: {
    getUrl: () => `${TUTOR_LIBRARY_FILES_URL}/searches/`,
    method: HttpMethod.POST,
  },
  [LibraryFilesQueryKey.GetLibraryFile]: {
    getUrl: (fileId: string) => `${TUTOR_LIBRARY_FILES_URL}/${fileId}/`,
    method: HttpMethod.GET,
  },
  [LibraryFilesQueryKey.GetLibraryFileMeta]: {
    getUrl: (fileId: string) => `${TUTOR_LIBRARY_FILES_URL}/${fileId}/meta/`,
    method: HttpMethod.GET,
  },
  [LibraryFilesQueryKey.DeleteLibraryFile]: {
    getUrl: (fileId: string) => `${TUTOR_LIBRARY_FILES_URL}/${fileId}/`,
    method: HttpMethod.DELETE,
  },
};

function getLibraryFileUrl(fileId: string): string {
  return libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFile].getUrl(fileId);
}

const libraryFilesQueryKeys = {
  search: (limit: number): (string | number)[] => [LibraryFilesQueryKey.SearchLibraryFiles, limit],
  meta: (fileId: string): string[] => [LibraryFilesQueryKey.GetLibraryFileMeta, fileId],
  file: (fileId: string): string[] => [LibraryFilesQueryKey.GetLibraryFile, fileId],
};

export {
  libraryFilesApiConfig,
  LibraryFilesQueryKey,
  libraryFilesQueryKeys,
  getLibraryFileUrl,
  normalizeLibraryFilesLimit,
  buildFileSearchRequest,
  getNextLibraryFilesCursor,
};
