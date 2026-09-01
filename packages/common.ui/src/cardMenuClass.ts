import { cn } from '@xipkg/utils';

/** Кнопка «троеточие» на карточках кабинетов, шаблонов, учеников. */
export const cardMenuButtonClass =
  'hover:bg-background-subtle h-8 min-h-8 w-8 min-w-8 rounded-lg p-0';

/** Иконка типа, бейдж доступа и троеточие на карточках материалов и файлов — 36px. */
export const cardTypeIconBoxClass =
  'bg-status-info-background flex size-9 shrink-0 items-center justify-center rounded-[10px] [&>svg]:size-5 [&>svg]:fill-icon-brand';

export const cardAccessBadgeClass =
  'inline-flex h-9 max-h-9 min-h-9 min-w-0 shrink items-center truncate rounded-[10px] px-2.5 py-0 text-s-base leading-4 font-medium';

export const cardMaterialMenuButtonClass =
  'hover:bg-background-subtle size-9 min-h-9 min-w-9 rounded-lg p-0';

export const cardMenuIconClass = 'fill-icon-secondary dark:fill-icon-primary h-5 w-5';

/** Позиция меню в правом верхнем углу карточки с `p-5`. */
export const cardMenuPositionClass =
  'absolute top-5 right-5 z-10 flex size-8 items-center justify-center';

/** Поверхность выпадающего меню с троеточия — как у файлов. */
export const cardMenuSurfaceClass =
  'border-border-default bg-background-surface w-64 rounded-2xl border p-4 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)]';

export const cardMenuItemClass = cn(
  'text-text-primary flex h-10 items-center gap-2 rounded-lg px-3 text-sm leading-5 font-normal',
  'hover:bg-status-info-background hover:text-text-link focus:bg-status-info-background focus:text-text-link',
  'hover:font-medium focus:font-medium',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-icon-secondary',
  'hover:[&_svg]:fill-icon-brand focus:[&_svg]:fill-icon-brand',
);

/**
 * CheckboxItem из @xipkg/dropdown: галочка absolute left-2 + базовый pl-8.
 * cardMenuItemClass с px-3 сбивает отступ — текст наезжает на Check (lucide, stroke).
 */
export const cardMenuCheckboxItemClass = cn(
  'text-text-primary relative flex h-10 cursor-pointer items-center rounded-lg pr-3 pl-8 text-sm leading-5 font-normal',
  'hover:bg-status-info-background hover:text-text-link focus:bg-status-info-background focus:text-text-link',
  'hover:font-medium focus:font-medium',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current',
);

export const cardMenuDeleteItemClass = cn(
  'flex h-10 items-center gap-2 rounded-lg px-3 text-sm leading-5 font-normal',
  'text-text-danger hover:bg-status-error-background hover:text-text-danger',
  'focus:bg-status-error-background focus:text-text-danger',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-icon-danger',
  'hover:[&_svg]:fill-icon-danger focus:[&_svg]:fill-icon-danger',
);

export const cardMenuSeparatorClass = 'bg-border-default mx-0 my-2';

/**
 * SubTrigger из @xipkg/dropdown сам рисует lucide ChevronRight (stroke).
 * Пиним chevron абсолютом по центру строки.
 */
export const cardMenuSubTriggerClass = cn(
  cardMenuItemClass,
  'relative pr-8',
  'data-[state=open]:bg-status-info-background data-[state=open]:text-text-link data-[state=open]:font-medium data-[state=open]:[&_svg]:fill-icon-brand',
  '[&>svg:last-child]:pointer-events-none [&>svg:last-child]:absolute [&>svg:last-child]:top-1/2 [&>svg:last-child]:right-2',
  '[&>svg:last-child]:size-4 [&>svg:last-child]:!m-0 [&>svg:last-child]:-translate-y-1/2',
  '[&>svg:last-child]:!fill-none [&>svg:last-child]:shrink-0 [&>svg:last-child]:stroke-current',
);
