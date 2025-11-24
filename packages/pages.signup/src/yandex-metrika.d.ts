/**
 * Типы для Яндекс.Метрики
 */
declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      target?: string | Record<string, unknown>,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export {};
