import { cn } from '@xipkg/utils';

/** Семантические классы UI доски — следуют data-theme на html через @xipkg/tailwind */
export const boardPanelClass =
  'bg-background-surface border-border-default border rounded-xl lg:rounded-2xl';

export const boardMenuSurfaceClass = 'border-border-default bg-background-surface border';

/**
 * Пункты выпадающих меню доски.
 * У @xipkg/dropdown SubTrigger и CheckboxItem не задают базовый цвет — только hover/focus.
 */
export const boardMenuItemClass =
  'text-text-primary fill-icon-primary [&_svg]:fill-icon-primary hover:text-text-primary hover:fill-icon-primary hover:[&_svg]:fill-icon-primary focus:text-text-primary focus:fill-icon-primary focus:[&_svg]:fill-icon-primary data-[state=open]:bg-status-info-background data-[state=open]:text-text-link data-[state=open]:[&_svg]:fill-icon-brand';

/** CheckboxItem в @xipkg/dropdown рендерит lucide Check (stroke), не fill-иконки @xipkg/icons */
export const boardMenuCheckboxItemClass =
  'text-text-primary hover:text-text-primary focus:text-text-primary [&_svg]:fill-none [&_svg]:stroke-current';

/**
 * SubTrigger: слева fill-иконки @xipkg/icons, справа lucide ChevronRight (stroke).
 * boardMenuItemClass с [&_svg]:fill ломает стрелку и сбивает выравнивание в тёмной теме.
 */
export const boardMenuSubTriggerClass = cn(
  boardMenuItemClass,
  'flex items-center gap-2 p-1',
  '[&>svg:last-child]:!fill-none [&>svg:last-child]:shrink-0 [&>svg:last-child]:self-center [&>svg:last-child]:stroke-icon-primary',
  'hover:[&>svg:last-child]:!fill-none hover:[&>svg:last-child]:stroke-icon-primary',
  'focus:[&>svg:last-child]:!fill-none focus:[&>svg:last-child]:stroke-icon-primary',
  'data-[state=open]:[&>svg:last-child]:!fill-none data-[state=open]:[&>svg:last-child]:stroke-icon-brand',
);

/**
 * Иконки @xipkg/icons в тулбаре доски.
 * Svg по умолчанию theme=default → text-text-primary; часть path рисуется через currentColor,
 * часть — с захардкоженным fill. Выравниваем всё в text/fill gray-100.
 */
export const boardIconClass = 'text-text-primary! [&_path]:fill-current!';

/** Единый размер иконок в нижнем тулбаре доски */
export const boardToolbarIconClass = cn(boardIconClass, 'size-7! shrink-0 sm:size-6!');

/** Иконки с плотным глифом (текст, стикер) — визуально крупнее при том же box-size */
export const boardToolbarIconCompactClass = cn(
  boardToolbarIconClass,
  'scale-[0.8] sm:scale-[0.82]',
);

export const boardTextClass = 'text-text-primary';

/** z-index выпадающих меню и попапов поверх панелей доски (тулбар/зум — z-260) */
export const boardDropdownZClass = 'z-270';

/**
 * Строка в попапе доски. Нативный <button> без фона в тёмной теме даёт светлый buttonface,
 * а текст уже из семантической палитры — получается «белая плашка» с бледным текстом.
 */
export const boardPopoverListItemClass = cn(
  boardMenuItemClass,
  'bg-transparent hover:bg-background-page rounded-lg transition-colors',
);
