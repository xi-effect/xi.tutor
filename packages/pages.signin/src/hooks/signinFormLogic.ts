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

function isInternalAppPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

/** Куда увести после входа или если сессия уже жива. Внешние URL отбрасываем. */
export function resolveSigninRedirect(
  redirect?: string,
  origin = typeof window !== 'undefined' ? window.location.origin : undefined,
): string {
  if (!redirect) return '/';

  if (isInternalAppPath(redirect)) {
    return redirect;
  }

  try {
    const url = new URL(redirect);
    if (origin && url.origin === origin) {
      const path = `${url.pathname}${url.search}${url.hash}`;
      return isInternalAppPath(path) ? path : '/';
    }
  } catch {
    // не URL — на главную
  }

  return '/';
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
  login: () => Promise<unknown>;
  trackUmamiSession: TrackUmamiSession;
  navigate: (opts: { to: string }) => void;
  redirect?: string;
};

/** Успешный путь после signin(): login (уже refetch home) → umami → navigate. */
export async function completeSigninSuccess(deps: SigninSuccessDeps): Promise<void> {
  const user = await deps.login();
  if (user) {
    await deps.trackUmamiSession(user as Parameters<TrackUmamiSession>[0], 'signin');
  }

  deps.navigate({ to: resolveSigninRedirect(deps.redirect) });
}
