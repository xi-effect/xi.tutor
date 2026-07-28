/** Базовые стили бейджа-категории (предмет, метка доступа и т.п.) */
export const categoryBadgeClass =
  'rounded-lg border-none px-2 py-1 font-medium text-s-base text-text-primary bg-background-subtle';

/** Статусы кабинета */
export const educationStatusBadgeClasses = {
  active: 'text-status-success-text bg-status-success-background',
  paused: 'text-tag-orange-accent bg-tag-orange-background',
  locked: 'text-text-danger bg-status-error-background',
  finished: 'text-text-primary bg-background-page',
} as const;

/** Статусы оплаты */
export const paymentStatusBadgeClasses = {
  complete: 'text-status-success-text bg-status-success-background',
  wf_receiver_confirmation: 'text-text-link bg-status-info-background',
  wf_sender_confirmation: 'text-tag-orange-accent bg-tag-orange-background',
} as const;

/** Режимы доступа к материалам */
export const materialAccessBadgeClasses = {
  read_write: categoryBadgeClass,
  read_only: 'text-tag-cyan-accent bg-tag-cyan-background',
  no_access: 'text-tag-violet-accent bg-tag-violet-background',
} as const;
