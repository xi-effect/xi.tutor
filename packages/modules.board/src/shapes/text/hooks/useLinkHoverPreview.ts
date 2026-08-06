import { useEffect, useRef, useState } from 'react';
import { Editor } from '@ibodr/draw';

export type LinkHoverPreviewT = {
  href: string;
  x: number;
  y: number;
  scale: number;
};

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
  const rects = link.getClientRects();
  for (let i = 0; i < rects.length; i += 1) {
    const rect = rects[i];
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return rect;
    }
  }
  return link.getBoundingClientRect();
};

export const useLinkHoverPreview = (editor: Editor | null): LinkHoverPreviewT | null => {
  const [hover, setHover] = useState<LinkHoverPreviewT | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) return;

    const container = editor.getContainer();
    let rafId = 0;

    const cancelPendingFrame = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const clearCloseTimer = () => {
      if (closeTimerRef.current != null) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };

    const scheduleClose = () => {
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setHover(null);
      }, CLOSE_DELAY_MS);
    };

    const pointerMoveHandler = (e: PointerEvent) => {
      if (rafId) return;

      const { document } = editor.getContainerWindow();

      rafId = requestAnimationFrame(() => {
        rafId = 0;

        const stack = document.elementsFromPoint(e.clientX, e.clientY);
        const link = stack.map((el) => el.closest('a')).find((el) => el != null);

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
            current.href === href &&
            Math.round(current.x) === Math.round(x) &&
            Math.round(current.y) === Math.round(rect.bottom)
              ? current
              : { href, x, y: rect.bottom, scale },
          );
          return;
        }

        const isOverPreview = stack.some((el) => el.closest(`[${LINK_HOVER_PREVIEW_ATTR}]`));
        if (isOverPreview) {
          clearCloseTimer();
          return;
        }

        scheduleClose();
      });
    };

    const pointerLeaveHandler = () => {
      cancelPendingFrame();
      clearCloseTimer();
      setHover(null);
    };

    container.addEventListener('pointermove', pointerMoveHandler);
    container.addEventListener('pointerleave', pointerLeaveHandler);

    return () => {
      cancelPendingFrame();
      clearCloseTimer();
      container.removeEventListener('pointermove', pointerMoveHandler);
      container.removeEventListener('pointerleave', pointerLeaveHandler);
    };
  }, [editor]);

  return hover;
};
