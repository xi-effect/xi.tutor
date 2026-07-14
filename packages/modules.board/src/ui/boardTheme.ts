import { cn } from '@xipkg/utils';

/** Семантические классы UI доски — следуют data-theme на html через @xipkg/tailwind */
export const boardPanelClass = 'bg-gray-0 border-gray-10 border rounded-xl lg:rounded-2xl';

export const boardMenuSurfaceClass = 'border-gray-10 bg-gray-0 border';

/**
 * Пункты выпадающих меню доски.
 * У @xipkg/dropdown SubTrigger и CheckboxItem не задают базовый цвет — только hover/focus.
 */
export const boardMenuItemClass =
  'text-gray-80 fill-gray-80 [&_svg]:fill-gray-80 hover:text-gray-100 hover:fill-gray-100 hover:[&_svg]:fill-gray-100 focus:text-gray-100 focus:fill-gray-100 focus:[&_svg]:fill-gray-100 data-[state=open]:bg-brand-0 data-[state=open]:text-brand-80 data-[state=open]:[&_svg]:fill-brand-80';

/** CheckboxItem в @xipkg/dropdown рендерит lucide Check (stroke), не fill-иконки @xipkg/icons */
export const boardMenuCheckboxItemClass =
  'text-gray-80 hover:text-gray-100 focus:text-gray-100 [&_svg]:fill-none [&_svg]:stroke-current';

/**
 * SubTrigger: слева fill-иконки @xipkg/icons, справа lucide ChevronRight (stroke).
 * boardMenuItemClass с [&_svg]:fill ломает стрелку и сбивает выравнивание в тёмной теме.
 */
export const boardMenuSubTriggerClass = cn(
  boardMenuItemClass,
  'flex items-center gap-2 p-1',
  '[&>svg:last-child]:!fill-none [&>svg:last-child]:shrink-0 [&>svg:last-child]:self-center [&>svg:last-child]:stroke-gray-80',
  'hover:[&>svg:last-child]:!fill-none hover:[&>svg:last-child]:stroke-gray-100',
  'focus:[&>svg:last-child]:!fill-none focus:[&>svg:last-child]:stroke-gray-100',
  'data-[state=open]:[&>svg:last-child]:!fill-none data-[state=open]:[&>svg:last-child]:stroke-brand-80',
);

/**
 * Иконки @xipkg/icons в тулбаре доски.
 * Svg по умолчанию theme=default → text-gray-80; часть path рисуется через currentColor,
 * часть — с захардкоженным fill. Выравниваем всё в text/fill gray-100.
 */
export const boardIconClass = 'text-gray-100! [&_path]:fill-current!';

export const boardTextClass = 'text-gray-100';

/**
 * Строка в попапе доски. Нативный <button> без фона в тёмной теме даёт светлый buttonface,
 * а текст уже из семантической палитры — получается «белая плашка» с бледным текстом.
 */
export const boardPopoverListItemClass = cn(
  boardMenuItemClass,
  'bg-transparent hover:bg-gray-5 rounded-lg transition-colors',
);
