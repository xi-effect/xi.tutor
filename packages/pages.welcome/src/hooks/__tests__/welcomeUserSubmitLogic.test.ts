import { describe, expect, it, vi } from 'vitest';
import { runWelcomeUserSubmit } from '../welcomeUserSubmitLogic';

describe('runWelcomeUserSubmit', () => {
  const base = {
    displayName: 'Иван',
    userRole: 'tutor' as const,
    onboardingStage: 'user-information',
    search: { invite: 'abc' },
  };

  it('при ошибке профиля не делает transition', async () => {
    const trackFailed = vi.fn();
    const transitionForward = vi.fn();
    const navigateToRole = vi.fn();

    const result = await runWelcomeUserSubmit({
      ...base,
      updateProfile: vi.fn().mockRejectedValue(new Error('profile')),
      transitionForward,
      trackFailed,
      trackCompleted: vi.fn(),
      navigateToRole,
    });

    expect(result).toBe('profile_failed');
    expect(transitionForward).not.toHaveBeenCalled();
    expect(navigateToRole).not.toHaveBeenCalled();
    expect(trackFailed).toHaveBeenCalledWith(
      'profile',
      'tutor',
      expect.any(Error),
      'user-information',
    );
  });

  it('при ошибке transition трекает fail и не навигирует', async () => {
    const navigateToRole = vi.fn();
    const trackFailed = vi.fn();

    const result = await runWelcomeUserSubmit({
      ...base,
      updateProfile: vi.fn().mockResolvedValue({}),
      transitionForward: vi.fn().mockRejectedValue(new Error('transition')),
      trackFailed,
      trackCompleted: vi.fn(),
      navigateToRole,
    });

    expect(result).toBe('transition_failed');
    expect(navigateToRole).not.toHaveBeenCalled();
    expect(trackFailed).toHaveBeenCalled();
  });

  it('на успехе трекает completed и ведёт на role', async () => {
    const trackCompleted = vi.fn();
    const navigateToRole = vi.fn();

    const result = await runWelcomeUserSubmit({
      ...base,
      updateProfile: vi.fn().mockResolvedValue({}),
      transitionForward: vi.fn().mockResolvedValue({}),
      trackFailed: vi.fn(),
      trackCompleted,
      navigateToRole,
    });

    expect(result).toBe('ok');
    expect(trackCompleted).toHaveBeenCalledWith('profile', 'tutor', 'user-information');
    expect(navigateToRole).toHaveBeenCalledWith({ invite: 'abc' });
  });
});
