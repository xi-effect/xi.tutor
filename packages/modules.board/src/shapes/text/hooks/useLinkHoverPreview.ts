import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@ibodr/draw';

export type LinkHoverPreviewT = {
  href: string;
  x: number;
  y: number;
  scale: number;
};
// TEST
/** Задержка перед закрытием превью — даёт время довести курсор от ссылки до самого превью. */
const CLOSE_DELAY_MS = 250;

/** Высота строки текста, для которой превью выглядит «как задумано» (масштаб = 1). */
const REFERENCE_LINE_HEIGHT_PX = 20;
const MIN_SCALE = 0.8;
const MAX_SCALE = 2.5;

/** Маркер DOM-узла превью — по нему отличаем наведение на само превью от наведения на ссылку. */
export const LINK_HOVER_PREVIEW_ATTR = 'data-link-hover-preview';

/**
 * Строка (line box) ссылки под точкой (x, y) — важно для переносящегося на несколько строк
 * текста, чтобы превью появлялось у той строки, над которой сейчас курсор, а не у всей ссылки
 * целиком. Если точка не попала ни в один client rect (пограничный случай), берём общий bbox.
 */
const getLinkLineRect = (link: HTMLAnchorElement, x: number, y: number): DOMRect => {
  const rects = Array.from(link.getClientRects());
  const targetRect = rects.find(
    (rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom,
  );
  return targetRect ?? link.getBoundingClientRect();
};

/**
 * Отслеживает ссылку (`<a>`), над которой сейчас находится курсор, внутри richText
 * у фигур на доске — для рендера всплывающего превью с адресом ссылки.
 *
 * @description Слушает `pointermove`/`pointerleave` на контейнере редактора и на каждый кадр
 * (через `requestAnimationFrame`) ищет ссылку под курсором с помощью `elementsFromPoint`.
 * Позиция превью пересчитывается по конкретной строке ссылки(`getLinkLineRect`),
 * чтобы корректно следовать за курсором при переносе текста на несколько строк.
 * Но обновление состояния пропускается, если значения не изменились (борьба с дрожанием
 * от пересоздания DOM-узла ссылки канвасом). Скрытие превью откладывается на `CLOSE_DELAY_MS`,
 * чтобы дать курсору время добраться до самого превью и кликнуть по ссылке в нём; наведение на
 * само превью (маркер `LINK_HOVER_PREVIEW_ATTR`) не двигает превью и не запускает закрытие.
 *
 * @param {Editor | null} editor - Экземпляр редактора доски или null
 * @returns {LinkHoverPreviewT | null} Данные для рендера превью (ссылка, позиция, масштаб)
 * или null, если курсор не наведён на ссылку
 */
export const useLinkHoverPreview = (editor: Editor | null): LinkHoverPreviewT | null => {
  const [hover, setHover] = useState<LinkHoverPreviewT | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const rafIdRef = useRef<number>(0);

  const cancelPendingFrame = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setHover(null);
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const pointerMoveHandler = useCallback(
    (e: PointerEvent) => {
      if (rafIdRef.current) return;

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = 0;

        const containerWindow = editor?.getContainerWindow();
        if (!containerWindow) {
          scheduleClose();
          return;
        }

        const { document } = containerWindow;
        const stack = Array.from(document.elementsFromPoint(e.clientX, e.clientY));

        if (stack.some((el) => el.closest(`[${LINK_HOVER_PREVIEW_ATTR}]`))) {
          clearCloseTimer();
          return;
        }

        const link = stack
          .find((el): el is HTMLAnchorElement => el.closest('a') !== null)
          ?.closest('a');

        if (link) {
          clearCloseTimer();

          const href = link.getAttribute('href');
          if (!href) return;

          // Пересчитываем на каждый кадр (не только при смене href) — иначе превью не
          // следует за курсором внутри одной ссылки, перенесённой на несколько строк.
          const rect = getLinkLineRect(link, e.clientX, e.clientY);

          // Центр строки ссылки — превью встаёт по центру текста, а не по точке курсора.
          const x = rect.left + rect.width / 2;

          // Растёт вместе с увеличенной/уменьшенной фигурой — иначе превью выглядит
          // непропорционально мелким на крупном тексте.
          const scale = Math.min(
            Math.max(rect.height / REFERENCE_LINE_HEIGHT_PX, MIN_SCALE),
            MAX_SCALE,
          );

          setHover((current) =>
            // Канвас может перерисовывать DOM-узел ссылки на каждый кадр — сравниваем по
            // значениям (не по ссылке на объект), чтобы не плодить лишние ре-рендеры/дрожание
            // из-за суб-пиксельных отличий, когда курсор фактически стоит на месте.
            current &&
            Object.is(current.href, href) &&
            Math.round(current.x) === Math.round(x) &&
            Math.round(current.y) === Math.round(rect.bottom)
              ? current
              : { href, x, y: rect.bottom, scale },
          );
          return;
        }

        scheduleClose();
      });
    },
    [editor, clearCloseTimer, scheduleClose],
  );

  const pointerLeaveHandler = useCallback(() => {
    cancelPendingFrame();
    clearCloseTimer();
    setHover(null);
  }, [cancelPendingFrame, clearCloseTimer]);

  useEffect(() => {
    if (!editor) return;

    const container = editor.getContainer();
    const controller = new AbortController();
    const { signal } = controller;

    container.addEventListener('pointermove', pointerMoveHandler, { signal });
    container.addEventListener('pointerleave', pointerLeaveHandler, { signal });

    return () => {
      controller.abort();
      cancelPendingFrame();
      clearCloseTimer();
    };
  }, [editor, pointerMoveHandler, pointerLeaveHandler, cancelPendingFrame, clearCloseTimer]);

  return hover;
};
