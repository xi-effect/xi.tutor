import { RefObject, useLayoutEffect, useState } from 'react';

/** Числовой CSS-размер в px ("12px" → 12, "12.5px" → 12.5, "auto"/"" → 0). */
const parsePx = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Суммарный отступ снизу от fixed-элементов, невидимых обходу предков:
 * - `--calls-layout-bottom-offset` — нижняя панель навигации (Navigation.tsx);
 * - `--classroom-fab-offset` — плавающая кнопка страницы класса
 *   (ClassroomMobileActionButton.tsx), она `createPortal`-ится в document.body,
 *   поэтому не входит в цепочку `el.parentElement`.
 * Обе — CSS-переменные, наследуются от предка, который их выставил, вниз до `el`.
 */
const readBottomOffset = (el: HTMLElement): number => {
  const style = getComputedStyle(el);
  return (
    parsePx(style.getPropertyValue('--calls-layout-bottom-offset')) +
    parsePx(style.getPropertyValue('--classroom-fab-offset'))
  );
};

/** Обрезает ли элемент контент, выходящий за его нижний край — важна только ось Y. */
const clipsVertically = (style: CSSStyleDeclaration): boolean => style.overflowY !== 'visible';

/**
 * Предки `el`, обрезающие контент по вертикали (`overflow-y ≠ visible`) — реальные
 * границы, до которых `el` может тянуться, и узлы, чей ресайз нужно отслеживать.
 * Состав списка не пересчитываем между измерениями — предполагается, что overflow
 * у обёрток статичный (так и есть в текущей раскладке), меняются только их
 * padding/rect.
 */
const getClippingAncestors = (el: HTMLElement): HTMLElement[] => {
  const ancestors: HTMLElement[] = [];
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (clipsVertically(getComputedStyle(node))) ancestors.push(node);
  }
  return ancestors;
};

/**
 * Нижняя граница, до которой элемент может тянуться: content-box bottom ближайшего
 * предка из `clippingAncestors` (за вычетом его padding/border снизу), но не ниже
 * низа вьюпорта минус фиксированные bottom-элементы вне DOM-цепочки — см. `readBottomOffset`.
 */
const getAvailableBottom = (el: HTMLElement, clippingAncestors: HTMLElement[]): number => {
  let bottom = (window.visualViewport?.height ?? window.innerHeight) - readBottomOffset(el);

  for (const node of clippingAncestors) {
    const style = getComputedStyle(node);
    const inset = parsePx(style.paddingBottom) + parsePx(style.borderBottomWidth);
    bottom = Math.min(bottom, node.getBoundingClientRect().bottom - inset);
  }

  return bottom;
};

/**
 * Настраивает измерение доступной высоты `el` и её пересчёт при изменениях
 * (ResizeObserver на el/предков/соседа-шапки + resize окна/visualViewport),
 * коалесцированный в rAF. Вызывает `onChange` с новым значением. Возвращает
 * функцию очистки.
 *
 * Вынесено из хука отдельной функцией — так её можно протестировать (монтирование/
 * размонтирование, что ResizeObserver.disconnect и removeEventListener реально
 * вызываются) без рендера компонента и DOM: environment: 'node' в vitest.config.ts,
 * как и во всём остальном монорепозитории (jsdom/testing-library здесь нигде не
 * используются — не заводим их ради одного хука, см. __tests__/useFitViewportHeight.test.ts).
 *
 * Предполагается, что сам `el` — единственный скроллящийся элемент в цепочке (так
 * устроена раскладка страницы класса): скролл его предков не отслеживаем. Если
 * переиспользуют там, где предок тоже может скроллиться, понадобится ещё
 * `scroll`-слушатель.
 */
export const observeFitHeight = (
  el: HTMLElement,
  onChange: (height: number) => void,
): (() => void) => {
  const clippingAncestors = getClippingAncestors(el);

  let raf = 0;
  const measure = () => {
    raf = 0;
    const top = el.getBoundingClientRect().top;
    onChange(Math.max(0, Math.floor(getAvailableBottom(el, clippingAncestors) - top)));
  };
  // measure() применяет высоту на el через style у вызывающего компонента, а сам
  // el наблюдается ResizeObserver'ом — коалесцируем в rAF, чтобы не гонять layout
  // синхронно на каждый тик обсервера (и не поймать "ResizeObserver loop" в консоли).
  const scheduleMeasure = () => {
    if (!raf) raf = requestAnimationFrame(measure);
  };

  measure();

  const observer = new ResizeObserver(scheduleMeasure);
  // el наблюдаем не столько ради его собственной высоты (её меняем сами), сколько
  // на случай изменения его позиции/размера по причинам вне отслеживаемых предков.
  observer.observe(el);
  // Шапка секции (тулбар с фильтрами / кнопкой загрузки) — растёт, когда чипы
  // фильтров переносятся на вторую строку; меняет top у el, но не ловится ни
  // ResizeObserver(el), ни ресайзом окна.
  if (el.previousElementSibling) observer.observe(el.previousElementSibling);
  clippingAncestors.forEach((node) => observer.observe(node));

  window.addEventListener('resize', scheduleMeasure);
  // resize + visualViewport.resize уже покрывают orientationchange в современных
  // мобильных браузерах — отдельный listener не нужен.
  const visualViewport = window.visualViewport;
  visualViewport?.addEventListener('resize', scheduleMeasure);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    window.removeEventListener('resize', scheduleMeasure);
    visualViewport?.removeEventListener('resize', scheduleMeasure);
  };
};

/**
 * Явная высота для `parentRef` виртуализатора на планшетах/мобильных.
 *
 * `flex-1` не вычитает fixed-элементы (MobileBottomBar, ClassroomMobileActionButton —
 * оба вне DOM-цепочки, см. `readBottomOffset`), а `overflow-hidden` + `pb-*` на
 * обёртках вкладок и цепочка `h-full` внутри `SidebarInset` на этих ширинах могут
 * не давать корректную высоту. Считаем от верха элемента (`getBoundingClientRect().top`
 * уже учитывает Header, таб-бар, тулбар) до реальной нижней границы — см. `observeFitHeight`.
 */
export const useFitViewportHeight = (
  ref: RefObject<HTMLElement | null>,
  /** true — когда высоту нужно считать явно (например, isMobile у вызывающего компонента); false — доверяем flex-1. */
  enabled: boolean,
): number | undefined => {
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const el = ref.current;

    if (!enabled || !el) {
      setHeight(undefined);
      return;
    }

    return observeFitHeight(el, setHeight);
  }, [ref, enabled]);

  return height;
};
