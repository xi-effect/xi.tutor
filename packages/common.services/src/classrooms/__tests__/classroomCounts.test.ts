import { beforeEach, describe, expect, it, vi } from 'vitest';
import { classroomsApiConfig, ClassroomsQueryKey, parseClassroomCounts } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { getClassroomCounts } from '../useClassroomCounts';

const axiosMock = vi.fn();

const statusCounts = {
  active: 2,
  paused: 1,
  locked: 4,
  finished: 3,
};

describe('classroom status counts', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('запрашивает количество кабинетов по каждому статусу', async () => {
    axiosMock.mockResolvedValue({ data: statusCounts });

    await expect(getClassroomCounts()).resolves.toEqual(statusCounts);
    expect(classroomsApiConfig[ClassroomsQueryKey.ClassroomCounts].method).toBe('GET');
    expect(classroomsApiConfig[ClassroomsQueryKey.ClassroomCounts].getUrl()).toContain(
      '/api/protected/classroom-service/roles/tutor/classroom-status-counts/',
    );
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/classroom-status-counts/'),
      }),
    );
  });

  it('не принимает ответ без целых неотрицательных счётчиков', () => {
    expect(parseClassroomCounts(statusCounts)).toEqual(statusCounts);
    expect(() => parseClassroomCounts({ active: 0, locked: 1 })).toThrow('Invalid ClassroomCounts');
    expect(() => parseClassroomCounts({ ...statusCounts, active: '0' })).toThrow(
      'Invalid ClassroomCounts',
    );
    expect(() => parseClassroomCounts({ ...statusCounts, paused: 1.5 })).toThrow(
      'Invalid ClassroomCounts',
    );
    expect(() => parseClassroomCounts({ ...statusCounts, finished: -1 })).toThrow(
      'Invalid ClassroomCounts',
    );
    expect(() => parseClassroomCounts(null)).toThrow('Invalid ClassroomCounts');
  });
});
