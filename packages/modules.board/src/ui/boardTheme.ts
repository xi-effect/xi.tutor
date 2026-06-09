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

export const boardIconClass = 'fill-gray-100';

export const boardTextClass = 'text-gray-100';
