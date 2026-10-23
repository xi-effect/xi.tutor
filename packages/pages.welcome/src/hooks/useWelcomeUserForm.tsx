import { useNavigate, useSearch } from '@tanstack/react-router';

import {
  useCurrentUser,
  useOnboardingTransition,
  useSkipRoleOnboardingStage,
  useUpdateProfile,
} from 'common.services';
import {
  getPendingInviteCode,
  resolveOnboardingAnalyticsRole,
  trackOnboardingRoleSelected,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';
import { schedulePostOnboardingNavigation } from './postOnboardingNavigation';
import { runWelcomeUserSubmit } from './welcomeUserSubmitLogic';

export const useWelcomeUserForm = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { invite?: string; redirect?: string };
  const { data: user } = useCurrentUser();
  const { transitionStage } = useOnboardingTransition('default-layout', 'forwards');
  const { skipRoleStage } = useSkipRoleOnboardingStage();
  const { updateProfile } = useUpdateProfile();
  // Письмо подтверждения открывает /welcome/email?token=… и затирает invite в адресе.
  // Код, сохранённый при регистрации по приглашению, всё ещё лежит в localStorage.
  const inviteCode = getPendingInviteCode(search);

  const isLoading = updateProfile.isPending || transitionStage.isPending || skipRoleStage.isPending;

  const onWelcomeUserForm = async (displayName: string) => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    await runWelcomeUserSubmit({
      displayName,
      userId: user?.id,
      userRole,
      onboardingStage: user?.onboarding_stage ?? undefined,
      inviteCode,
      updateProfile: (payload) => updateProfile.mutateAsync(payload),
      transitionToRoleStage: () => transitionStage.mutateAsync(),
      skipRoleStage: () => skipRoleStage.mutateAsync(),
      trackFailed: trackOnboardingStepFailed,
      trackCompleted: trackOnboardingStepCompleted,
      trackRoleSelected: trackOnboardingRoleSelected,
      navigateToRole: (nextSearch) => {
        navigate({ to: '/welcome/role', search: nextSearch });
      },
      navigateAfterWelcome: () => {
        schedulePostOnboardingNavigation(inviteCode, (options) => {
          if (options.to === '/invite/$inviteId') {
            void navigate({ to: options.to, params: options.params });
            return;
          }
          void navigate({ to: options.to });
        });
      },
      search: { ...search },
    });
  };

  return { onWelcomeUserForm, isLoading };
};
