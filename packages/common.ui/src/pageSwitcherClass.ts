import { cn } from '@xipkg/utils';

/** Track SwitcherAnimate на новых страницах (Materials / Payments / Classrooms). */
export const pageSwitcherTrackClass =
  'bg-background-subtle !h-auto w-full justify-start gap-0.5 rounded-[10px] p-1 sm:w-auto';

/** Вкладки SwitcherAnimate на новых страницах. */
export const pageSwitcherTabClass = cn(
  '!h-auto flex-1 items-center justify-center rounded-lg px-4 py-1.5 text-center text-base leading-5 font-medium sm:flex-none sm:items-start sm:justify-start sm:text-left',
  'data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-text-secondary',
  'data-[state=active]:text-text-primary data-[state=active]:hover:text-text-primary',
);

/** Индикатор активной вкладки SwitcherAnimate на новых страницах. */
export const pageSwitcherIndicatorClass =
  'rounded-lg bg-background-surface shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]';
