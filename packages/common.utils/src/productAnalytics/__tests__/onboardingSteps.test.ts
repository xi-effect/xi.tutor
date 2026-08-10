import { describe, expect, it } from 'vitest';
import {
  getOnboardingStepMeta,
  mapOnboardingStageToStep,
  ONBOARDING_STEPS,
} from '../onboardingSteps';

describe('mapOnboardingStageToStep', () => {
  it('мапит backend stage в стабильный step', () => {
    expect(mapOnboardingStageToStep('email-confirmation')).toBe('email_confirmation');
    expect(mapOnboardingStageToStep('user-information')).toBe('profile');
    expect(mapOnboardingStageToStep('default-layout')).toBe('role_selection');
    expect(mapOnboardingStageToStep('completed')).toBe('completed');
  });

  it('возвращает undefined для пустого/неизвестного stage', () => {
    expect(mapOnboardingStageToStep(undefined)).toBeUndefined();
    expect(mapOnboardingStageToStep('unknown-stage')).toBeUndefined();
  });
});

describe('getOnboardingStepMeta', () => {
  it('считает индекс с 1 и total_steps', () => {
    expect(getOnboardingStepMeta('profile')).toEqual({
      step: 'profile',
      step_index: 2,
      total_steps: ONBOARDING_STEPS.length,
    });
  });
});
