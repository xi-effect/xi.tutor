/**
 * Высота рамки на sticky-обёртке в канбане.
 * `100%` — не выше ячейки строки (`relative h-full`).
 * `--schedule-scroll-client-px` — фактическая `clientHeight` зоны `overflow-y-auto`
 * (ставится из JS через ResizeObserver): иначе блок может оказаться выше видимой
 * области скролла — при нижнем ограничении sticky верх уходит за клип.
 * Fallback на `100cqh`, пока переменная не выставлена.
 */
export const scheduleEmptyBlockHeight = (): string =>
  'min(100%, var(--schedule-scroll-client-px, 100cqh))';
