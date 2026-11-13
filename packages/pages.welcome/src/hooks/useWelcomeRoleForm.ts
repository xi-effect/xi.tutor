import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentUser, useOnboardingTransition, useUpdateProfile } from 'common.services';
import { RoleT } from 'common.types';
import {
  resolveOnboardingAnalyticsRole,
  trackOnboardingRoleSelected,
  trackOnboardingStepBack,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';
import { schedulePostOnboardingNavigation } from './postOnboardingNavigation';
import { runWelcomeRoleBack, runWelcomeRoleForward } from './welcomeRoleSubmitLogic';

export const useWelcomeRoleForm = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { invite?: string };
  const { data: user } = useCurrentUser();

  const { updateProfile } = useUpdateProfile();

  const { transitionStage: transitionStageBack } = useOnboardingTransition(
    'user-information',
    'backwards',
  );

  const { transitionStage: transitionStageForward } = useOnboardingTransition(
    'training',
    'forwards',
  );

  const onForwards = async (role: RoleT) => {
    const userRole = resolveOnboardingAnalyticsRole(role);

    await runWelcomeRoleForward({
      role,
      userId: user?.id,
      userRole,
      trackRoleSelected: trackOnboardingRoleSelected,
      onboardingStage: user?.onboarding_stage ?? undefined,
      updateProfile: (payload) => updateProfile.mutateAsync(payload),
      transitionForward: () => transitionStageForward.mutateAsync(),
      trackFailed: trackOnboardingStepFailed,
      trackCompleted: trackOnboardingStepCompleted,
      navigateAfterRole: (nextSearch) => {
        schedulePostOnboardingNavigation(nextSearch.invite, (options) => {
          if (options.to === '/invite/$inviteId') {
            void navigate({ to: options.to, params: options.params });
            return;
          }
          void navigate({ to: options.to });
        });
      },
      search,
    });
  };

  const onBackwards = async () => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    await runWelcomeRoleBack({
      userRole,
      onboardingStage: user?.onboarding_stage ?? undefined,
      transitionBack: () => transitionStageBack.mutateAsync(),
      trackBack: trackOnboardingStepBack,
      trackFailed: trackOnboardingStepFailed,
      navigateToUser: (nextSearch) => {
        navigate({ to: '/welcome/user', search: nextSearch });
      },
      search,
    });
  };

  const isLoading =
    updateProfile.isPending || transitionStageForward.isPending || transitionStageBack.isPending;

  return {
    onForwards,
    onBackwards,
    isLoading,
  };
};
