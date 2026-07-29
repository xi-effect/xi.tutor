import type { OnboardingStepName } from './types';

/** Стабильные имена шагов онбординга (не UI-тексты). */
export const ONBOARDING_STEPS = [
  'email_confirmation',
  'profile',
  'role_selection',
  'notifications',
  'training',
  'completed',
] as const satisfies readonly OnboardingStepName[];

const BACKEND_STAGE_TO_STEP: Record<string, OnboardingStepName> = {
  'email-confirmation': 'email_confirmation',
  'user-information': 'profile',
  'default-layout': 'role_selection',
  notifications: 'notifications',
  training: 'training',
  completed: 'completed',
};

export function mapOnboardingStageToStep(
  stage: string | undefined | null,
): OnboardingStepName | undefined {
  if (!stage) return undefined;
  return BACKEND_STAGE_TO_STEP[stage];
}

export function getOnboardingStepMeta(step: OnboardingStepName): {
  step: OnboardingStepName;
  step_index: number;
  total_steps: number;
} {
  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  return {
    step,
    step_index: stepIndex >= 0 ? stepIndex + 1 : 0,
    total_steps: ONBOARDING_STEPS.length,
  };
}
