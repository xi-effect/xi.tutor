import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentUser, useOnboardingTransition, useUpdateProfile } from 'common.services';
import { RoleT } from 'common.types';
import {
  resolveOnboardingAnalyticsRole,
  trackOnboardingStepBack,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';

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

    try {
      await updateProfile.mutateAsync({ default_layout: role });
    } catch (error) {
      trackOnboardingStepFailed('role_selection', userRole, error, user?.onboarding_stage);
      return;
    }

    try {
      await transitionStageForward.mutateAsync();
      trackOnboardingStepCompleted('role_selection', userRole, user?.onboarding_stage);
      navigate({
        to: '/welcome/socials',
        search: { ...search },
      });
    } catch (error) {
      trackOnboardingStepFailed('role_selection', userRole, error, user?.onboarding_stage);
    }
  };

  const onBackwards = async () => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    try {
      await transitionStageBack.mutateAsync();
      trackOnboardingStepBack('role_selection', 'profile', userRole, user?.onboarding_stage);
      navigate({ to: '/welcome/user', search: { ...search } });
    } catch (error) {
      trackOnboardingStepFailed('role_selection', userRole, error, user?.onboarding_stage);
    }
  };

  const isLoading =
    updateProfile.isPending || transitionStageForward.isPending || transitionStageBack.isPending;

  return {
    onForwards,
    onBackwards,
    isLoading,
  };
};
