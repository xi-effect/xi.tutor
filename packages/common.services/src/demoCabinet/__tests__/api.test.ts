import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

vi.mock('../../storageLimit/storageLimitReached', () => ({
  preventStorageWrite: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { DEMO_CABINET_NAMES } from '../template';
import { createDemoBoard, createDemoGroupClassroom, createDemoNote } from '../api';

const axiosMock = vi.fn();

describe('запросы демонстрационного кабинета', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('создаёт групповой кабинет с фиксированным названием', async () => {
    axiosMock.mockResolvedValue({ data: { id: 41 } });

    await expect(createDemoGroupClassroom()).resolves.toBe('41');
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: {
          name: DEMO_CABINET_NAMES.classroom,
          subject_id: null,
        },
      }),
    );
    expect(String(axiosMock.mock.calls[0]?.[0].url)).toContain('/group-classrooms/');
  });

  it('создаёт доску и заметку внутри кабинета', async () => {
    axiosMock
      .mockResolvedValueOnce({ data: { id: 'board-1' } })
      .mockResolvedValueOnce({ data: { id: 'note-1' } });

    await expect(createDemoBoard('41')).resolves.toBe('board-1');
    await expect(createDemoNote('41')).resolves.toBe('note-1');

    expect(axiosMock.mock.calls[0]?.[0].data).toEqual({
      content_kind: 'board',
      name: DEMO_CABINET_NAMES.board,
      student_access_mode: 'read_write',
    });
    expect(axiosMock.mock.calls[1]?.[0].data).toEqual({
      content_kind: 'note',
      name: DEMO_CABINET_NAMES.note,
      student_access_mode: 'read_write',
    });
    expect(String(axiosMock.mock.calls[0]?.[0].url)).toContain('/classrooms/41/materials/');
  });
});
