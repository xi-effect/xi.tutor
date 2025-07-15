import { useNavigate } from '@tanstack/react-router';
import { useOnboardingTransition } from 'common.services';

export const useWelcomeSocialsForm = () => {
  const navigate = useNavigate();

  const { transitionStage } = useOnboardingTransition('training', 'forwards');
  const { transitionStage: backToRole } = useOnboardingTransition('default-layout', 'backwards');

  const isLoading = transitionStage.isPending || backToRole.isPending;

  const onForwards = async () => {
    try {
      await transitionStage.mutateAsync();
      navigate({
        to: '/',
      });
    } catch {
      return;
    }
  };

  const onBackwards = async () => {
    try {
      await backToRole.mutateAsync();
      navigate({
        to: '/welcome/role',
      });
    } catch {
      return;
    }
  };
  return { onForwards, onBackwards, isLoading };
};
