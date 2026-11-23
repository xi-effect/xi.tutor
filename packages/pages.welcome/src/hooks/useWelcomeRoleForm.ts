import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  useCurrentUser,
  useOnboardingTransition,
  useSkipRoleOnboardingStage,
  useUpdateProfile,
} from 'common.services';
import { RoleT } from 'common.types';
import {
  getPendingInviteCode,
  resolveOnboardingAnalyticsRole,
  trackOnboardingRoleSelected,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
} from 'common.utils';
import { schedulePostOnboardingNavigation } from './postOnboardingNavigation';
import { runStudentInviteRoleSkip, runWelcomeRoleForward } from './welcomeRoleSubmitLogic';

export const useWelcomeRoleForm = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { invite?: string; redirect?: string };
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();
  const { transitionStage: transitionStageForward } = useOnboardingTransition(
    'training',
    'forwards',
  );
  const { skipRoleStage } = useSkipRoleOnboardingStage();
  const inviteCode = getPendingInviteCode(search);
  const shouldSkipRole = user?.onboarding_stage === 'user-information' && Boolean(inviteCode);
  const [skipFailed, setSkipFailed] = useState(false);
  const skipStartedRef = useRef(false);

  const navigateAfterWelcome = (nextInvite?: string) => {
    schedulePostOnboardingNavigation(nextInvite, (options) => {
      if (options.to === '/invite/$inviteId') {
        void navigate({ to: options.to, params: options.params });
        return;
      }
      void navigate({ to: options.to });
    });
  };

  useEffect(() => {
    if (!shouldSkipRole || skipStartedRef.current) return;
    skipStartedRef.current = true;

    void runStudentInviteRoleSkip({
      userId: user?.id,
      onboardingStage: user?.onboarding_stage ?? undefined,
      updateProfile: (payload) => updateProfile.mutateAsync(payload),
      skipRoleStage: () => skipRoleStage.mutateAsync(),
      trackRoleSelected: trackOnboardingRoleSelected,
      trackFailed: trackOnboardingStepFailed,
      trackCompleted: trackOnboardingStepCompleted,
      navigateAfterWelcome: () => navigateAfterWelcome(inviteCode),
    }).then((result) => {
      if (result !== 'ok') setSkipFailed(true);
    });
    // Пропуск запускается один раз, когда стадия и приглашение уже известны.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSkipRole]);

  const onForwards = async (role: RoleT) => {
    const userRole = resolveOnboardingAnalyticsRole(role);
    const fromUserInformation = user?.onboarding_stage === 'user-information';

    await runWelcomeRoleForward({
      role,
      userId: user?.id,
      userRole,
      trackRoleSelected: trackOnboardingRoleSelected,
      onboardingStage: user?.onboarding_stage ?? undefined,
      updateProfile: (payload) => updateProfile.mutateAsync(payload),
      transitionForward: () =>
        fromUserInformation ? skipRoleStage.mutateAsync() : transitionStageForward.mutateAsync(),
      trackFailed: trackOnboardingStepFailed,
      trackCompleted: trackOnboardingStepCompleted,
      navigateAfterRole: (nextSearch) => {
        navigateAfterWelcome(nextSearch.invite);
      },
      search,
    });
  };

  const isLoading =
    updateProfile.isPending || transitionStageForward.isPending || skipRoleStage.isPending;

  return {
    onForwards,
    isLoading,
    isSkippingInvite: shouldSkipRole && !skipFailed,
  };
};
