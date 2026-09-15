/**
 * Типы для Umami Analytics v2
 */
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
      identify: {
        (data: Record<string, unknown>): void;
        (uniqueId: string, data?: Record<string, unknown>): void;
      };
    };
    __sovliumFeedback?: {
      show: (type?: 'call' | 'board') => 'call' | 'board';
      resetCooldown: () => void;
    };
  }
}

export {};
