import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentUser, useOnboardingTransition } from 'common.services';
import {
  resolveOnboardingAnalyticsRole,
  trackOnboardingStepBack,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';

export const useWelcomeSocialsForm = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  const { transitionStage } = useOnboardingTransition('training', 'forwards');
  const { transitionStage: backToRole } = useOnboardingTransition('default-layout', 'backwards');

  const isLoading = transitionStage.isPending || backToRole.isPending;

  const search = useSearch({ strict: false }) as { invite?: string };

  const onForwards = async () => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    try {
      await transitionStage.mutateAsync();

      trackOnboardingStepCompleted('notifications', userRole, user?.onboarding_stage);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedInviteId =
        typeof window !== 'undefined' ? localStorage.getItem('invite.pending_code') : null;

      const inviteId = storedInviteId || search.invite;

      if (inviteId) {
        if (storedInviteId) {
          localStorage.removeItem('invite.pending_code');
        }
        navigate({
          to: '/invite/$inviteId',
          params: { inviteId },
        });
      } else {
        navigate({
          to: '/',
        });
      }
    } catch (error) {
      console.error('Error in onForwards:', error);
      trackOnboardingStepFailed('notifications', userRole, error, user?.onboarding_stage);
    }
  };

  const onBackwards = async () => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    try {
      await backToRole.mutateAsync();
      trackOnboardingStepBack('notifications', 'role_selection', userRole, user?.onboarding_stage);
      navigate({
        to: '/welcome/role',
        search: { ...search },
      });
    } catch (error) {
      trackOnboardingStepFailed('notifications', userRole, error, user?.onboarding_stage);
    }
  };
  return { onForwards, onBackwards, isLoading };
};
