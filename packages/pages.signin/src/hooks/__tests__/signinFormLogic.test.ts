import { describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import {
  completeSigninSuccess,
  handleSigninError,
  resolveSigninRedirect,
} from '../signinFormLogic';

const axiosError = (status: number, detail?: string) => {
  const error = new AxiosError('fail');
  error.response = {
    status,
    data: detail !== undefined ? { detail } : {},
    statusText: 'Error',
    headers: {},
    config: {} as never,
  };
  return error;
};

describe('resolveSigninRedirect', () => {
  it('берёт внутренний redirect или /', () => {
    expect(resolveSigninRedirect('/calendar')).toBe('/calendar');
    expect(resolveSigninRedirect(undefined)).toBe('/');
  });

  it('разбирает same-origin URL и отбрасывает внешние', () => {
    const origin = 'https://app.sovlium.ru';
    expect(resolveSigninRedirect(`${origin}/classrooms/1`, origin)).toBe('/classrooms/1');
    expect(resolveSigninRedirect('https://evil.example/phish', origin)).toBe('/');
    expect(resolveSigninRedirect('//evil.example/phish', origin)).toBe('/');
  });
});

describe('handleSigninError', () => {
  it('ставит ошибку на email при User not found', () => {
    const setError = vi.fn();
    const toast = vi.fn();
    const t = (key: string) => key;

    handleSigninError(axiosError(401, 'User not found'), { t, setError, toast });

    expect(setError).toHaveBeenCalledWith('email', { message: 'errors.not_found_account' });
    expect(toast).toHaveBeenCalledWith('errors.not_found_account');
  });

  it('в invite-flow не показывает toast для User not found', () => {
    const setError = vi.fn();
    const toast = vi.fn();
    const t = (key: string) => key;

    const reason = handleSigninError(
      axiosError(401, 'User not found'),
      { t, setError, toast },
      {
        isInviteFlow: true,
      },
    );

    expect(reason).toBe('user_not_found');
    expect(setError).toHaveBeenCalledWith('email', { message: 'errors.not_found_account' });
    expect(toast).not.toHaveBeenCalled();
  });

  it('ставит ошибку на password при Wrong password', () => {
    const setError = vi.fn();
    const toast = vi.fn();
    const t = (key: string) => key;

    handleSigninError(axiosError(401, 'Wrong password'), { t, setError, toast });

    expect(setError).toHaveBeenCalledWith('password', { message: 'errors.not_found_password' });
    expect(toast).toHaveBeenCalledWith('errors.not_found_password');
  });

  it('показывает общий toast для 401 без известного detail и для 422', () => {
    const setError = vi.fn();
    const toast = vi.fn();
    const t = (key: string) => key;

    handleSigninError(axiosError(401, 'Other'), { t, setError, toast });
    expect(toast).toHaveBeenCalledWith('errors.error_signin');
    expect(setError).not.toHaveBeenCalled();

    toast.mockClear();
    handleSigninError(axiosError(422), { t, setError, toast });
    expect(toast).toHaveBeenCalledWith('errors.validation_error');
  });

  it('показывает общий toast для не-Axios ошибок', () => {
    const setError = vi.fn();
    const toast = vi.fn();
    handleSigninError(new Error('boom'), { t: (k) => k, setError, toast });
    expect(toast).toHaveBeenCalledWith('errors.error_signin');
  });
});

describe('completeSigninSuccess', () => {
  it('логинит, трекает umami при наличии user и редиректит', async () => {
    const login = vi.fn().mockResolvedValue({ id: 1 });
    const trackUmamiSession = vi.fn().mockResolvedValue(undefined);
    const navigate = vi.fn();

    await completeSigninSuccess({
      login,
      trackUmamiSession,
      navigate,
      redirect: '/materials',
    });

    expect(login).toHaveBeenCalledOnce();
    expect(trackUmamiSession).toHaveBeenCalledWith({ id: 1 }, 'signin');
    expect(navigate).toHaveBeenCalledWith({ to: '/materials' });
  });

  it('не трекает umami без user и уходит на /', async () => {
    const trackUmamiSession = vi.fn();
    const navigate = vi.fn();

    await completeSigninSuccess({
      login: vi.fn().mockResolvedValue(undefined),
      trackUmamiSession,
      navigate,
    });

    expect(trackUmamiSession).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith({ to: '/' });
  });
});
