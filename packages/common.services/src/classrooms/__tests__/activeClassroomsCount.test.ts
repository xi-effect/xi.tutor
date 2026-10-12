import { beforeEach, describe, expect, it, vi } from 'vitest';
import { classroomsApiConfig, ClassroomsQueryKey, parseActiveClassroomsCount } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { getActiveClassroomsCount } from '../useActiveClassroomsCount';

const axiosMock = vi.fn();

describe('active classrooms count', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('запрашивает количество активных кабинетов числом', async () => {
    axiosMock.mockResolvedValue({ data: 4 });

    await expect(getActiveClassroomsCount()).resolves.toBe(4);
    expect(classroomsApiConfig[ClassroomsQueryKey.ActiveClassroomsCount].method).toBe('GET');
    expect(classroomsApiConfig[ClassroomsQueryKey.ActiveClassroomsCount].getUrl()).toContain(
      '/api/protected/classroom-service/roles/tutor/active-classrooms-count/',
    );
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/active-classrooms-count/'),
      }),
    );
  });

  it('не принимает ответ, который не является целым числом', () => {
    expect(parseActiveClassroomsCount(0)).toBe(0);
    expect(() => parseActiveClassroomsCount('4')).toThrow('Invalid ActiveClassroomsCount');
    expect(() => parseActiveClassroomsCount(4.5)).toThrow('Invalid ActiveClassroomsCount');
    expect(() => parseActiveClassroomsCount(-1)).toThrow('Invalid ActiveClassroomsCount');
  });
});
