import { env } from 'common.env';
import { HttpMethod } from './config';
import { FILE_KINDS, type FileKind } from './files';
import { TAG_FILE_ASSIGN_MAX_COUNT, TAG_FILTER_MAX_COUNT, normalizeTagIds } from './tags';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;
const TUTOR_LIBRARY_FILES_URL = `${CONTENT_SERVICE_URL}/roles/tutor/files`;

export interface LibraryFile {
  uploader_id?: number;
  id: string;
  name: string;
  extension: string;
  kind: FileKind;
  size_bytes: number;
  created_at: string;
  tag_ids?: number[] | null;
}

export interface FileCursor {
  created_at: string;
}

export const FILE_FILTER_MAX_KINDS = 5;

export interface FileFilters {
  kinds?: FileKind[] | null;
  is_uploaded_by_owner?: boolean | null;
  tag_ids?: number[] | null;
}

export interface FileSearchRequest {
  cursor: FileCursor | null;
  limit: number;
  filters: FileFilters;
}

export const LIBRARY_FILES_DEFAULT_LIMIT = 24;
export const LIBRARY_FILES_MAX_LIMIT = 99;

export interface LibraryReadFileHeaders {
  'if-none-match'?: string;
  'if-modified-since'?: string | null;
}

export interface UploadLibraryFileBody {
  upload: File;
}

enum LibraryFilesQueryKey {
  SearchLibraryFiles = 'SearchLibraryFiles',
  UploadLibraryFile = 'UploadLibraryFile',
  GetLibraryFile = 'GetLibraryFile',
  GetLibraryFileMeta = 'GetLibraryFileMeta',
  UpdateLibraryFile = 'UpdateLibraryFile',
  DeleteLibraryFile = 'DeleteLibraryFile',
  SetLibraryFileTags = 'SetLibraryFileTags',
}

function normalizeLibraryFilesLimit(limit?: number): number {
  const value = limit ?? LIBRARY_FILES_DEFAULT_LIMIT;
  return Math.min(Math.max(value, 1), LIBRARY_FILES_MAX_LIMIT);
}

function normalizeFileFilters(filters?: FileFilters | null): FileFilters {
  const next: FileFilters = {};

  if (filters?.kinds?.length) {
    const seen = new Set<FileKind>();
    for (const kind of filters.kinds) {
      if (!FILE_KINDS.includes(kind) || seen.has(kind)) {
        continue;
      }
      seen.add(kind);
      if (seen.size >= FILE_FILTER_MAX_KINDS) {
        break;
      }
    }
    if (seen.size > 0) {
      next.kinds = [...seen];
    }
  }

  if (typeof filters?.is_uploaded_by_owner === 'boolean') {
    next.is_uploaded_by_owner = filters.is_uploaded_by_owner;
  }

  const tagIds = normalizeTagIds(filters?.tag_ids, TAG_FILTER_MAX_COUNT);
  if (tagIds) {
    next.tag_ids = tagIds;
  }

  return next;
}

function getFileTagIds(file?: Pick<LibraryFile, 'tag_ids'> | null): number[] {
  return normalizeTagIds(file?.tag_ids, TAG_FILE_ASSIGN_MAX_COUNT) ?? [];
}

function buildFileSearchRequest(
  cursor: FileCursor | null,
  limit?: number,
  filters?: FileFilters | null,
): FileSearchRequest {
  return {
    cursor,
    limit: normalizeLibraryFilesLimit(limit),
    filters: normalizeFileFilters(filters),
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
  [LibraryFilesQueryKey.UploadLibraryFile]: {
    getUrl: () => `${TUTOR_LIBRARY_FILES_URL}/`,
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
  [LibraryFilesQueryKey.UpdateLibraryFile]: {
    getUrl: (fileId: string) => `${TUTOR_LIBRARY_FILES_URL}/${fileId}/`,
    method: HttpMethod.PATCH,
  },
  [LibraryFilesQueryKey.DeleteLibraryFile]: {
    getUrl: (fileId: string) => `${TUTOR_LIBRARY_FILES_URL}/${fileId}/`,
    method: HttpMethod.DELETE,
  },
  [LibraryFilesQueryKey.SetLibraryFileTags]: {
    getUrl: (fileId: string) => `${TUTOR_LIBRARY_FILES_URL}/${fileId}/tags/`,
    method: HttpMethod.PUT,
  },
};

function getLibraryFileUrl(fileId: string): string {
  return libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFile].getUrl(fileId);
}

const libraryFilesQueryKeys = {
  search: (limit: number, filters?: FileFilters | null): (string | number | boolean | null)[] => {
    const normalized = normalizeFileFilters(filters);
    return [
      LibraryFilesQueryKey.SearchLibraryFiles,
      limit,
      normalized.kinds?.join(',') ?? '',
      normalized.is_uploaded_by_owner ?? null,
      normalized.tag_ids?.join(',') ?? '',
    ];
  },
  meta: (fileId: string): string[] => [LibraryFilesQueryKey.GetLibraryFileMeta, fileId],
  file: (fileId: string): string[] => [LibraryFilesQueryKey.GetLibraryFile, fileId],
};

export {
  libraryFilesApiConfig,
  LibraryFilesQueryKey,
  libraryFilesQueryKeys,
  getLibraryFileUrl,
  normalizeLibraryFilesLimit,
  normalizeFileFilters,
  buildFileSearchRequest,
  getNextLibraryFilesCursor,
  getFileTagIds,
};
