import { startTransition, useTransition } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { handleError, useOnboardingTransition } from 'common.services';

export const useWelcomeSocialsForm = () => {
  const [isPending] = useTransition();
  const navigate = useNavigate();

  const { transitionStage } = useOnboardingTransition('training', 'forwards');
  const { transitionStage: backToRole } = useOnboardingTransition('default-layout', 'backwards');

  const onForwards = () => {
    startTransition(async () => {
      try {
        await transitionStage.mutateAsync();
        navigate({
          to: '/',
        });
      } catch (error) {
        handleError(error, 'onboarding');
      }
    });
  };

  const onBackwards = () => {
    startTransition(async () => {
      try {
        await backToRole.mutateAsync();
        navigate({
          to: '/welcome/role',
        });
      } catch (error) {
        handleError(error, 'onboarding');
      }
    });
  };
  return { onForwards, onBackwards, isPending };
};
