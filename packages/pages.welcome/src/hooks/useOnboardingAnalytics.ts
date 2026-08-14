import { useEffect } from 'react';
import { useCurrentUser } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getOnboardingStepMeta,
  resolveOnboardingAnalyticsRole,
  trackOnce,
  trackOnboardingStarted,
  trackProductEvent,
  type OnboardingStepName,
} from 'common.utils';

export {
  trackOnboardingStepCompleted,
  trackOnboardingStepSkipped,
  trackOnboardingStepFailed,
  trackOnboardingStepBack,
  trackOnboardingCompleted,
  resolveOnboardingAnalyticsRole as resolveAnalyticsRole,
} from 'common.utils';

type UseOnboardingAnalyticsOptions = {
  step: OnboardingStepName;
};

/**
 * Трекает onboarding_started (один раз на activation_flow_id) и onboarding_step_viewed.
 * onboarding_started идёт через общий helper — не дублируется при remount / Strict Mode / смене шага.
 */
export const useOnboardingAnalytics = ({ step }: UseOnboardingAnalyticsOptions) => {
  const { data: user } = useCurrentUser();

  useEffect(() => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);
    const stepMeta = getOnboardingStepMeta(step);

    // Fallback для входа в onboarding мимо email-confirmation (тот же helper / тот же flow_id).
    trackOnboardingStarted(userRole, user?.onboarding_stage);

    trackOnce(`onboarding_step_viewed:${step}`, () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_VIEWED, {
        ...stepMeta,
        user_role: userRole,
        onboarding_stage: user?.onboarding_stage,
      });
    });
  }, [step, user?.default_layout, user?.onboarding_stage]);
};
