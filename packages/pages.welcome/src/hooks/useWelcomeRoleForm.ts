import { useNavigate } from '@tanstack/react-router';
import { useOnboardingTransition, useUpdateProfile } from 'common.services';
import { RoleT } from 'common.types';

export const useWelcomeRoleForm = () => {
  const navigate = useNavigate();

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
    try {
      await updateProfile.mutateAsync({ default_layout: role });
    } catch {
      return;
    }

    try {
      await transitionStageForward.mutateAsync();
      navigate({ to: '/welcome/socials' });
    } catch {
      return;
    }
  };

  const onBackwards = async () => {
    try {
      await transitionStageBack.mutateAsync();
      navigate({ to: '/welcome/user' });
    } catch {
      return;
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
