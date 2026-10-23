import { describe, expect, it, vi } from 'vitest';
import { runWelcomeUserSubmit } from '../welcomeUserSubmitLogic';

describe('runWelcomeUserSubmit', () => {
  const base = {
    displayName: 'Иван',
    userRole: 'unknown' as const,
    onboardingStage: 'user-information',
    search: {},
    skipRoleStage: vi.fn(),
    navigateAfterWelcome: vi.fn(),
  };

  it('при ошибке профиля не делает transition', async () => {
    const trackFailed = vi.fn();
    const transitionToRoleStage = vi.fn();
    const navigateToRole = vi.fn();

    const result = await runWelcomeUserSubmit({
      ...base,
      updateProfile: vi.fn().mockRejectedValue(new Error('profile')),
      transitionToRoleStage,
      trackFailed,
      trackCompleted: vi.fn(),
      navigateToRole,
    });

    expect(result).toBe('profile_failed');
    expect(transitionToRoleStage).not.toHaveBeenCalled();
    expect(base.skipRoleStage).not.toHaveBeenCalled();
    expect(navigateToRole).not.toHaveBeenCalled();
    expect(trackFailed).toHaveBeenCalledWith(
      'profile',
      'unknown',
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
      transitionToRoleStage: vi.fn().mockRejectedValue(new Error('transition')),
      trackFailed,
      trackCompleted: vi.fn(),
      navigateToRole,
    });

    expect(result).toBe('transition_failed');
    expect(navigateToRole).not.toHaveBeenCalled();
    expect(trackFailed).toHaveBeenCalled();
  });

  it('без приглашения ведёт на выбор роли', async () => {
    const trackCompleted = vi.fn();
    const navigateToRole = vi.fn();
    const skipRoleStage = vi.fn();

    const result = await runWelcomeUserSubmit({
      ...base,
      search: { invite: '' },
      updateProfile: vi.fn().mockResolvedValue({}),
      transitionToRoleStage: vi.fn().mockResolvedValue({}),
      skipRoleStage,
      trackFailed: vi.fn(),
      trackCompleted,
      navigateToRole,
    });

    expect(result).toBe('ok');
    expect(trackCompleted).toHaveBeenCalledWith('profile', 'unknown', 'user-information');
    expect(navigateToRole).toHaveBeenCalledWith({ invite: '' });
    expect(skipRoleStage).not.toHaveBeenCalled();
  });

  it('с приглашением в url ставит ученика и пропускает выбор роли', async () => {
    const updateProfile = vi.fn().mockResolvedValue({});
    const transitionToRoleStage = vi.fn();
    const skipRoleStage = vi.fn().mockResolvedValue({});
    const trackRoleSelected = vi.fn();
    const trackCompleted = vi.fn();
    const navigateToRole = vi.fn();
    const navigateAfterWelcome = vi.fn();

    const result = await runWelcomeUserSubmit({
      ...base,
      userId: 7,
      inviteCode: 'abc',
      search: { invite: 'abc' },
      updateProfile,
      transitionToRoleStage,
      skipRoleStage,
      trackFailed: vi.fn(),
      trackCompleted,
      trackRoleSelected,
      navigateToRole,
      navigateAfterWelcome,
    });

    expect(result).toBe('ok');
    expect(updateProfile).toHaveBeenCalledWith({
      display_name: 'Иван',
      default_layout: 'student',
    });
    expect(trackRoleSelected).toHaveBeenCalledWith('student', 7);
    expect(skipRoleStage).toHaveBeenCalledOnce();
    expect(transitionToRoleStage).not.toHaveBeenCalled();
    expect(trackCompleted).toHaveBeenNthCalledWith(1, 'profile', 'student', 'user-information');
    expect(trackCompleted).toHaveBeenNthCalledWith(
      2,
      'role_selection',
      'student',
      'user-information',
    );
    expect(navigateAfterWelcome).toHaveBeenCalledOnce();
    expect(navigateToRole).not.toHaveBeenCalled();
  });

  it('при ошибке пропуска роли не уходит с шага имени', async () => {
    const navigateAfterWelcome = vi.fn();
    const navigateToRole = vi.fn();
    const trackFailed = vi.fn();

    const result = await runWelcomeUserSubmit({
      ...base,
      inviteCode: 'abc',
      updateProfile: vi.fn().mockResolvedValue({}),
      transitionToRoleStage: vi.fn(),
      skipRoleStage: vi.fn().mockRejectedValue(new Error('stage')),
      trackFailed,
      trackCompleted: vi.fn(),
      navigateToRole,
      navigateAfterWelcome,
    });

    expect(result).toBe('transition_failed');
    expect(trackFailed).toHaveBeenCalledWith(
      'role_selection',
      'student',
      expect.any(Error),
      'user-information',
    );
    expect(navigateAfterWelcome).not.toHaveBeenCalled();
    expect(navigateToRole).not.toHaveBeenCalled();
  });
});
