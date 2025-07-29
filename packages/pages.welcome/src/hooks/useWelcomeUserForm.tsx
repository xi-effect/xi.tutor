import { useNavigate } from '@tanstack/react-router';

import { useOnboardingTransition, useUpdateProfile } from 'common.services';

export const useWelcomeUserForm = () => {
  const navigate = useNavigate();
  const { transitionStage } = useOnboardingTransition('default-layout', 'forwards');
  const { updateProfile } = useUpdateProfile();

  const isLoading = updateProfile.isPending || transitionStage.isPending;

  const onWelcomeUserForm = async (displayName: string) => {
    try {
      await updateProfile.mutateAsync({ display_name: displayName });
    } catch {
      return;
    }

    try {
      await transitionStage.mutateAsync();
      navigate({ to: '/welcome/role' });
    } catch {
      return;
    }
  };

  return { onWelcomeUserForm, isLoading };
};
