import { PRODUCT_ANALYTICS_EVENTS } from './events';
import { mapOnboardingError } from './mapOnboardingError';
import { getOnboardingStepMeta } from './onboardingSteps';
import { getProductAnalyticsRole } from './roles';
import { trackOnce } from './once';
import { trackProductEvent } from './umami';
import type { OnboardingSkipReason, OnboardingStepFailReason, OnboardingStepName } from './types';

const ONBOARDING_STARTED_AT_KEY = 'onboarding_started_at_ms';

export type OnboardingAnalyticsRole = 'tutor' | 'student' | 'unknown';

export function resolveOnboardingAnalyticsRole(layout?: string | null): OnboardingAnalyticsRole {
  const role = getProductAnalyticsRole(layout);
  return role === 'tutor' || role === 'student' ? role : 'unknown';
}

export function markOnboardingStartedAt(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!sessionStorage.getItem(ONBOARDING_STARTED_AT_KEY)) {
      sessionStorage.setItem(ONBOARDING_STARTED_AT_KEY, String(Date.now()));
    }
  } catch {
    // ignore
  }
}

export function getOnboardingDurationMs(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = sessionStorage.getItem(ONBOARDING_STARTED_AT_KEY);
    if (!raw) return undefined;
    const startedAt = Number(raw);
    if (!Number.isFinite(startedAt)) return undefined;
    return Math.max(0, Math.round(Date.now() - startedAt));
  } catch {
    return undefined;
  }
}

export function trackOnboardingStepCompleted(
  step: OnboardingStepName,
  userRole: OnboardingAnalyticsRole,
  onboardingStage?: string,
): void {
  const stepMeta = getOnboardingStepMeta(step);
  trackOnce(`onboarding_step_completed:${step}`, () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED, {
      ...stepMeta,
      user_role: userRole,
      onboarding_stage: onboardingStage,
    });
  });
}

export function trackOnboardingStepSkipped(
  step: OnboardingStepName,
  userRole: OnboardingAnalyticsRole,
  skipReason: OnboardingSkipReason = 'unknown',
  onboardingStage?: string,
): void {
  const stepMeta = getOnboardingStepMeta(step);
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_SKIPPED, {
    ...stepMeta,
    user_role: userRole,
    skip_reason: skipReason,
    onboarding_stage: onboardingStage,
  });
}

export function trackOnboardingStepFailed(
  step: OnboardingStepName,
  userRole: OnboardingAnalyticsRole,
  error: unknown,
  onboardingStage?: string,
): void {
  const stepMeta = getOnboardingStepMeta(step);
  const reason: OnboardingStepFailReason = mapOnboardingError(error);

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_FAILED, {
    ...stepMeta,
    user_role: userRole,
    reason,
    onboarding_stage: onboardingStage,
  });
}

export function trackOnboardingStepBack(
  fromStep: OnboardingStepName,
  toStep: OnboardingStepName,
  userRole: OnboardingAnalyticsRole,
  onboardingStage?: string,
): void {
  const stepMeta = getOnboardingStepMeta(fromStep);
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_BACK, {
    from_step: fromStep,
    to_step: toStep,
    step_index: stepMeta.step_index,
    total_steps: stepMeta.total_steps,
    user_role: userRole,
    onboarding_stage: onboardingStage,
  });
}

export function trackOnboardingCompleted(
  userRole: OnboardingAnalyticsRole,
  options?: {
    onboardingStage?: string;
    completionPath?: 'tour_done' | 'skipped' | 'auto_no_steps' | 'unknown';
  },
): void {
  trackOnce('onboarding_completed', () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
      user_role: userRole,
      onboarding_stage: options?.onboardingStage ?? 'completed',
      duration_ms: getOnboardingDurationMs(),
      completion_path: options?.completionPath ?? 'unknown',
    });
  });
}
