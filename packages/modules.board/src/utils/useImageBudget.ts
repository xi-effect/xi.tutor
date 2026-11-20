import { useLayoutEffect, useSyncExternalStore } from 'react';
import { boardImageBudget, IMAGE_LOW_QUALITY_PIXELS, type ImageQuality } from './imageBudget';

/**
 * Полная резкость, пока картинка влезает в общий бюджет декодированных пикселей.
 * Иначе уменьшенная копия. Серой карточки нет: картинка видна в обоих случаях.
 * Без ограничения (десктоп) сразу `full`.
 */
export function useImageQuality(id: string, fullCost: number): ImageQuality {
  const enabled = boardImageBudget.enabled;
  const quality = useSyncExternalStore(
    boardImageBudget.subscribe,
    () => (enabled ? boardImageBudget.quality(id) : 'full'),
    () => 'full' as const,
  );

  useLayoutEffect(() => {
    if (!enabled) return;
    boardImageBudget.requestQuality(id, fullCost, IMAGE_LOW_QUALITY_PIXELS);
  }, [id, fullCost, enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;
    return () => boardImageBudget.release(id);
  }, [id, enabled]);

  return enabled ? quality : 'full';
}
