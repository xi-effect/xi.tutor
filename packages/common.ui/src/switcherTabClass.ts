/**
 * Цвета вкладок SwitcherAnimate.
 * Нельзя задавать text-gray-* без data-state — tabClassName идёт после стилей компонента
 * и перебивает text-text-on-accent у активной вкладки.
 * data-state="active" | "inactive" — атрибут кнопки из @xipkg/switcher-animate.
 */
export const switcherTabClass =
  'data-[state=inactive]:text-text-primary data-[state=inactive]:hover:text-text-primary data-[state=active]:text-text-on-accent data-[state=active]:hover:text-text-on-accent';
