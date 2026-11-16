import {
  favouriteExercisesApiConfig,
  FavouriteExercisesQueryKey,
  isFavouriteExerciseId,
} from 'common.api';
import { getAxiosInstance } from 'common.config';

const changeFavouriteExercise = async (
  exerciseId: string,
  key: FavouriteExercisesQueryKey.Add | FavouriteExercisesQueryKey.Remove,
) => {
  if (!isFavouriteExerciseId(exerciseId)) {
    throw new Error('Invalid exercise id');
  }

  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = favouriteExercisesApiConfig[key];

  await axiosInst({
    method,
    url: getUrl(exerciseId),
  });
};

export async function addFavouriteExercise(exerciseId: string): Promise<void> {
  await changeFavouriteExercise(exerciseId, FavouriteExercisesQueryKey.Add);
}

export async function removeFavouriteExercise(exerciseId: string): Promise<void> {
  await changeFavouriteExercise(exerciseId, FavouriteExercisesQueryKey.Remove);
}
