/** Базовые стили бейджа-категории (предмет, метка доступа и т.п.) */
export const categoryBadgeClass =
  'rounded-lg border-none px-2 py-1 font-medium text-s-base text-gray-80 bg-gray-10 dark:bg-gray-20 dark:text-gray-90';

/** Статусы кабинета: в тёмной теме сохраняем палитру светлой */
export const educationStatusBadgeClasses = {
  active: 'text-green-80 bg-green-0 dark:bg-[#ECF8EC] dark:text-[#2E842E]',
  paused: 'text-orange-80 bg-orange-0 dark:bg-[#FBF3EE] dark:text-[#B85727]',
  locked: 'text-red-80 bg-red-0 dark:bg-[#FAEBEB] dark:text-[#C23939]',
  finished: 'text-gray-80 bg-gray-5 dark:bg-[#F7F7F7] dark:text-[#3D3E43]',
} as const;

/** Статусы оплаты: в тёмной теме сохраняем палитру светлой */
export const paymentStatusBadgeClasses = {
  complete: 'text-green-80 bg-green-0 dark:bg-[#ECF8EC] dark:text-[#2E842E]',
  wf_receiver_confirmation: 'text-brand-80 bg-brand-0 dark:bg-[#F3F4FC] dark:text-[#4554C9]',
  wf_sender_confirmation: 'text-orange-80 bg-orange-0 dark:bg-[#FBF3EE] dark:text-[#B85727]',
} as const;

/** Режимы доступа к материалам */
export const materialAccessBadgeClasses = {
  read_write: categoryBadgeClass,
  read_only: 'text-cyan-100 bg-cyan-20 dark:bg-[#EAF6FA] dark:text-[#257D9C]',
  no_access: 'text-violet-100 bg-violet-20 dark:bg-[#F3EBFA] dark:text-[#8330C4]',
} as const;
