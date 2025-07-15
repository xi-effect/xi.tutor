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
