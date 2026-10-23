import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  onboardingApiConfig,
  OnboardingStageT,
  OnboardingTransitionModeT,
  UserQueryKey,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { handleError } from '../utils';

export const useOnboardingTransition = (
  stage: OnboardingStageT,
  transition: OnboardingTransitionModeT,
) => {
  const queryClient = useQueryClient();

  const transitionStage = useMutation({
    mutationFn: async () => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: onboardingApiConfig['userOnboarding'].method,
          url: onboardingApiConfig['userOnboarding'].getUrl(stage, transition),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response;
      } catch (err) {
        console.error('Ошибка при переходе на следующий этап онбординга:', err);
        throw err;
      }
    },
    onError: (error) => {
      handleError(error, 'onboarding');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { transitionStage };
};

/**
 * Для ученика по приглашению: два перехода подряд, без экрана выбора роли.
 * Сначала `default-layout`, сразу затем `training`. Кэш пользователя
 * обновляется один раз после обоих запросов, чтобы гард не увёл на `/welcome/role`
 * между ними.
 */
export const useSkipRoleOnboardingStage = () => {
  const queryClient = useQueryClient();

  const skipRoleStage = useMutation({
    mutationFn: async () => {
      const axiosInst = await getAxiosInstance();
      const stages = ['default-layout', 'training'] as const;

      for (const stage of stages) {
        await axiosInst({
          method: onboardingApiConfig['userOnboarding'].method,
          url: onboardingApiConfig['userOnboarding'].getUrl(stage, 'forwards'),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    },
    onError: (error) => {
      console.error('Ошибка при пропуске стадии выбора роли:', error);
      handleError(error, 'onboarding');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [UserQueryKey.Home] });
    },
  });

  return { skipRoleStage };
};
