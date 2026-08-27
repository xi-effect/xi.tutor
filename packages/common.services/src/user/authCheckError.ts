const AUTH_FAILURE_STATUSES = new Set([401, 403]);
const TRANSIENT_NETWORK_CODES = new Set([
  'ERR_NETWORK',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_INTERNET_DISCONNECTED',
  'ECONNRESET',
]);

/** Первая попытка + 2 быстрых ретрая. Короткий обрыв 1–2 с ещё успевает, спиннер не висит. */
const MAX_TRANSIENT_RETRIES = 2;
const RETRY_DELAY_MS = 400;
const RETRY_DELAY_MAX_MS = 800;

export const CURRENT_USER_REQUEST_TIMEOUT_MS = 2000;

type ErrorLike = {
  code?: string;
  message?: string;
  response?: { status?: number };
  status?: number;
};

const asErrorLike = (error: unknown): ErrorLike => {
  if (!error || typeof error !== 'object') return {};
  return error as ErrorLike;
};

export const getHttpStatus = (error: unknown): number | undefined => {
  const err = asErrorLike(error);
  if (typeof err.response?.status === 'number') return err.response.status;
  if (typeof err.status === 'number') return err.status;
  const fromMessage = err.message?.match(/status code (\d+)/i);
  if (fromMessage) return Number(fromMessage[1]);
  return undefined;
};

export const isAuthFailureError = (error: unknown): boolean => {
  const status = getHttpStatus(error);
  return status !== undefined && AUTH_FAILURE_STATUSES.has(status);
};

/** Сбой проверки сессии, который не означает «пользователь разлогинен». */
export const isTransientAuthCheckError = (error: unknown): boolean => {
  if (!error) return false;
  return !isAuthFailureError(error);
};

export const shouldRetryCurrentUserQuery = (failureCount: number, error: unknown): boolean => {
  if (isAuthFailureError(error)) return false;

  const status = getHttpStatus(error);
  if (status !== undefined && status < 500) return false;

  const code = asErrorLike(error).code;
  if (code === 'ERR_CANCELED') return false;

  if (status === undefined && code && !TRANSIENT_NETWORK_CODES.has(code)) {
    return failureCount < 2;
  }

  return failureCount < MAX_TRANSIENT_RETRIES;
};

export const currentUserRetryDelay = (attemptIndex: number) =>
  Math.min(RETRY_DELAY_MS * 2 ** attemptIndex, RETRY_DELAY_MAX_MS);
