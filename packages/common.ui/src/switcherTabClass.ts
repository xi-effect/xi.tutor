/**
 * Цвета вкладок SwitcherAnimate.
 * Нельзя задавать text-gray-* без data-state — tabClassName идёт после стилей компонента
 * и перебивает text-gray-0 у активной вкладки.
 * data-state="active" | "inactive" — атрибут кнопки из @xipkg/switcher-animate.
 */
export const switcherTabClass =
  'data-[state=inactive]:text-gray-100 data-[state=inactive]:hover:text-gray-90 data-[state=active]:text-gray-0 data-[state=active]:hover:text-gray-10';
