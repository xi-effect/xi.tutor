import { getActivationFlowId } from './activationFlowId';
import type { ProductAnalyticsEventMap, TrackableEventName } from './eventMap';
import { FORBIDDEN_ANALYTICS_FIELDS } from './forbiddenFields';
import type { UmamiEventPayload } from './types';

const EVENT_VERSION = 1;

function isProductAnalyticsEnabled(): boolean {
  try {
    // Vitest / unit-тесты — по умолчанию выключено.
    if (import.meta.env?.MODE === 'test') {
      return import.meta.env?.VITE_ENABLE_PRODUCT_ANALYTICS === 'true';
    }

    // Явный opt-out для любого окружения.
    if (import.meta.env?.VITE_ENABLE_PRODUCT_ANALYTICS === 'false') {
      return false;
    }

    return true;
  } catch {
    return true;
  }
}

function sanitizeUmamiPayload(
  payload?: UmamiEventPayload,
): Record<string, string | number | boolean> | undefined {
  if (!payload) return undefined;

  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    if (FORBIDDEN_ANALYTICS_FIELDS.has(key)) continue;
    if (typeof value === 'object') continue;

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function withCommonProperties(
  payload?: UmamiEventPayload,
): Record<string, string | number | boolean> | undefined {
  const activationFlowId = getActivationFlowId();

  return sanitizeUmamiPayload({
    event_version: EVENT_VERSION,
    ...(activationFlowId ? { activation_flow_id: activationFlowId } : {}),
    ...payload,
  });
}

/**
 * Типизированная отправка продуктового события в Umami.
 * Автоматически добавляет event_version и activation_flow_id (если есть).
 */
export function trackProductEvent<T extends TrackableEventName>(
  eventName: T,
  properties: ProductAnalyticsEventMap[T],
): void;
/** @deprecated Используйте типизированный вызов с именем из PRODUCT_ANALYTICS_EVENTS. */
export function trackProductEvent(eventName: string, payload?: UmamiEventPayload): void;
export function trackProductEvent(eventName: string, payload?: UmamiEventPayload): void {
  if (typeof window === 'undefined') return;
  if (!isProductAnalyticsEnabled()) return;

  type UmamiWindow = Window & {
    umami?: { track: (eventName: string, eventData?: Record<string, unknown>) => void };
  };

  const umami = (window as UmamiWindow).umami;
  if (!umami || typeof umami.track !== 'function') return;

  try {
    umami.track(eventName, withCommonProperties(payload));
  } catch {
    // Аналитика не должна ломать пользовательский сценарий.
  }
}
