import { describe, expect, it, vi } from 'vitest';
import { runStudentInviteRoleSkip, runWelcomeRoleForward } from '../welcomeRoleSubmitLogic';

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

describe('runStudentInviteRoleSkip', () => {
  it('ставит ученика, пропускает роль и уходит с welcome', async () => {
    const skipRoleStage = vi.fn().mockResolvedValue({});
    const navigateAfterWelcome = vi.fn();
    const trackCompleted = vi.fn();
    const trackRoleSelected = vi.fn();

    const result = await runStudentInviteRoleSkip({
      userId: 7,
      onboardingStage: 'user-information',
      updateProfile: vi.fn().mockResolvedValue({}),
      skipRoleStage,
      trackRoleSelected,
      trackFailed: vi.fn(),
      trackCompleted,
      navigateAfterWelcome,
    });

    expect(result).toBe('ok');
    expect(trackRoleSelected).toHaveBeenCalledWith('student', 7);
    expect(skipRoleStage).toHaveBeenCalledOnce();
    expect(trackCompleted).toHaveBeenCalledWith('role_selection', 'student', 'user-information');
    expect(navigateAfterWelcome).toHaveBeenCalledOnce();
  });

  it('при ошибке профиля не переходит дальше', async () => {
    const skipRoleStage = vi.fn();
    const result = await runStudentInviteRoleSkip({
      onboardingStage: 'user-information',
      updateProfile: vi.fn().mockRejectedValue(new Error('profile')),
      skipRoleStage,
      trackFailed: vi.fn(),
      trackCompleted: vi.fn(),
      navigateAfterWelcome: vi.fn(),
    });

    expect(result).toBe('profile_failed');
    expect(skipRoleStage).not.toHaveBeenCalled();
  });
});
