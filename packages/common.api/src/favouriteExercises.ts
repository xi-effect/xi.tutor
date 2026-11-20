import { env } from 'common.env';
import { HttpMethod } from './config';

export const FAVOURITE_EXERCISES_PAGE_LIMIT = 100;
export const FAVOURITE_EXERCISES_MAX_PAGES = 100;

const EXERCISE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isFavouriteExerciseId = (value: string): boolean => EXERCISE_ID_PATTERN.test(value);

/** Ответ GET `/users/current/favourite-exercises/`. */
export type FavouriteExerciseResponse = {
  exercise_id: string;
  created_at: string;
};

export type FavouriteExercise = {
  exerciseId: string;
  createdAt: string;
};

export const parseFavouriteExercises = (data: unknown): FavouriteExercise[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid FavouriteExercise list');
  }

  return data.map((item) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error('Invalid FavouriteExercise');
    }

    const exerciseId = 'exercise_id' in item ? item.exercise_id : undefined;
    const createdAt = 'created_at' in item ? item.created_at : undefined;
    if (typeof exerciseId !== 'string' || !isFavouriteExerciseId(exerciseId)) {
      throw new Error('Invalid FavouriteExercise.exercise_id');
    }
    if (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt))) {
      throw new Error('Invalid FavouriteExercise.created_at');
    }

    return { exerciseId, createdAt };
  });
};

export const nextFavouriteExercisesCursor = (
  page: FavouriteExercise[],
  limit = FAVOURITE_EXERCISES_PAGE_LIMIT,
): string | undefined => {
  if (page.length < limit) {
    return undefined;
  }

  const createdAt = page[page.length - 1]?.createdAt;
  return createdAt || undefined;
};

enum FavouriteExercisesQueryKey {
  List = 'ListFavouriteExercises',
  Add = 'AddFavouriteExercise',
  Remove = 'RemoveFavouriteExercise',
}

const favouriteExercisesUrl = () =>
  `${env.VITE_SERVER_URL_BACKEND}/api/protected/task-service/users/current/favourite-exercises/`;

const favouriteExerciseUrl = (exerciseId: string) =>
  `${favouriteExercisesUrl()}${encodeURIComponent(exerciseId)}/`;

const favouriteExercisesApiConfig = {
  [FavouriteExercisesQueryKey.List]: {
    getUrl: favouriteExercisesUrl,
    method: HttpMethod.GET,
  },
  [FavouriteExercisesQueryKey.Add]: {
    getUrl: favouriteExerciseUrl,
    method: HttpMethod.PUT,
  },
  [FavouriteExercisesQueryKey.Remove]: {
    getUrl: favouriteExerciseUrl,
    method: HttpMethod.DELETE,
  },
};

const favouriteExercisesQueryKeys = {
  list: (userId: number | null) => [FavouriteExercisesQueryKey.List, userId] as const,
};

export { favouriteExercisesApiConfig, FavouriteExercisesQueryKey, favouriteExercisesQueryKeys };
