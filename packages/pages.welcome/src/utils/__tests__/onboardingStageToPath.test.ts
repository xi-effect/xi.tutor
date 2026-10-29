import { describe, expect, it } from 'vitest';
import { onboardingStageToPath } from '../onboardingStageToPath';

describe('onboardingStageToPath', () => {
  it('мапит каждую стадию онбординга на путь', () => {
    expect(onboardingStageToPath['email-confirmation']).toBe('/welcome/email');
    expect(onboardingStageToPath['user-information']).toBe('/welcome/user');
    expect(onboardingStageToPath['default-layout']).toBe('/welcome/role');
    expect(onboardingStageToPath.training).toBe('/');
    expect(onboardingStageToPath.completed).toBe('/');
  });

  it('покрывает все ключи стадии', () => {
    expect(Object.keys(onboardingStageToPath).sort()).toEqual(
      ['completed', 'default-layout', 'email-confirmation', 'training', 'user-information'].sort(),
    );
  });
});
