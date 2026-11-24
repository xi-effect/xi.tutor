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

export type StudentInviteRoleSkipDeps = {
  userId?: number;
  onboardingStage?: string;
  updateProfile: (payload: { default_layout: 'student' }) => Promise<unknown>;
  transitionForward: () => Promise<unknown>;
  trackRoleSelected?: (role: 'student', userId?: number) => void;
  trackFailed: (
    step: 'role_selection',
    role: OnboardingAnalyticsRole,
    error: unknown,
    stage?: string,
  ) => void;
  trackCompleted: (step: 'role_selection', role: OnboardingAnalyticsRole, stage?: string) => void;
  navigateAfterWelcome: () => void;
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

/**
 * Приглашение ученика пропускает экран роли и на стадиях `user-information`, и `default-layout`.
 * v2 после почты уже на `default-layout`. `user-information` остаётся у старых аккаунтов.
 */
export function shouldSkipRoleForStudentInvite(
  stage: string | undefined,
  inviteCode: string | undefined,
): boolean {
  if (!inviteCode) return false;
  return stage === 'user-information' || stage === 'default-layout';
}

/** С `user-information` нужны оба перехода. С `default-layout` — только `training`. */
export function roleAdvanceIncludesDefaultLayout(stage: string | undefined): boolean {
  return stage === 'user-information';
}

/** Приглашение ученика: роль student и переход вперёд, без экрана выбора роли. */
export async function runStudentInviteRoleSkip(
  deps: StudentInviteRoleSkipDeps,
): Promise<WelcomeRoleSubmitResult> {
  try {
    await deps.updateProfile({ default_layout: 'student' });
  } catch (error) {
    deps.trackFailed('role_selection', 'student', error, deps.onboardingStage);
    return 'profile_failed';
  }

  deps.trackRoleSelected?.('student', deps.userId);

  try {
    await deps.transitionForward();
    deps.trackCompleted('role_selection', 'student', deps.onboardingStage);
    deps.navigateAfterWelcome();
    return 'ok';
  } catch (error) {
    deps.trackFailed('role_selection', 'student', error, deps.onboardingStage);
    return 'transition_failed';
  }
}
