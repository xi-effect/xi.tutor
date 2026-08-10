import { AxiosError } from 'axios';
import type { UseFormSetError } from 'react-hook-form';
import { mapSignupError } from 'common.utils';
import type { FormData } from '../model/formSchema';

type Translate = (key: string) => string;

export type SignupSearch = {
  redirect?: string;
  invite?: string;
  from?: string;
};

export type SignupErrorUi = {
  t: Translate;
  setFormError: UseFormSetError<FormData>;
  toast: (message: string) => void;
  setError: (message: string) => void;
};

/** Куда вести после успешной регистрации. */
export function getSignupSuccessNavigation(search: SignupSearch) {
  return {
    to: '/welcome/email' as const,
    search: { ...search },
  };
}

/** Побочные эффекты успеха: previousPath + опциональная цель Метрики. */
export function applySignupSuccessSideEffects(options?: {
  setPreviousPath?: (path: string) => void;
  reachRegistrationGoal?: () => void;
}): void {
  options?.setPreviousPath?.('/signup');
  options?.reachRegistrationGoal?.();
}

/**
 * Обработка ошибки регистрации: field errors для username/email exists,
 * иначе общий toast.
 */
export function handleSignupError(err: unknown, ui: SignupErrorUi): void {
  const { t, setFormError, toast, setError } = ui;
  const failureReason = mapSignupError(err);

  if (failureReason === 'username_exists') {
    const message = t('errors.username_exists');
    setFormError('username', { message });
    toast(message);
    setError(message);
    return;
  }

  if (failureReason === 'email_exists') {
    const message = t('errors.email_exists');
    setFormError('email', { message });
    toast(message);
    setError(message);
    return;
  }

  if (err instanceof AxiosError && !err.response) {
    console.error('Сетевая ошибка при регистрации:', err);
  } else if (!(err instanceof AxiosError)) {
    console.error('Неизвестная ошибка:', err);
  } else if (!err.response?.data?.detail) {
    console.error('Неизвестная ошибка Axios:', err);
  }

  const message = t('errors.unknown');
  toast(message);
  setError(message);
}
