import { useNavigate, useSearch } from '@tanstack/react-router';

import { useCurrentUser, useOnboardingTransition, useUpdateProfile } from 'common.services';
import {
  resolveOnboardingAnalyticsRole,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';
import { runWelcomeUserSubmit } from './welcomeUserSubmitLogic';

export const useWelcomeUserForm = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const { transitionStage } = useOnboardingTransition('default-layout', 'forwards');
  const { updateProfile } = useUpdateProfile();

  const isLoading = updateProfile.isPending || transitionStage.isPending;

  const onWelcomeUserForm = async (displayName: string) => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    await runWelcomeUserSubmit({
      displayName,
      userRole,
      onboardingStage: user?.onboarding_stage ?? undefined,
      updateProfile: (payload) => updateProfile.mutateAsync(payload),
      transitionForward: () => transitionStage.mutateAsync(),
      trackFailed: trackOnboardingStepFailed,
      trackCompleted: trackOnboardingStepCompleted,
      navigateToRole: (nextSearch) => {
        navigate({ to: '/welcome/role', search: nextSearch });
      },
      search: { ...(search as Record<string, unknown>) },
    });
  };

  return { onWelcomeUserForm, isLoading };
};
