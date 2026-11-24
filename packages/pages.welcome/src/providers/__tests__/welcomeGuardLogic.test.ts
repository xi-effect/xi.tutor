import { describe, expect, it } from 'vitest';
import { resolveWelcomeGuardAction } from '../welcomeGuardLogic';

describe('resolveWelcomeGuardAction', () => {
  it('с completed/training на /welcome/* ведёт на /', () => {
    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'completed',
        pathname: '/welcome/role',
        hasInvite: false,
      }),
    ).toEqual({ type: 'navigate', to: '/' });

    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'training',
        pathname: '/welcome/role',
        hasInvite: false,
      }),
    ).toEqual({ type: 'navigate', to: '/' });
  });

  it('не редиректит completed вне welcome', () => {
    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'completed',
        pathname: '/',
        hasInvite: false,
      }),
    ).toEqual({ type: 'none' });
  });

  it('не трогает invite-страницу при hasInvite', () => {
    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'user-information',
        pathname: '/invite/abc',
        hasInvite: true,
      }),
    ).toEqual({ type: 'none' });
  });

  it('уводит с /welcome/email, если почта уже подтверждена', () => {
    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'completed',
        pathname: '/welcome/email',
        hasInvite: false,
      }),
    ).toEqual({ type: 'navigate', to: '/' });

    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'training',
        pathname: '/welcome/email',
        hasInvite: false,
      }),
    ).toEqual({ type: 'navigate', to: '/' });

    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'user-information',
        pathname: '/welcome/email',
        hasInvite: false,
      }),
    ).toEqual({ type: 'navigate', to: '/welcome/role' });

    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'default-layout',
        pathname: '/welcome/email',
        hasInvite: false,
      }),
    ).toEqual({ type: 'navigate', to: '/welcome/role' });
  });

  it('оставляет на /welcome/email, пока почта не подтверждена', () => {
    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'email-confirmation',
        pathname: '/welcome/email',
        hasInvite: false,
      }),
    ).toEqual({ type: 'none' });
  });

  it('редиректит на expected path стадии', () => {
    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'email-confirmation',
        pathname: '/welcome/role',
        hasInvite: false,
      }),
    ).toEqual({ type: 'navigate', to: '/welcome/email' });

    expect(
      resolveWelcomeGuardAction({
        onboardingStage: 'default-layout',
        pathname: '/welcome/role',
        hasInvite: false,
      }),
    ).toEqual({ type: 'none' });
  });
});
