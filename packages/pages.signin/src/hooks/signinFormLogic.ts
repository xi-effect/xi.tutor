import { AxiosError } from 'axios';
import type { UseFormSetError } from 'react-hook-form';
import type { trackUmamiSession } from 'common.utils';
import type { FormData } from '../model/formSchema';

type Translate = (key: string) => string;

export type SigninErrorUi = {
  t: Translate;
  setError: UseFormSetError<FormData>;
  toast: (message: string) => void;
};

export function resolveSigninRedirect(redirect?: string): string {
  return redirect || '/';
}

/** Ветвление ошибок входа: setError на поле + toast. */
export function handleSigninError(error: unknown, ui: SigninErrorUi): void {
  const { t, setError, toast } = ui;

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const detail: unknown = error.response?.data?.detail;

    if (status === 401) {
      if (detail === 'User not found') {
        const message = t('errors.not_found_account');
        setError('email', { message });
        toast(message);
        return;
      }

      if (detail === 'Wrong password') {
        const message = t('errors.not_found_password');
        setError('password', { message });
        toast(message);
        return;
      }

      toast(t('errors.error_signin'));
      return;
    }

    if (status === 422) {
      toast(t('errors.validation_error'));
      return;
    }
  }

  toast(t('errors.error_signin'));
}

type TrackUmamiSession = typeof trackUmamiSession;

export type SigninSuccessDeps = {
  login: () => Promise<void>;
  refetchUser: () => Promise<{ data?: Parameters<TrackUmamiSession>[0] }>;
  trackUmamiSession: TrackUmamiSession;
  navigate: (opts: { to: string }) => void;
  redirect?: string;
};

/** Успешный путь после signin(): login → umami → navigate. */
export async function completeSigninSuccess(deps: SigninSuccessDeps): Promise<void> {
  await deps.login();

  const result = await deps.refetchUser();
  if (result.data) {
    await deps.trackUmamiSession(result.data, 'signin');
  }

  deps.navigate({ to: resolveSigninRedirect(deps.redirect) });
}
