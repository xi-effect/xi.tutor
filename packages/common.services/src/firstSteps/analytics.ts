import {
  PRODUCT_ANALYTICS_EVENTS,
  getOnboardingStepMeta,
  resetTrackOnceKeys,
  trackOnce,
  trackOnboardingCompleted,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
  trackOnboardingStepSkipped,
  trackProductEvent,
  type OnboardingAnalyticsRole,
} from 'common.utils';
import type { FirstStepId, FirstStepsRole } from './model';
import type { FirstStepsCallPhase } from './tour';

export type FirstStepsScreen = 'welcome' | 'checklist' | 'ready';

export type FirstStepsAction =
  'start' | 'open_step' | 'start_step' | 'review' | 'finish' | 'finish_early' | 'board_hint_home';

export type FirstStepsResolveSource = 'skip' | 'auto' | 'tour' | 'copy';

export type FirstStepsTourAction = 'started' | 'advanced' | 'finished' | 'closed';

const stage = 'training' as const;

const trackLegacyTourComplete = (role: OnboardingAnalyticsRole) => {
  if (typeof window === 'undefined') return;
  const umami = (
    window as Window & {
      umami?: { track: (name: string, data?: Record<string, unknown>) => void };
    }
  ).umami;
  if (!umami) return;
  umami.track('onboarding-complete', {
    layout: role === 'student' ? 'student' : 'tutor',
  });
};

export const trackFirstStepsViewed = (role: OnboardingAnalyticsRole) => {
  const stepMeta = getOnboardingStepMeta('training');
  trackOnce('onboarding_step_viewed:training', () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_VIEWED, {
      ...stepMeta,
      user_role: role,
      onboarding_stage: stage,
    });
  });
};

export const trackFirstStepsScreen = (
  role: OnboardingAnalyticsRole,
  screen: FirstStepsScreen,
  stepsResolved?: number,
  stepsTotal?: number,
) => {
  trackOnce(`first_steps_screen:${role}:${screen}`, () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_SCREEN_VIEWED, {
      screen,
      user_role: role,
      onboarding_stage: stage,
      ...(stepsResolved == null ? {} : { steps_resolved: stepsResolved }),
      ...(stepsTotal == null ? {} : { steps_total: stepsTotal }),
    });
  });
};

export const trackFirstStepsAction = (
  role: OnboardingAnalyticsRole,
  action: FirstStepsAction,
  step?: string,
) => {
  if (action === 'start') {
    trackOnce('activation_tutorial_started:first_steps', () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_TUTORIAL_STARTED, {
        screen: 'onboarding',
        reason: 'unknown',
        user_role: role,
        onboarding_stage: stage,
      });
    });
  }

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_ACTION, {
    action,
    user_role: role,
    onboarding_stage: stage,
    ...(step ? { step } : {}),
  });
};

export const trackFirstStepsStepResolved = (
  role: FirstStepsRole,
  step: FirstStepId,
  mark: 'done' | 'skipped',
  source: FirstStepsResolveSource,
) => {
  trackOnce(`first_steps_step:${role}:${step}:${mark}`, () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_STEP_RESOLVED, {
      step,
      mark,
      source,
      user_role: role,
      onboarding_stage: stage,
    });
  });
};

export const trackFirstStepsTour = (input: {
  role: FirstStepsRole;
  step: FirstStepId;
  action: FirstStepsTourAction;
  anchor?: string;
  stepIndex?: number;
  totalSteps?: number;
}) => {
  const send = () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_TOUR, {
      action: input.action,
      step: input.step,
      user_role: input.role,
      onboarding_stage: stage,
      ...(input.anchor ? { anchor: input.anchor } : {}),
      ...(input.stepIndex == null ? {} : { step_index: input.stepIndex }),
      ...(input.totalSteps == null ? {} : { total_steps: input.totalSteps }),
    });
  };

  if (input.action === 'started' || input.action === 'finished') {
    trackOnce(`first_steps_tour:${input.action}:${input.role}:${input.step}`, send);
    return;
  }

  send();
};

export const trackFirstStepsCallPhase = (role: FirstStepsRole, phase: FirstStepsCallPhase) => {
  trackOnce(`first_steps_call:${role}:${phase}`, () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_CALL_PHASE, {
      phase,
      user_role: role,
      onboarding_stage: stage,
    });
  });
};

export const trackFirstStepsDemoCabinet = (status: 'ready' | 'removed' | 'failed') => {
  trackOnce(`first_steps_demo:${status}`, () => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FIRST_STEPS_DEMO_CABINET, {
      status,
      user_role: 'tutor',
      onboarding_stage: stage,
    });
  });
};

export const trackFirstStepsHelp = (kind: 'wiki' | 'support') => {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_HELP_OPENED, {
    screen: 'onboarding',
    reason: kind === 'support' ? 'contact_support' : 'need_help',
    onboarding_stage: stage,
  });
};

export const trackFirstStepsFinished = (
  role: OnboardingAnalyticsRole,
  completionPath: 'tour_done' | 'skipped',
) => {
  if (completionPath === 'tour_done') {
    trackOnboardingStepCompleted('training', role, stage);
    trackOnce('activation_tutorial_completed:first_steps', () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_TUTORIAL_COMPLETED, {
        screen: 'onboarding',
        reason: 'unknown',
        user_role: role,
        onboarding_stage: stage,
      });
    });
    trackLegacyTourComplete(role);
  } else {
    trackOnboardingStepSkipped('training', role, 'later', stage);
  }

  trackOnboardingCompleted(role, {
    onboardingStage: 'completed',
    completionPath,
  });
};

export const trackFirstStepsFinishFailed = (role: OnboardingAnalyticsRole, error: unknown) => {
  trackOnboardingStepFailed('training', role, error, stage);
};

export const resetFirstStepsAnalyticsForTests = () => {
  resetTrackOnceKeys();
};
