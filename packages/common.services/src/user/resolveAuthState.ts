import { isAuthFailureError, isTransientAuthCheckError } from './authCheckError';

export type ResolveAuthStateInput = {
  isAuthenticated: boolean | null;
  isSuccess: boolean;
  user: unknown;
  isError: boolean;
  isFetching: boolean;
  error: unknown;
};

/**
 * Сессия живёт в cookie на бэкенде. Фронт знает о ней только по ответу home.
 * Сетевой сбой этого запроса — не выход из аккаунта: оставляем проверку
 * незавершённой (null → экран загрузки) или сохраняем уже подтверждённую сессию.
 */
export const resolveAuthState = ({
  isAuthenticated,
  isSuccess,
  user,
  isError,
  isFetching,
  error,
}: ResolveAuthStateInput): boolean | null => {
  const isUnauthorized = isError && isAuthFailureError(error);
  const isTransientError = isError && isTransientAuthCheckError(error);

  if (isAuthenticated === false) return false;
  if (isSuccess && user) return true;
  // После login() refetch ещё идёт: isError может быть от прошлого 401 — не откатываем.
  if (isUnauthorized && !isFetching) return false;
  if (isTransientError) return isAuthenticated === true ? true : null;
  if (isAuthenticated === true) return true;
  return isAuthenticated;
};
