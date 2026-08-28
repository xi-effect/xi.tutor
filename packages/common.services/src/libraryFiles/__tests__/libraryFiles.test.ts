import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LIBRARY_FILES_DEFAULT_LIMIT,
  LIBRARY_FILES_MAX_LIMIT,
  LibraryFilesQueryKey,
  buildFileSearchRequest,
  getNextLibraryFilesCursor,
  libraryFilesApiConfig,
  libraryFilesQueryKeys,
  normalizeLibraryFilesLimit,
  type LibraryFile,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { deleteLibraryFileRequest } from '../useDeleteLibraryFile';
import { getLibraryFileMetaRequest } from '../useGetLibraryFileMeta';
import { getLibraryFileRequest } from '../useGetLibraryFile';
import { searchLibraryFilesRequest } from '../useSearchLibraryFiles';
import { renameLibraryFileRequest } from '../useRenameLibraryFile';
import { shareLibraryFileToClassroomRequest } from '../useShareLibraryFileToClassroom';

const axiosMock = vi.fn();

const libraryFile: LibraryFile = {
  uploader_id: 1,
  id: '11111111-1111-4111-8111-111111111111',
  name: 'notes',
  extension: 'pdf',
  kind: 'document',
  size_bytes: 1024,
  created_at: '2026-08-28T10:00:00Z',
};

function httpError(status: number, detail?: string) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status, data: { detail } },
    isAxiosError: true,
  });
}

