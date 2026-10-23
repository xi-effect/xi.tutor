import type { RoleT } from 'common.types';
import type { OnboardingAnalyticsRole } from 'common.utils';

export type WelcomeRoleForwardDeps = {
  role: RoleT;
  userId?: number;
  userRole: OnboardingAnalyticsRole;
  onboardingStage?: string;
  updateProfile: (payload: { default_layout: RoleT }) => Promise<unknown>;
  transitionForward: () => Promise<unknown>;
  trackRoleSelected?: (role: RoleT, userId?: number) => void;
  trackFailed: (
    step: 'role_selection',
    role: OnboardingAnalyticsRole,
    error: unknown,
    stage?: string,
  ) => void;
  trackCompleted: (step: 'role_selection', role: OnboardingAnalyticsRole, stage?: string) => void;
  navigateAfterRole: (search: { invite?: string }) => void;
  search: { invite?: string };
};

export type WelcomeRoleBackDeps = {
  userRole: OnboardingAnalyticsRole;
  onboardingStage?: string;
  transitionBack: () => Promise<unknown>;
  trackBack: (
    from: 'role_selection',
    to: 'profile',
    role: OnboardingAnalyticsRole,
    stage?: string,
  ) => void;
  trackFailed: (
    step: 'role_selection',
    role: OnboardingAnalyticsRole,
    error: unknown,
    stage?: string,
  ) => void;
  navigateToUser: (search: { invite?: string }) => void;
  search: { invite?: string };
};

export type WelcomeRoleSubmitResult = 'ok' | 'profile_failed' | 'transition_failed';

/** Вперёд: сохранить роль → training → / или /invite/$id. */
export async function runWelcomeRoleForward(
  deps: WelcomeRoleForwardDeps,
): Promise<WelcomeRoleSubmitResult> {
  try {
    await deps.updateProfile({ default_layout: deps.role });
  } catch (error) {
    deps.trackFailed('role_selection', deps.userRole, error, deps.onboardingStage);
    return 'profile_failed';
  }

  deps.trackRoleSelected?.(deps.role, deps.userId);

  try {
    await deps.transitionForward();
    deps.trackCompleted('role_selection', deps.userRole, deps.onboardingStage);
    deps.navigateAfterRole({ ...deps.search });
    return 'ok';
  } catch (error) {
    deps.trackFailed('role_selection', deps.userRole, error, deps.onboardingStage);
    return 'transition_failed';
  }
}

/** Назад: transition backwards → /welcome/user. */
export async function runWelcomeRoleBack(
  deps: WelcomeRoleBackDeps,
): Promise<'ok' | 'transition_failed'> {
  try {
    await deps.transitionBack();
    deps.trackBack('role_selection', 'profile', deps.userRole, deps.onboardingStage);
    deps.navigateToUser({ ...deps.search });
    return 'ok';
  } catch (error) {
    deps.trackFailed('role_selection', deps.userRole, error, deps.onboardingStage);
    return 'transition_failed';
  }
}
