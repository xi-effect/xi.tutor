import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassroomFilesQueryKey, classroomFilesApiConfig, type LibraryFile } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { searchClassroomFilesRequest } from '../useSearchClassroomFiles';
import { attachClassroomFileRequest } from '../useAttachClassroomFile';
import { detachClassroomFileRequest } from '../useDetachClassroomFile';
import { uploadClassroomFileRequest } from '../useUploadClassroomFile';

const axiosMock = vi.fn();

const classroomFile: LibraryFile = {
  uploader_id: 1,
  id: '11111111-1111-4111-8111-111111111111',
  name: 'notes',
  extension: 'pdf',
  kind: 'document',
  size_bytes: 1024,
  created_at: '2026-08-28T10:00:00Z',
};

describe('classroom files API', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('ищет файлы кабинета репетитора', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: [classroomFile] });

    await expect(searchClassroomFilesRequest('7', true, null)).resolves.toEqual([classroomFile]);
    expect(String(axiosMock.mock.calls[0][0].url)).toBe(
      classroomFilesApiConfig[ClassroomFilesQueryKey.SearchClassroomFilesTutor].getUrl('7'),
    );
    expect(axiosMock.mock.calls[0][0].method).toBe('POST');
  });

  it('загружает файл в кабинет multipart', async () => {
    axiosMock.mockResolvedValue({ status: 201, data: classroomFile });
    const file = new File(['pdf'], 'notes.pdf', { type: 'application/pdf' });

    await expect(uploadClassroomFileRequest({ classroomId: '7', file })).resolves.toEqual(
      classroomFile,
    );
    expect(axiosMock.mock.calls[0][0].method).toBe('POST');
    expect(String(axiosMock.mock.calls[0][0].url)).toBe(
      classroomFilesApiConfig[ClassroomFilesQueryKey.UploadClassroomFile].getUrl('7'),
    );
  });

  it('прикрепляет и открепляет файл', async () => {
    axiosMock.mockResolvedValue({ status: 204, data: '' });

    await attachClassroomFileRequest({ classroomId: '7', fileId: classroomFile.id });
    await detachClassroomFileRequest({ classroomId: '7', fileId: classroomFile.id });

    expect(axiosMock.mock.calls[0][0].method).toBe('PUT');
    expect(axiosMock.mock.calls[1][0].method).toBe('DELETE');
  });
});