describe('library files API', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('строит URL поиска, meta, файла и удаления без X-Content-Token схемы', () => {
    const searchUrl = libraryFilesApiConfig[LibraryFilesQueryKey.SearchLibraryFiles].getUrl();
    const metaUrl = libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileMeta].getUrl(
      libraryFile.id,
    );
    const fileUrl = libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFile].getUrl(
      libraryFile.id,
    );
    const updateUrl = libraryFilesApiConfig[LibraryFilesQueryKey.UpdateLibraryFile].getUrl(
      libraryFile.id,
    );
    const deleteUrl = libraryFilesApiConfig[LibraryFilesQueryKey.DeleteLibraryFile].getUrl(
      libraryFile.id,
    );

    expect(searchUrl).toContain('/api/protected/content-service/roles/tutor/files/searches/');
    expect(metaUrl).toContain(
      `/api/protected/content-service/roles/tutor/files/${libraryFile.id}/meta/`,
    );
    expect(fileUrl).toContain(
      `/api/protected/content-service/roles/tutor/files/${libraryFile.id}/`,
    );
    expect(updateUrl).toBe(fileUrl);
    expect(deleteUrl).toBe(fileUrl);
    expect(libraryFilesApiConfig[LibraryFilesQueryKey.UpdateLibraryFile].method).toBe('PATCH');
    expect(fileUrl).not.toMatch(/\/content-service\/files\/[^/]+\/$/);
  });

  it('собирает cursor-based search request с пустыми filters', () => {
    expect(buildFileSearchRequest(null)).toEqual({
      cursor: null,
      limit: LIBRARY_FILES_DEFAULT_LIMIT,
      filters: {},
    });
    expect(buildFileSearchRequest({ created_at: libraryFile.created_at }, 20)).toEqual({
      cursor: { created_at: libraryFile.created_at },
      limit: 20,
      filters: {},
    });
    expect(normalizeLibraryFilesLimit(0)).toBe(1);
    expect(normalizeLibraryFilesLimit(1000)).toBe(LIBRARY_FILES_MAX_LIMIT);
  });

  it('вычисляет следующий cursor и останавливает пагинацию на короткой странице', () => {
    const fullPage = Array.from({ length: 12 }, (_, index) => ({
      ...libraryFile,
      id: `${index}`,
      created_at: `2026-08-28T10:00:${String(index).padStart(2, '0')}Z`,
    }));

    expect(getNextLibraryFilesCursor(fullPage, 12)).toEqual({
      created_at: '2026-08-28T10:00:11Z',
    });
    expect(getNextLibraryFilesCursor(fullPage.slice(0, 3), 12)).toBeUndefined();
    expect(getNextLibraryFilesCursor([], 12)).toBeUndefined();
  });

  it('кладёт limit в query key поиска и fileId в ключи meta/file', () => {
    expect(libraryFilesQueryKeys.search(12)).toEqual([LibraryFilesQueryKey.SearchLibraryFiles, 12]);
    expect(libraryFilesQueryKeys.meta(libraryFile.id)).toEqual([
      LibraryFilesQueryKey.GetLibraryFileMeta,
      libraryFile.id,
    ]);
    expect(libraryFilesQueryKeys.file(libraryFile.id)).toEqual([
      LibraryFilesQueryKey.GetLibraryFile,
      libraryFile.id,
    ]);
  });

  it('запрашивает список файлов с cursor, limit и пустыми filters', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: [libraryFile] });

    const result = await searchLibraryFilesRequest(null, 12);

    expect(result).toEqual([libraryFile]);
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: {
          cursor: null,
          limit: 12,
          filters: {},
        },
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      '/api/protected/content-service/roles/tutor/files/searches/',
    );
  });

  it('передаёт cursor следующей страницы', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: [] });

    await searchLibraryFilesRequest({ created_at: libraryFile.created_at }, 12);

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          cursor: { created_at: libraryFile.created_at },
          limit: 12,
          filters: {},
        },
      }),
    );
  });

  it('получает metadata файла', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: libraryFile });

    await expect(getLibraryFileMetaRequest(libraryFile.id)).resolves.toEqual(libraryFile);
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(`/${libraryFile.id}/meta/`);
    expect(axiosMock.mock.calls[0][0].headers).not.toHaveProperty('x-content-token');
  });

  it('получает сам файл без X-Content-Token и с conditional headers', async () => {
    const blob = new Blob(['pdf']);
    axiosMock.mockResolvedValue({
      status: 200,
      data: blob,
      headers: { etag: '"abc"', 'last-modified': 'Thu, 27 Aug 2026 10:00:00 GMT' },
    });

    const result = await getLibraryFileRequest(libraryFile.id, {
      ifNoneMatch: '"abc"',
      ifModifiedSince: 'Thu, 27 Aug 2026 10:00:00 GMT',
    });

    expect(result).toEqual({
      status: 200,
      data: blob,
      etag: '"abc"',
      lastModified: 'Thu, 27 Aug 2026 10:00:00 GMT',
    });
    expect(axiosMock.mock.calls[0][0].headers).toEqual({
      'if-none-match': '"abc"',
      'if-modified-since': 'Thu, 27 Aug 2026 10:00:00 GMT',
    });
    expect(axiosMock.mock.calls[0][0].headers).not.toHaveProperty('x-content-token');
    expect(axiosMock.mock.calls[0][0].responseType).toBe('blob');
  });

  it('обрабатывает 304 Not Modified', async () => {
    axiosMock.mockResolvedValue({ status: 304, data: '' });

    await expect(getLibraryFileRequest(libraryFile.id, { ifNoneMatch: '"abc"' })).resolves.toEqual({
      status: 304,
      data: null,
    });
  });

  it('удаляет файл и считает 204 успехом', async () => {
    axiosMock.mockResolvedValue({ status: 204, data: '' });

    await expect(deleteLibraryFileRequest(libraryFile.id)).resolves.toBeUndefined();
    expect(axiosMock.mock.calls[0][0].method).toBe('DELETE');
  });

  it('переименовывает файл через PATCH без расширения', async () => {
    const renamed = { ...libraryFile, name: 'new-notes' };
    axiosMock.mockResolvedValue({ status: 200, data: renamed });

    await expect(
      renameLibraryFileRequest({ fileId: libraryFile.id, name: 'new-notes' }),
    ).resolves.toEqual(renamed);

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        data: { name: 'new-notes' },
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      `/api/protected/content-service/roles/tutor/files/${libraryFile.id}/`,
    );
  });

  it('отправляет файл в кабинет через materials с file_id', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: { id: 'material-1' } });

    await expect(
      shareLibraryFileToClassroomRequest({
        fileId: libraryFile.id,
        classroomId: 42,
        name: 'notes.pdf',
      }),
    ).resolves.toBeUndefined();

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: {
          content_kind: 'file',
          file_id: libraryFile.id,
          name: 'notes.pdf',
          student_access_mode: 'read_only',
        },
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      '/api/protected/content-service/roles/tutor/classrooms/42/materials/',
    );
  });

  it.each([401, 403, 404])('пробрасывает ошибку %s при удалении', async (status) => {
    axiosMock.mockRejectedValue(httpError(status, 'File access denied'));

    await expect(deleteLibraryFileRequest(libraryFile.id)).rejects.toMatchObject({
      response: { status },
    });
  });

  it.each([401, 403, 404])('пробрасывает ошибку %s при получении meta', async (status) => {
    axiosMock.mockRejectedValue(httpError(status, 'File not found'));

    await expect(getLibraryFileMetaRequest(libraryFile.id)).rejects.toMatchObject({
      response: { status },
    });
  });

  it.each([401, 403, 404])('пробрасывает ошибку %s при получении файла', async (status) => {
    axiosMock.mockRejectedValue(httpError(status, 'File access denied'));

    await expect(getLibraryFileRequest(libraryFile.id)).rejects.toMatchObject({
      response: { status },
    });
  });
});
