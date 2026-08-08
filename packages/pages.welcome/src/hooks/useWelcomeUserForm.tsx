import { useNavigate, useSearch } from '@tanstack/react-router';

import { useCurrentUser, useOnboardingTransition, useUpdateProfile } from 'common.services';
import {
  resolveOnboardingAnalyticsRole,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';

export const useWelcomeUserForm = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const { transitionStage } = useOnboardingTransition('default-layout', 'forwards');
  const { updateProfile } = useUpdateProfile();

  const isLoading = updateProfile.isPending || transitionStage.isPending;

  const onWelcomeUserForm = async (displayName: string) => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    try {
      await updateProfile.mutateAsync({ display_name: displayName });
    } catch (error) {
      trackOnboardingStepFailed('profile', userRole, error, user?.onboarding_stage);
      return;
    }

    try {
      await transitionStage.mutateAsync();
      trackOnboardingStepCompleted('profile', userRole, user?.onboarding_stage);
      navigate({ to: '/welcome/role', search: { ...search } });
    } catch (error) {
      trackOnboardingStepFailed('profile', userRole, error, user?.onboarding_stage);
    }
  };

  return { onWelcomeUserForm, isLoading };
};
