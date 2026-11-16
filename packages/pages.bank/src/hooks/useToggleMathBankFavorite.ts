import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { favouriteExercisesQueryKeys, isFavouriteExerciseId } from 'common.api';
import { addFavouriteExercise, useCurrentUser, useFavouriteExercises } from 'common.services';
import { trackMathTaskFavoriteToggle, type MathBankAnalyticsSource } from 'common.utils';
import { BANK_SUBJECTS, loadBankSearchDocuments } from 'features.bank';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useMathBankUserStore } from '../store/useMathBankUserStore';

type FavoriteTaskRef = {
  id: string;
  exerciseId: string;
};

export const useMathBankFavorites = () => {
  const { t } = useTranslation('mathBank');
  const favorites = useFavouriteExercises();
  const wasError = useRef(false);

  useEffect(() => {
    if (favorites.isError && !wasError.current) {
      toast.error(t('favorites.loadError'));
    }
    wasError.current = favorites.isError;
  }, [favorites.isError, t]);

  return favorites;
};

export const useSyncLegacyMathBankFavorites = (enabled = true) => {
  const { t } = useTranslation('mathBank');
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const userId = typeof user?.id === 'number' ? user.id : null;
  const legacyFavoriteTaskIds = useMathBankUserStore((state) => state.legacyFavoriteTaskIds);
  const clearLegacyFavorites = useMathBankUserStore((state) => state.clearLegacyFavorites);

  useEffect(() => {
    if (!enabled || userId === null || legacyFavoriteTaskIds.length === 0) {
      return;
    }

    let cancelled = false;
    const sync = async () => {
      const groups = await Promise.all(
        BANK_SUBJECTS.map((subject) => loadBankSearchDocuments(subject)),
      );
      const exerciseIdByTaskId = new Map<string, string>();
      for (const documents of groups) {
        for (const document of documents) {
          if (isFavouriteExerciseId(document.exerciseId)) {
            exerciseIdByTaskId.set(document.id, document.exerciseId);
          }
        }
      }

      const exerciseIds = [
        ...new Set(
          legacyFavoriteTaskIds.flatMap((taskId) => {
            const exerciseId = exerciseIdByTaskId.get(taskId);
            return exerciseId ? [exerciseId] : [];
          }),
        ),
      ];
      await Promise.all(exerciseIds.map((exerciseId) => addFavouriteExercise(exerciseId)));
      if (cancelled) {
        return;
      }

      clearLegacyFavorites();
      await queryClient.invalidateQueries({
        queryKey: favouriteExercisesQueryKeys.list(userId),
      });
    };

    void sync().catch(() => {
      if (!cancelled) {
        toast.error(t('favorites.saveError'));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [clearLegacyFavorites, enabled, legacyFavoriteTaskIds, queryClient, t, userId]);
};

export const useToggleMathBankFavorite = (source: MathBankAnalyticsSource = 'page') => {
  const { t } = useTranslation('mathBank');
  const { isFavourite, toggleFavourite } = useFavouriteExercises();

  return (task: FavoriteTaskRef) => {
    if (!task.exerciseId) {
      console.error('У задания нет exerciseId, запрос избранного не отправлен', task.id);
      toast.error(t('favorites.saveError'));
      return;
    }

    const action = isFavourite(task.exerciseId) ? 'remove' : 'add';
    trackMathTaskFavoriteToggle(task.id, action, source);
    void toggleFavourite(task.exerciseId).catch((error: unknown) => {
      console.error('Не удалось обновить избранное', error);
      toast.error(t('favorites.saveError'));
    });
  };
};
