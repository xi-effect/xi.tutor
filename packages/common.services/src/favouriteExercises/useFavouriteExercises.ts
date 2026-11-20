import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favouriteExercisesQueryKeys, type FavouriteExercise } from 'common.api';
import { useCurrentUser } from '../user';
import { addFavouriteExercise, removeFavouriteExercise } from './changeFavouriteExercise';
import { listFavouriteExercises } from './listFavouriteExercises';

type ToggleVars = {
  exerciseId: string;
  favorite: boolean;
};

const EMPTY_FAVOURITES: FavouriteExercise[] = [];

type ToggleContext = {
  previous: FavouriteExercise[] | undefined;
};

export const useFavouriteExercises = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userId = typeof user?.id === 'number' ? user.id : null;
  const queryKey = favouriteExercisesQueryKeys.list(userId);

  const query = useQuery({
    queryKey,
    enabled: userId !== null,
    queryFn: ({ signal }) => listFavouriteExercises(signal),
  });

  const mutation = useMutation<void, Error, ToggleVars, ToggleContext>({
    mutationFn: ({ exerciseId, favorite }) =>
      favorite ? addFavouriteExercise(exerciseId) : removeFavouriteExercise(exerciseId),
    onMutate: async ({ exerciseId, favorite }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FavouriteExercise[]>(queryKey);
      queryClient.setQueryData<FavouriteExercise[]>(queryKey, (current = []) => {
        const without = current.filter((item) => item.exerciseId !== exerciseId);
        if (!favorite) {
          return without;
        }
        return [{ exerciseId, createdAt: new Date().toISOString() }, ...without];
      });
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const exercises = query.data ?? EMPTY_FAVOURITES;
  const exerciseIds = useMemo(() => exercises.map((item) => item.exerciseId), [exercises]);
  const favoriteSet = useMemo(() => new Set(exerciseIds), [exerciseIds]);

  const toggleFavourite = (exerciseId: string) => {
    const current = queryClient.getQueryData<FavouriteExercise[]>(queryKey) ?? EMPTY_FAVOURITES;
    return mutation.mutateAsync({
      exerciseId,
      favorite: !current.some((item) => item.exerciseId === exerciseId),
    });
  };

  return {
    exercises,
    exerciseIds,
    isFavourite: (exerciseId: string) => favoriteSet.has(exerciseId),
    isLoading: query.isLoading,
    isError: query.isError,
    toggleFavourite,
  };
};
