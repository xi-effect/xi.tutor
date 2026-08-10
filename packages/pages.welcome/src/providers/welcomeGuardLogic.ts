import type { OnboardingStageT } from 'common.api';
import { onboardingStageToPath } from '../utils/onboardingStageToPath';

export type WelcomeGuardInput = {
  onboardingStage: string | null | undefined;
  pathname: string;
  hasInvite: boolean;
};

export type WelcomeGuardAction = { type: 'none' } | { type: 'navigate'; to: string };

/**
 * Решение гардa welcome/onboarding: куда редиректить (или ничего не делать).
 * Используется ProtectedProvider; удобно покрывать unit-тестами до e2e.
 */
export function resolveWelcomeGuardAction(input: WelcomeGuardInput): WelcomeGuardAction {
  const { onboardingStage, pathname, hasInvite } = input;
  const isInWelcomeProcess = pathname.startsWith('/welcome');

  if ((onboardingStage === 'completed' || onboardingStage === 'training') && isInWelcomeProcess) {
    return { type: 'navigate', to: '/' };
  }

  if (onboardingStage === 'completed') {
    return { type: 'none' };
  }

  if (hasInvite && pathname.startsWith('/invite/')) {
    return { type: 'none' };
  }

  const expectedPath = onboardingStage
    ? onboardingStageToPath[onboardingStage as OnboardingStageT]
    : undefined;

  if (!expectedPath) {
    return { type: 'none' };
  }

  if (pathname !== expectedPath) {
    return { type: 'navigate', to: expectedPath };
  }

  return { type: 'none' };
}
