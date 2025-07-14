import { startTransition, useState, useTransition } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useOnboardingTransition, useUpdateProfile, handleError } from 'common.services';

export const useWelcomeUserForm = () => {
  const [isPending] = useTransition();
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();
  const { transitionStage } = useOnboardingTransition('default-layout', 'forwards');
  const { updateProfile } = useUpdateProfile();

  const onWelcomeUserForm = (displayName: string) => {
    startTransition(async () => {
      try {
        await updateProfile.mutateAsync({ display_name: displayName });
      } catch (error) {
        handleError(error, 'profile');
        return;
      }

      try {
        await transitionStage.mutateAsync();
        navigate({ to: '/welcome/role' });
      } catch (error) {
        handleError(error, 'onboarding');
      }
    });
  };

  return { onWelcomeUserForm, isPending, error };
};
