import type { OnboardingAnalyticsRole } from 'common.utils';

export type WelcomeUserProfilePayload = {
  display_name: string;
  default_layout?: 'student';
};

export type WelcomeUserSubmitDeps = {
  displayName: string;
  userRole: OnboardingAnalyticsRole;
  userId?: number;
  onboardingStage?: string;
  /** Код приглашения из URL. Тогда роль ученика ставится вместе с именем. */
  inviteCode?: string;
  updateProfile: (payload: WelcomeUserProfilePayload) => Promise<unknown>;
  transitionToRoleStage: () => Promise<unknown>;
  /** Два перехода подряд: default-layout, затем training. */
  skipRoleStage: () => Promise<unknown>;
  trackFailed: (
    step: 'profile' | 'role_selection',
    role: OnboardingAnalyticsRole,
    error: unknown,
    stage?: string,
  ) => void;
  trackCompleted: (
    step: 'profile' | 'role_selection',
    role: OnboardingAnalyticsRole,
    stage?: string,
  ) => void;
  trackRoleSelected?: (role: 'student', userId?: number) => void;
  navigateToRole: (search: Record<string, unknown>) => void;
  navigateAfterWelcome: () => void;
  search: Record<string, unknown>;
};

export type WelcomeUserSubmitResult = 'ok' | 'profile_failed' | 'transition_failed';

/** Submit шага профиля. Без приглашения — на выбор роли. С приглашением — роль ученика и сразу дальше. */
export async function runWelcomeUserSubmit(
  deps: WelcomeUserSubmitDeps,
): Promise<WelcomeUserSubmitResult> {
  const studentFromInvite = Boolean(deps.inviteCode);

  try {
    await deps.updateProfile(
      studentFromInvite
        ? { display_name: deps.displayName, default_layout: 'student' }
        : { display_name: deps.displayName },
    );
  } catch (error) {
    deps.trackFailed('profile', deps.userRole, error, deps.onboardingStage);
    return 'profile_failed';
  }

  if (studentFromInvite) {
    deps.trackRoleSelected?.('student', deps.userId);

    try {
      await deps.skipRoleStage();
    } catch (error) {
      deps.trackFailed('role_selection', 'student', error, deps.onboardingStage);
      return 'transition_failed';
    }

    deps.trackCompleted('profile', 'student', deps.onboardingStage);
    deps.trackCompleted('role_selection', 'student', deps.onboardingStage);
    deps.navigateAfterWelcome();
    return 'ok';
  }

  try {
    await deps.transitionToRoleStage();
    deps.trackCompleted('profile', deps.userRole, deps.onboardingStage);
    deps.navigateToRole({ ...deps.search });
    return 'ok';
  } catch (error) {
    deps.trackFailed('profile', deps.userRole, error, deps.onboardingStage);
    return 'transition_failed';
  }
}
