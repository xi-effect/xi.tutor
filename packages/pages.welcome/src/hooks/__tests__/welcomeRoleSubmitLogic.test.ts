import { describe, expect, it, vi } from 'vitest';
import { runWelcomeRoleBack, runWelcomeRoleForward } from '../welcomeRoleSubmitLogic';

describe('runWelcomeRoleForward', () => {
  const base = {
    role: 'tutor' as const,
    userRole: 'tutor' as const,
    onboardingStage: 'default-layout',
    search: { invite: 'x' },
  };

  it('останавливается на ошибке updateProfile', async () => {
    const transitionForward = vi.fn();
    const result = await runWelcomeRoleForward({
      ...base,
      updateProfile: vi.fn().mockRejectedValue(new Error('fail')),
      transitionForward,
      trackFailed: vi.fn(),
      trackCompleted: vi.fn(),
      navigateAfterRole: vi.fn(),
    });

    expect(result).toBe('profile_failed');
    expect(transitionForward).not.toHaveBeenCalled();
  });

  it('на успехе завершает welcome', async () => {
    const navigateAfterRole = vi.fn();
    const trackCompleted = vi.fn();

    const result = await runWelcomeRoleForward({
      ...base,
      updateProfile: vi.fn().mockResolvedValue({}),
      transitionForward: vi.fn().mockResolvedValue({}),
      trackFailed: vi.fn(),
      trackCompleted,
      navigateAfterRole,
    });

    expect(result).toBe('ok');
    expect(trackCompleted).toHaveBeenCalledWith('role_selection', 'tutor', 'default-layout');
    expect(navigateAfterRole).toHaveBeenCalledWith({ invite: 'x' });
  });

  it('после сохранения роли шлёт onboarding_role_selected и не шлёт его при ошибке профиля', async () => {
    const trackRoleSelected = vi.fn();

    const failed = await runWelcomeRoleForward({
      ...base,
      userId: 7,
      updateProfile: vi.fn().mockRejectedValue(new Error('fail')),
      transitionForward: vi.fn(),
      trackFailed: vi.fn(),
      trackCompleted: vi.fn(),
      trackRoleSelected,
      navigateAfterRole: vi.fn(),
    });

    expect(failed).toBe('profile_failed');
    expect(trackRoleSelected).not.toHaveBeenCalled();

    const ok = await runWelcomeRoleForward({
      ...base,
      userId: 7,
      updateProfile: vi.fn().mockResolvedValue({}),
      transitionForward: vi.fn().mockResolvedValue({}),
      trackFailed: vi.fn(),
      trackCompleted: vi.fn(),
      trackRoleSelected,
      navigateAfterRole: vi.fn(),
    });

    expect(ok).toBe('ok');
    expect(trackRoleSelected).toHaveBeenCalledWith('tutor', 7);
  });
});

describe('runWelcomeRoleBack', () => {
  it('на успехе ведёт на user', async () => {
    const navigateToUser = vi.fn();
    const trackBack = vi.fn();

    const result = await runWelcomeRoleBack({
      userRole: 'student',
      onboardingStage: 'default-layout',
      transitionBack: vi.fn().mockResolvedValue({}),
      trackBack,
      trackFailed: vi.fn(),
      navigateToUser,
      search: {},
    });

    expect(result).toBe('ok');
    expect(trackBack).toHaveBeenCalledWith(
      'role_selection',
      'profile',
      'student',
      'default-layout',
    );
    expect(navigateToUser).toHaveBeenCalledWith({});
  });

  it('на ошибке transition трекает fail', async () => {
    const trackFailed = vi.fn();
    const result = await runWelcomeRoleBack({
      userRole: 'unknown',
      onboardingStage: 'default-layout',
      transitionBack: vi.fn().mockRejectedValue(new Error('back')),
      trackBack: vi.fn(),
      trackFailed,
      navigateToUser: vi.fn(),
      search: {},
    });

    expect(result).toBe('transition_failed');
    expect(trackFailed).toHaveBeenCalled();
  });
});
