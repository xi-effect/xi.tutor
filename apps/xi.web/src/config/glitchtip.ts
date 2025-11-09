import * as Sentry from '@sentry/browser';
import type { ErrorEvent, EventHint } from '@sentry/browser';
import { env } from 'common.env';

/**
 * Проверяет, является ли ошибка CORS ошибкой
 */
const isCorsError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  // Проверяем типичные признаки CORS ошибок
  const corsIndicators = [
    'cors',
    'cross-origin',
    'failed to fetch',
    'networkerror',
    'network error',
    'access-control-allow-origin',
    'preflight',
    "no 'access-control-allow-origin'",
  ];

  return corsIndicators.some(
    (indicator) => errorMessage.includes(indicator) || errorName.includes(indicator),
  );
};

/**
 * Проверяет, является ли ошибка HTTP ошибкой с кодом 401
 */
const is401Error = (event: ErrorEvent, hint: EventHint): boolean => {
  const originalException = hint.originalException;

  // Проверяем AxiosError напрямую
  if (
    originalException &&
    typeof originalException === 'object' &&
    'response' in originalException
  ) {
    const axiosError = originalException as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      return true;
    }
  }

  // Проверяем в контексте ответа
  const responseStatus = event.contexts?.response?.status_code;
  if (responseStatus === 401) {
    return true;
  }

  // Проверяем в extra данных
  const extra = event.extra as { response?: { status?: number } } | undefined;
  if (extra?.response?.status === 401) {
    return true;
  }

  // Проверяем в tags
  if (event.tags?.status_code === 401) {
    return true;
  }

  // Проверяем в сообщении об ошибке
  const exception = event.exception?.values?.[0];
  if (exception?.value) {
    const errorMessage = exception.value.toLowerCase();
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return true;
    }
  }

  return false;
};

/**
 * Фильтр для исключения определенных ошибок из отправки в GlitchTip
 */
const beforeSend = (event: ErrorEvent, hint: EventHint): ErrorEvent | null => {
  const originalException = hint.originalException;

  // Исключаем CORS ошибки
  if (isCorsError(originalException)) {
    return null; // Не отправляем CORS ошибки
  }

  // Исключаем 401 ошибки
  if (is401Error(event, hint)) {
    return null; // Не отправляем 401 ошибки
  }

  return event;
};

/**
 * Инициализация GlitchTip (совместим с Sentry SDK)
 */
export const initGlitchTip = () => {
  // Инициализируем только если DSN указан
  if (!env.VITE_GLITCHTIP_DSN) {
    console.warn('GlitchTip DSN не указан. Мониторинг ошибок отключен.');
    return;
  }

  Sentry.init({
    dsn: env.VITE_GLITCHTIP_DSN,
    environment: env.DEV ? 'development' : 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: env.DEV ? 1.0 : 0.1,
    // Session Replay
    replaysSessionSampleRate: env.DEV ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Фильтр ошибок перед отправкой
    beforeSend,
  });
};
