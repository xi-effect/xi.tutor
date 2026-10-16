/**
 * Типы для Umami Analytics v3
 */
export {};

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      identify: {
        (data: Record<string, unknown>): void;
        (uniqueId: string, data?: Record<string, unknown>): void;
      };
    };
  }
}
