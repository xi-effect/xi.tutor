import { useNavigate, useSearch } from '@tanstack/react-router';
import { useOnboardingTransition } from 'common.services';

export const useWelcomeSocialsForm = () => {
  const navigate = useNavigate();

  const { transitionStage } = useOnboardingTransition('training', 'forwards');
  const { transitionStage: backToRole } = useOnboardingTransition('default-layout', 'backwards');

  const isLoading = transitionStage.isPending || backToRole.isPending;

  const search = useSearch({ strict: false }) as { invite?: string };

  const onForwards = async () => {
    try {
      await transitionStage.mutateAsync();

      // Небольшая задержка для обновления данных пользователя
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (search.invite) {
        navigate({
          to: '/invite/$inviteId',
          params: { inviteId: search.invite },
        });
      } else {
        navigate({
          to: '/',
        });
      }
    } catch (error) {
      console.error('Error in onForwards:', error);
      return;
    }
  };

  const onBackwards = async () => {
    try {
      await backToRole.mutateAsync();
      navigate({
        to: '/welcome/role',
        search: { ...search },
      });
    } catch {
      return;
    }
  };
  return { onForwards, onBackwards, isLoading };
};
