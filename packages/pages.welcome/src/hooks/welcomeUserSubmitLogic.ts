import type { OnboardingAnalyticsRole } from 'common.utils';

export type WelcomeUserSubmitDeps = {
  displayName: string;
  userRole: OnboardingAnalyticsRole;
  onboardingStage?: string;
  updateProfile: (payload: { display_name: string }) => Promise<unknown>;
  transitionForward: () => Promise<unknown>;
  trackFailed: (
    step: 'profile',
    role: OnboardingAnalyticsRole,
    error: unknown,
    stage?: string,
  ) => void;
  trackCompleted: (step: 'profile', role: OnboardingAnalyticsRole, stage?: string) => void;
  navigateToRole: (search: Record<string, unknown>) => void;
  search: Record<string, unknown>;
};

export type WelcomeUserSubmitResult = 'ok' | 'profile_failed' | 'transition_failed';

/** Submit шага профиля: update → transition → /welcome/role. */
export async function runWelcomeUserSubmit(
  deps: WelcomeUserSubmitDeps,
): Promise<WelcomeUserSubmitResult> {
  try {
    await deps.updateProfile({ display_name: deps.displayName });
  } catch (error) {
    deps.trackFailed('profile', deps.userRole, error, deps.onboardingStage);
    return 'profile_failed';
  }

  try {
    await deps.transitionForward();
    deps.trackCompleted('profile', deps.userRole, deps.onboardingStage);
    deps.navigateToRole({ ...deps.search });
    return 'ok';
  } catch (error) {
    deps.trackFailed('profile', deps.userRole, error, deps.onboardingStage);
    return 'transition_failed';
  }
}
