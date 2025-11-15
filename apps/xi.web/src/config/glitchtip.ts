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
 * Получает HTTP статус код из ошибки
 */
const getHttpStatus = (event: ErrorEvent, hint: EventHint): number | null => {
  const originalException = hint.originalException;

  // Проверяем AxiosError напрямую
  if (
    originalException &&
    typeof originalException === 'object' &&
    'response' in originalException
  ) {
    const axiosError = originalException as { response?: { status?: number } };
    if (axiosError.response?.status) {
      return axiosError.response.status;
    }
  }

  // Проверяем в контексте ответа
  const responseStatus = event.contexts?.response?.status_code;
  if (responseStatus) {
    return responseStatus;
  }

  // Проверяем в extra данных
  const extra = event.extra as { response?: { status?: number } } | undefined;
  if (extra?.response?.status) {
    return extra.response.status;
  }

  // Проверяем в tags
  if (event.tags?.status_code) {
    return event.tags.status_code as number;
  }

  return null;
};

/**
 * Проверяет, является ли ошибка HTTP ошибкой с кодом 401
 */
const is401Error = (event: ErrorEvent, hint: EventHint): boolean => {
  const status = getHttpStatus(event, hint);
  if (status === 401) {
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
 * Проверяет, является ли ошибка некритичной HTTP ошибкой (4xx кроме 401)
 */
const isNonCritical4xxError = (event: ErrorEvent, hint: EventHint): boolean => {
  const status = getHttpStatus(event, hint);
  // Исключаем 4xx ошибки (кроме 401, которое уже обрабатывается отдельно)
  // 404, 403, 400 и т.д. обычно не критичны для мониторинга
  if (status && status >= 400 && status < 500 && status !== 401) {
    return true;
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

  // Исключаем некритичные 4xx ошибки (404, 403, 400 и т.д.)
  if (isNonCritical4xxError(event, hint)) {
    return null; // Не отправляем некритичные клиентские ошибки
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
    // Performance Monitoring - минимизируем до 1% транзакций в production
    tracesSampleRate: env.DEV ? 1.0 : 0.01,
    // Session Replay - минимизируем до 1% сессий в production
    replaysSessionSampleRate: env.DEV ? 1.0 : 0.01,
    // Реплеи при ошибках - оставляем 100% для эффективной отладки
    replaysOnErrorSampleRate: 1.0,
    // Сэмплирование ошибок - отправляем 60% ошибок для баланса между объемом и эффективностью
    sampleRate: env.DEV ? 1.0 : 0.7,
    // Фильтр ошибок перед отправкой
    beforeSend,
  });
};
