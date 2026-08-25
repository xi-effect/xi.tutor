import { describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import {
  applySignupSuccessSideEffects,
  getSignupSuccessNavigation,
  handleSignupError,
} from '../signupFormLogic';

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

describe('getSignupSuccessNavigation', () => {
  it('ведёт на /welcome/email с search', () => {
    expect(getSignupSuccessNavigation({ invite: 'abc', from: 'invite' })).toEqual({
      to: '/welcome/email',
      search: { invite: 'abc', from: 'invite' },
    });
  });
});

describe('applySignupSuccessSideEffects', () => {
  it('пишет previousPath и вызывает цель метрики', () => {
    const setPreviousPath = vi.fn();
    const reachRegistrationGoal = vi.fn();

    applySignupSuccessSideEffects({ setPreviousPath, reachRegistrationGoal });

    expect(setPreviousPath).toHaveBeenCalledWith('/signup');
    expect(reachRegistrationGoal).toHaveBeenCalledOnce();
  });
});

describe('handleSignupError', () => {
  const t = (key: string) => key;

  it('мапит username already → поле username', () => {
    const setFormError = vi.fn();
    const toast = vi.fn();
    const setError = vi.fn();

    handleSignupError(axiosError(400, 'Username already registered'), {
      t,
      setFormError,
      toast,
      setError,
    });

    expect(setFormError).toHaveBeenCalledWith('username', { message: 'errors.username_exists' });
    expect(toast).toHaveBeenCalledWith('errors.username_exists');
    expect(setError).toHaveBeenCalledWith('errors.username_exists');
  });

  it('мапит email already → поле email', () => {
    const setFormError = vi.fn();
    const toast = vi.fn();
    const setError = vi.fn();

    handleSignupError(axiosError(400, 'Email already registered'), {
      t,
      setFormError,
      toast,
      setError,
    });

    expect(setFormError).toHaveBeenCalledWith('email', { message: 'errors.email_exists' });
    expect(setError).toHaveBeenCalledWith('errors.email_exists');
  });

  it('для прочих ошибок показывает unknown', () => {
    const setFormError = vi.fn();
    const toast = vi.fn();
    const setError = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleSignupError(axiosError(500), { t, setFormError, toast, setError });

    expect(setFormError).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('errors.unknown');
    expect(setError).toHaveBeenCalledWith('errors.unknown');
    consoleSpy.mockRestore();
  });
});
