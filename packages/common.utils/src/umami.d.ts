/**
 * Типы для Umami Analytics v2
 */
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      identify: (
        uniqueId: string | Record<string, unknown>,
        data?: Record<string, unknown>,
      ) => void;
    };
  }
}

export {};
