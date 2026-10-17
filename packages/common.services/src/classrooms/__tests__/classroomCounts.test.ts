import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import { classroomsApiConfig, ClassroomsQueryKey, parseClassroomCounts } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { getClassroomCounts } from '../useClassroomCounts';

const axiosMock = vi.fn();

describe('classroom counts', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('запрашивает количество кабинетов по статусам', async () => {
    axiosMock.mockResolvedValue({ data: { active: 0, locked: 4, paused: 1 } });

    await expect(getClassroomCounts()).resolves.toEqual({ active: 0, locked: 4 });
    expect(classroomsApiConfig[ClassroomsQueryKey.ClassroomCounts].method).toBe('GET');
    expect(classroomsApiConfig[ClassroomsQueryKey.ClassroomCounts].getUrl()).toContain(
      '/api/protected/classroom-service/roles/tutor/classroom-counts/',
    );
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/classroom-counts/'),
      }),
    );
  });

  it('пока нового метода нет, берёт число активных кабинетов из прежней ручки', async () => {
    const notFound = new AxiosError('Not Found');
    notFound.response = { status: 404 } as AxiosError['response'];
    axiosMock.mockRejectedValueOnce(notFound);
    axiosMock.mockResolvedValueOnce({ data: 2 });

    await expect(getClassroomCounts()).resolves.toEqual({ active: 2, locked: 0 });
    expect(axiosMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/active-classrooms-count/'),
      }),
    );
  });

  it('не принимает ответ без целых неотрицательных счётчиков', () => {
    expect(parseClassroomCounts({ active: 0, locked: 1 })).toEqual({ active: 0, locked: 1 });
    expect(() => parseClassroomCounts({ active: 2 })).toThrow('Invalid ClassroomCounts');
    expect(() => parseClassroomCounts({ active: '0', locked: 1 })).toThrow(
      'Invalid ClassroomCounts',
    );
    expect(() => parseClassroomCounts({ active: 1.5, locked: 1 })).toThrow(
      'Invalid ClassroomCounts',
    );
    expect(() => parseClassroomCounts({ active: -1, locked: 1 })).toThrow(
      'Invalid ClassroomCounts',
    );
    expect(() => parseClassroomCounts(null)).toThrow('Invalid ClassroomCounts');
  });
});
