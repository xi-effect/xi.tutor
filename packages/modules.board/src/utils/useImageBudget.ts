import { useEffect, useSyncExternalStore } from 'react';
import { boardImageBudget, type ImageBudgetStatus } from './imageBudget';

/**
 * Место под картинку в общем бюджете декодированных пикселей.
 * `none` — решение ещё не принято (один кадр после монтирования), `denied` — места нет.
 * Без ограничения (десктоп) сразу `granted`: лишнего кадра ожидания нет.
 */
export function useImageBudget(id: string, cost: number, forced: boolean): ImageBudgetStatus {
  const status = useSyncExternalStore(
    boardImageBudget.subscribe,
    () => boardImageBudget.status(id),
    () => 'none' as const,
  );

  useEffect(() => {
    if (!boardImageBudget.enabled) return;
    boardImageBudget.request(id, cost, forced);
  }, [id, cost, forced]);

  useEffect(() => {
    if (!boardImageBudget.enabled) return;
    return () => boardImageBudget.release(id);
  }, [id]);

  return boardImageBudget.enabled ? status : 'granted';
}
