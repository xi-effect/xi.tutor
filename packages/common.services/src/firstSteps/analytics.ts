import {
  PRODUCT_ANALYTICS_EVENTS,
  getOnboardingStepMeta,
  trackOnce,
  trackOnboardingCompleted,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
  trackOnboardingStepSkipped,
  trackProductEvent,
  type OnboardingAnalyticsRole,
} from 'common.utils';

export const trackFirstStepsViewed = (role: OnboardingAnalyticsRole) => {
  const stepMeta = getOnboardingStepMeta('training');
  trackOnce('onboarding_step_viewed:training', () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_VIEWED, {
      ...stepMeta,
      user_role: role,
      onboarding_stage: 'training',
    });
  });
};

export const trackFirstStepsFinished = (
  role: OnboardingAnalyticsRole,
  completionPath: 'tour_done' | 'skipped',
) => {
  if (completionPath === 'tour_done') {
    trackOnboardingStepCompleted('training', role, 'training');
  } else {
    trackOnboardingStepSkipped('training', role, 'later', 'training');
  }

  trackOnboardingCompleted(role, {
    onboardingStage: 'completed',
    completionPath,
  });
};

export const trackFirstStepsFinishFailed = (role: OnboardingAnalyticsRole, error: unknown) => {
  trackOnboardingStepFailed('training', role, error, 'training');
};
