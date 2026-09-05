import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FILE_FILTER_MAX_KINDS,
  LIBRARY_FILES_DEFAULT_LIMIT,
  LIBRARY_FILES_MAX_LIMIT,
  LibraryFilesQueryKey,
  buildFileSearchRequest,
  getNextLibraryFilesCursor,
  libraryFilesApiConfig,
  libraryFilesQueryKeys,
  normalizeFileFilters,
  normalizeLibraryFilesLimit,
  getFileTagIds,
  type LibraryFile,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { deleteLibraryFileRequest } from '../useDeleteLibraryFile';
import {
  getLibraryFileClassroomIdsRequest,
  parseLibraryFileClassroomIds,
} from '../useGetLibraryFileClassroomIds';
import { getLibraryFileMetaRequest } from '../useGetLibraryFileMeta';
import { getLibraryFileRequest } from '../useGetLibraryFile';
import { searchLibraryFilesRequest } from '../useSearchLibraryFiles';
import { renameLibraryFileRequest } from '../useRenameLibraryFile';
import { shareLibraryFileToClassroomRequest } from '../useShareLibraryFileToClassroom';
import { uploadLibraryFile, uploadLibraryFileRequest } from '../uploadLibraryFile';
import { setFileTagsRequest } from '../useSetFileTags';

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
    const classroomIdsUrl = libraryFilesApiConfig[
      LibraryFilesQueryKey.GetLibraryFileClassroomIds
    ].getUrl(libraryFile.id);
    const fileUrl = libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFile].getUrl(
      libraryFile.id,
    );
    const updateUrl = libraryFilesApiConfig[LibraryFilesQueryKey.UpdateLibraryFile].getUrl(
      libraryFile.id,
    );
    const deleteUrl = libraryFilesApiConfig[LibraryFilesQueryKey.DeleteLibraryFile].getUrl(
      libraryFile.id,
    );
    const uploadUrl = libraryFilesApiConfig[LibraryFilesQueryKey.UploadLibraryFile].getUrl();

    expect(searchUrl).toContain('/api/protected/content-service/roles/tutor/files/searches/');
    expect(uploadUrl).toBe(searchUrl.replace(/searches\/$/, ''));
    expect(uploadUrl).toContain('/api/protected/content-service/roles/tutor/files/');
    expect(uploadUrl).not.toContain('/file-kinds/');
    expect(uploadUrl).not.toMatch(/\/content-service\/files\/$/);
    expect(libraryFilesApiConfig[LibraryFilesQueryKey.UploadLibraryFile].method).toBe('POST');
    expect(metaUrl).toContain(
      `/api/protected/content-service/roles/tutor/files/${libraryFile.id}/meta/`,
    );
    expect(classroomIdsUrl).toContain(
      `/api/protected/content-service/roles/tutor/files/${libraryFile.id}/classroom-ids/`,
    );
    expect(libraryFilesApiConfig[LibraryFilesQueryKey.GetLibraryFileClassroomIds].method).toBe(
      'GET',
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

  it('нормализует filters: уникальные kinds, максимум 5, boolean owner', () => {
    expect(
      normalizeFileFilters({
        kinds: ['image', 'document', 'image', 'audio'],
        is_uploaded_by_owner: true,
      }),
    ).toEqual({
      kinds: ['image', 'document', 'audio'],
      is_uploaded_by_owner: true,
    });
    expect(
      normalizeFileFilters({
        kinds: ['image', 'document', 'audio', 'presentation', 'uncategorized', 'image'],
        is_uploaded_by_owner: null,
      }),
    ).toEqual({
      kinds: ['image', 'document', 'audio', 'presentation', 'uncategorized'],
    });
    expect(FILE_FILTER_MAX_KINDS).toBe(5);
    expect(normalizeFileFilters({ kinds: [], is_uploaded_by_owner: null })).toEqual({});
    expect(
      normalizeFileFilters({
        tag_ids: [2, 7, 2, 0, -1, 8, 9, 10],
      }),
    ).toEqual({
      tag_ids: [2, 7, 8, 9, 10],
    });
    expect(normalizeFileFilters({ tag_ids: [] })).toEqual({});
    expect(getFileTagIds({ tag_ids: [1, 1, 2] })).toEqual([1, 2]);
    expect(getFileTagIds({ tag_ids: null })).toEqual([]);
  });

  it('передаёт kinds и is_uploaded_by_owner в search request', () => {
    expect(buildFileSearchRequest(null, 12, { kinds: ['image', 'document'] })).toEqual({
      cursor: null,
      limit: 12,
      filters: { kinds: ['image', 'document'] },
    });
    expect(buildFileSearchRequest(null, 12, { is_uploaded_by_owner: false })).toEqual({
      cursor: null,
      limit: 12,
      filters: { is_uploaded_by_owner: false },
    });
    expect(buildFileSearchRequest(null, 12, { tag_ids: [2, 7] })).toEqual({
      cursor: null,
      limit: 12,
      filters: { tag_ids: [2, 7] },
    });
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
    expect(libraryFilesQueryKeys.search(12)).toEqual([
      LibraryFilesQueryKey.SearchLibraryFiles,
      12,
      '',
      null,
      '',
    ]);
    expect(
      libraryFilesQueryKeys.search(12, { kinds: ['image'], is_uploaded_by_owner: true }),
    ).toEqual([LibraryFilesQueryKey.SearchLibraryFiles, 12, 'image', true, '']);
    expect(libraryFilesQueryKeys.search(12, { tag_ids: [2, 7] })).toEqual([
      LibraryFilesQueryKey.SearchLibraryFiles,
      12,
      '',
      null,
      '2,7',
    ]);
    expect(libraryFilesQueryKeys.meta(libraryFile.id)).toEqual([
      LibraryFilesQueryKey.GetLibraryFileMeta,
      libraryFile.id,
    ]);
    expect(libraryFilesQueryKeys.file(libraryFile.id)).toEqual([
      LibraryFilesQueryKey.GetLibraryFile,
      libraryFile.id,
    ]);
    expect(libraryFilesQueryKeys.classroomIds(libraryFile.id)).toEqual([
      LibraryFilesQueryKey.GetLibraryFileClassroomIds,
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

  it('отправляет kinds и is_uploaded_by_owner в теле поиска', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: [libraryFile] });

    await searchLibraryFilesRequest(null, 12, {
      kinds: ['image', 'document'],
      is_uploaded_by_owner: true,
    });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          cursor: null,
          limit: 12,
          filters: {
            kinds: ['image', 'document'],
            is_uploaded_by_owner: true,
          },
        },
      }),
    );
  });

  it('отправляет tag_ids в теле поиска', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: [libraryFile] });

    await searchLibraryFilesRequest(null, 12, { tag_ids: [2, 7, 2] });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          cursor: null,
          limit: 12,
          filters: {
            tag_ids: [2, 7],
          },
        },
      }),
    );
  });

  it('ставит теги файла полным PUT tag_ids', async () => {
    axiosMock.mockResolvedValue({ status: 204, data: '' });

    await setFileTagsRequest({ fileId: libraryFile.id, tagIds: [1, 2, 5, 1] });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        data: { tag_ids: [1, 2, 5] },
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      `/api/protected/content-service/roles/tutor/files/${libraryFile.id}/tags/`,
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

  it('получает id кабинетов, в которых уже есть файл', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: [12, 18, 24] });

    await expect(getLibraryFileClassroomIdsRequest(libraryFile.id)).resolves.toEqual([12, 18, 24]);
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      `/api/protected/content-service/roles/tutor/files/${libraryFile.id}/classroom-ids/`,
    );
    expect(axiosMock.mock.calls[0][0].method).toBe('GET');
    expect(parseLibraryFileClassroomIds(['12', 18, 18, 0, 'x'])).toEqual([12, 18]);
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

  it('прикрепляет файл к кабинету через PUT files', async () => {
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
        method: 'PUT',
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      `/api/protected/content-service/roles/tutor/classrooms/42/files/${libraryFile.id}/`,
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

  it('загружает файл в библиотеку через POST /roles/tutor/files/', async () => {
    axiosMock.mockResolvedValue({ status: 201, data: libraryFile });
    const file = new File(['pdf'], 'notes.pdf', { type: 'application/pdf' });

    await expect(uploadLibraryFile(file)).resolves.toEqual(libraryFile);
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': false },
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      '/api/protected/content-service/roles/tutor/files/',
    );
    expect(String(axiosMock.mock.calls[0][0].url)).not.toMatch(/\/content-service\/files\/$/);
    expect(axiosMock.mock.calls[0][0].headers).not.toHaveProperty('x-content-token');
    const body = axiosMock.mock.calls[0][0].data as FormData;
    expect(body.get('upload')).toBe(file);
  });

  it('принимает 200 и тело LibraryFile при загрузке в библиотеку', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: libraryFile });
    const file = new File(['png'], 'cover.png', { type: 'image/png' });

    await expect(uploadLibraryFileRequest({ file })).resolves.toEqual(libraryFile);
  });
});
