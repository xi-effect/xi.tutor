import { useNavigate, useSearch } from '@tanstack/react-router';
import { useOnboardingTransition, useUpdateProfile } from 'common.services';
import { RoleT } from 'common.types';

export const useWelcomeRoleForm = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { invite?: string };

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
      navigate({
        to: '/welcome/socials',
        // @ts-expect-error - TanStack Router search params typing issue
        search: (prev) => ({ ...prev, ...search }),
      });
    } catch {
      return;
    }
  };

  const onBackwards = async () => {
    try {
      await transitionStageBack.mutateAsync();
      navigate({ to: '/welcome/user', search: { ...search } });
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
