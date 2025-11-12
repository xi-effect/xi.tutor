import { useNavigate, useSearch } from '@tanstack/react-router';

import { useOnboardingTransition, useUpdateProfile } from 'common.services';

export const useWelcomeUserForm = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
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
      navigate({ to: '/welcome/role', search: { ...search } });
    } catch {
      return;
    }
  };

  return { onWelcomeUserForm, isLoading };
};
