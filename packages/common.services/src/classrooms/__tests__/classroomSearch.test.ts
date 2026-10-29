import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CLASSROOMS_SEARCH_MAX_LIMIT,
  ClassroomsQueryKey,
  buildClassroomSearchRequest,
  classroomStatusesFromQueryKey,
  classroomsApiConfig,
  classroomsQueryKeys,
  getNextClassroomsCursor,
  normalizeClassroomFilters,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { searchTutorClassrooms } from '../searchTutorClassrooms';

const axiosMock = vi.fn();

describe('поиск кабинетов репетитора', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('собирает POST /classrooms/searches/ со статусами и курсором', async () => {
    axiosMock.mockResolvedValue({
      data: [{ id: 1, created_at: '2026-10-19T10:00:00Z', status: 'locked', kind: 'individual' }],
    });

    const classrooms = await searchTutorClassrooms({ created_at: '2026-10-19T12:00:00Z' }, 100, {
      statuses: ['locked', 'locked', 'paused'],
    });

    expect(classroomsApiConfig[ClassroomsQueryKey.SearchClassrooms].method).toBe('POST');
    expect(classroomsApiConfig[ClassroomsQueryKey.SearchClassrooms].getUrl()).toContain(
      '/api/protected/classroom-service/roles/tutor/classrooms/searches/',
    );
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: {
          cursor: { created_at: '2026-10-19T12:00:00Z' },
          limit: CLASSROOMS_SEARCH_MAX_LIMIT,
          filters: { statuses: ['paused', 'locked'] },
        },
      }),
    );
    expect(classrooms).toHaveLength(1);
  });

  it('не отправляет фильтр, если статусы не выбраны', () => {
    expect(normalizeClassroomFilters({ statuses: [] })).toEqual({});
    expect(buildClassroomSearchRequest(null, 25, { statuses: null }).filters).toEqual({});
  });

  it('держит стабильный ключ запроса и курсор следующей страницы', () => {
    expect(classroomsQueryKeys.search(25, ['finished', 'active'])).toEqual([
      ClassroomsQueryKey.GetClassrooms,
      'search',
      25,
      'active,finished',
    ]);
    expect(
      classroomStatusesFromQueryKey(classroomsQueryKeys.search(25, ['active', 'paused'])),
    ).toEqual(['active', 'paused']);
    expect(classroomStatusesFromQueryKey(classroomsQueryKeys.list(20))).toBeNull();
    expect(
      getNextClassroomsCursor(
        [{ created_at: '2026-10-19T12:00:00Z' }, { created_at: '2026-10-19T11:00:00Z' }],
        2,
      ),
    ).toEqual({ created_at: '2026-10-19T11:00:00Z' });
    expect(getNextClassroomsCursor([{ created_at: '2026-10-19T12:00:00Z' }], 2)).toBeUndefined();
  });
});
