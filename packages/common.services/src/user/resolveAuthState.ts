import { isAuthFailureError, isTransientAuthCheckError } from './authCheckError';

export type ResolveAuthStateInput = {
  isAuthenticated: boolean | null;
  isSuccess: boolean;
  user: unknown;
  isFetching: boolean;
  error: unknown;
};

/**
 * Сессия живёт в cookie на бэкенде. Фронт знает о ней только по ответу home.
 * Короткий сетевой сбой (пока идёт retry) не считается выходом.
 * Когда ретраи закончились, а сессию так и не подтвердили — не держим спиннер:
 * это либо 401 без CORS-статуса, либо сеть так и не вернулась.
 */
export const resolveAuthState = ({
  isAuthenticated,
  isSuccess,
  user,
  isFetching,
  error,
}: ResolveAuthStateInput): boolean | null => {
  const isUnauthorized = isAuthFailureError(error);
  const isTransientError = isTransientAuthCheckError(error);

  if (isAuthenticated === false) return false;
  if (isSuccess && user) return true;
  if (isUnauthorized) {
    // После login() refetch ещё идёт: error может быть от прошлого 401 — не откатываем.
    if (isAuthenticated === true && isFetching) return true;
    return false;
  }
  if (isTransientError) {
    if (isAuthenticated === true) return true;
    if (isFetching) return null;
    return false;
  }
  if (isAuthenticated === true) return true;
  return isAuthenticated;
};
