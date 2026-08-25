import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentUser, useOnboardingTransition, useUpdateProfile } from 'common.services';
import { RoleT } from 'common.types';
import {
  resolveOnboardingAnalyticsRole,
  trackOnboardingStepBack,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';
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
    'notifications',
    'forwards',
  );

  const onForwards = async (role: RoleT) => {
    const userRole = resolveOnboardingAnalyticsRole(role);

    await runWelcomeRoleForward({
      role,
      userRole,
      onboardingStage: user?.onboarding_stage ?? undefined,
      updateProfile: (payload) => updateProfile.mutateAsync(payload),
      transitionForward: () => transitionStageForward.mutateAsync(),
      trackFailed: trackOnboardingStepFailed,
      trackCompleted: trackOnboardingStepCompleted,
      navigateToSocials: (nextSearch) => {
        navigate({ to: '/welcome/socials', search: nextSearch });
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
