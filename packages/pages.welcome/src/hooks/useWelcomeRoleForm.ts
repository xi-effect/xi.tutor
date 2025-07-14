import { startTransition, useTransition } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { handleError, useOnboardingTransition, useUpdateProfile } from 'common.services';
import { RoleT } from 'common.types';

export const useWelcomeRoleForm = () => {
  const navigate = useNavigate();
  const [isPending] = useTransition();

  const { transitionStage } = useOnboardingTransition('user-information', 'backwards');
  const { transitionStage: notificationsStage } = useOnboardingTransition(
    'notifications',
    'forwards',
  );
  const { updateProfile } = useUpdateProfile();

  const onForwards = (role: RoleT) => {
    startTransition(async () => {
      try {
        await updateProfile.mutateAsync({
          default_layout: role,
        });
      } catch (error) {
        handleError(error, 'profile');
        return;
      }

      try {
        await notificationsStage.mutateAsync();
        navigate({
          to: '/welcome/socials',
        });
      } catch (error) {
        handleError(error, 'onboarding');
      }
    });
  };

  const onBackwards = () => {
    startTransition(async () => {
      try {
        await transitionStage.mutateAsync();
        navigate({
          to: '/welcome/user',
        });
      } catch (error) {
        handleError(error, 'onboarding');
      }
    });
  };
  return { onForwards, onBackwards, isPending };
};
