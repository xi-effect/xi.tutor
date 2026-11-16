import {
  FAVOURITE_EXERCISES_MAX_PAGES,
  FAVOURITE_EXERCISES_PAGE_LIMIT,
  favouriteExercisesApiConfig,
  FavouriteExercisesQueryKey,
  nextFavouriteExercisesCursor,
  parseFavouriteExercises,
  type FavouriteExercise,
  type FavouriteExerciseResponse,
} from 'common.api';
import { getAxiosInstance } from 'common.config';

export async function listFavouriteExercises(
  signal?: AbortSignal,
  limit = FAVOURITE_EXERCISES_PAGE_LIMIT,
): Promise<FavouriteExercise[]> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = favouriteExercisesApiConfig[FavouriteExercisesQueryKey.List];
  const exercises: FavouriteExercise[] = [];
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < FAVOURITE_EXERCISES_MAX_PAGES; pageIndex += 1) {
    const response = await axiosInst<FavouriteExerciseResponse[]>({
      method,
      url: getUrl(),
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        limit,
        ...(cursor ? { created_before: cursor } : {}),
      },
    });
    const page = parseFavouriteExercises(response.data);
    if (page.length === 0) {
      break;
    }

    exercises.push(...page);
    const nextCursor = nextFavouriteExercisesCursor(page, limit);
    if (!nextCursor || nextCursor === cursor) {
      break;
    }
    if (pageIndex === FAVOURITE_EXERCISES_MAX_PAGES - 1) {
      throw new Error('Favourite exercises list is too long');
    }
    cursor = nextCursor;
  }

  return exercises;
}
