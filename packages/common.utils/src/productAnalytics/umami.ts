import type { UmamiEventPayload } from './types';

function sanitizeUmamiPayload(
  payload?: UmamiEventPayload,
): Record<string, string | number | boolean> | undefined {
  if (!payload) return undefined;

  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    }
  }

  return result;
}

export function trackProductEvent(eventName: string, payload?: UmamiEventPayload): void {
  if (typeof window === 'undefined') return;

  type UmamiWindow = Window & {
    umami?: { track: (eventName: string, eventData?: Record<string, unknown>) => void };
  };

  const umami = (window as UmamiWindow).umami;
  if (!umami || typeof umami.track !== 'function') return;

  try {
    umami.track(eventName, sanitizeUmamiPayload(payload));
  } catch {
    // Аналитика не должна ломать пользовательский сценарий.
  }
}
