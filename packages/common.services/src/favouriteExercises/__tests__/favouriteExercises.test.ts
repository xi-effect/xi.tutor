import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  favouriteExercisesApiConfig,
  FavouriteExercisesQueryKey,
  nextFavouriteExercisesCursor,
  parseFavouriteExercises,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { addFavouriteExercise, removeFavouriteExercise } from '../changeFavouriteExercise';
import { listFavouriteExercises } from '../listFavouriteExercises';

const axiosMock = vi.fn();
const exerciseId = 'c8330fce-c134-4ea6-a4ed-80286bcbd4a4';
const olderId = '76fbcdc4-164f-45a7-8d33-d4e4a696e741';

const item = (id: string, createdAt: string) => ({
  exercise_id: id,
  created_at: createdAt,
});

describe('Favourite exercises API', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('строит URL списка и изменения одного задания', () => {
    const list = favouriteExercisesApiConfig[FavouriteExercisesQueryKey.List];
    const add = favouriteExercisesApiConfig[FavouriteExercisesQueryKey.Add];

    expect(list.getUrl()).toContain(
      '/api/protected/task-service/users/current/favourite-exercises/',
    );
    expect(list.getUrl().endsWith('/')).toBe(true);
    expect(list.method).toBe('GET');
    expect(add.getUrl(exerciseId)).toContain(`/favourite-exercises/${exerciseId}/`);
    expect(add.method).toBe('PUT');
    expect(favouriteExercisesApiConfig[FavouriteExercisesQueryKey.Remove].method).toBe('DELETE');
  });

  it('читает страницы по created_before, новые первыми', async () => {
    axiosMock
      .mockResolvedValueOnce({
        data: [item(exerciseId, '2026-11-16T12:00:00Z'), item(olderId, '2026-11-16T11:00:00Z')],
      })
      .mockResolvedValueOnce({
        data: [item('1cfadfb9-36b0-45b7-b823-35106ab99bc6', '2026-11-16T10:00:00Z')],
      });

    await expect(listFavouriteExercises(undefined, 2)).resolves.toEqual([
      { exerciseId, createdAt: '2026-11-16T12:00:00Z' },
      { exerciseId: olderId, createdAt: '2026-11-16T11:00:00Z' },
      {
        exerciseId: '1cfadfb9-36b0-45b7-b823-35106ab99bc6',
        createdAt: '2026-11-16T10:00:00Z',
      },
    ]);

    expect(axiosMock.mock.calls[0][0].params).toEqual({ limit: 2 });
    expect(axiosMock.mock.calls[1][0].params).toEqual({
      limit: 2,
      created_before: '2026-11-16T11:00:00Z',
    });
  });

  it('останавливается на короткой странице', () => {
    expect(
      nextFavouriteExercisesCursor([{ exerciseId, createdAt: '2026-11-16T12:00:00Z' }], 2),
    ).toBeUndefined();
  });

  it('PUT и DELETE ходят по id и не разбирают тело', async () => {
    axiosMock.mockResolvedValue({ status: 204 });

    await addFavouriteExercise(exerciseId);
    await removeFavouriteExercise(exerciseId);

    expect(axiosMock.mock.calls[0][0].method).toBe('PUT');
    expect(axiosMock.mock.calls[1][0].method).toBe('DELETE');
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(exerciseId);
    expect(axiosMock.mock.calls[0][0].data).toBeUndefined();
  });

  it('не отправляет строковый id', async () => {
    await expect(addFavouriteExercise('math-ru-00001')).rejects.toThrow('Invalid exercise id');
    expect(axiosMock).not.toHaveBeenCalled();
  });

  it('не принимает ответ без UUID и даты', () => {
    expect(() => parseFavouriteExercises([{ exercise_id: exerciseId }])).toThrow(
      'Invalid FavouriteExercise.created_at',
    );
    expect(() =>
      parseFavouriteExercises([
        { exercise_id: 'math-ru-00001', created_at: '2026-11-16T12:00:00Z' },
      ]),
    ).toThrow('Invalid FavouriteExercise.exercise_id');
    expect(() => parseFavouriteExercises({})).toThrow('Invalid FavouriteExercise list');
  });
});
