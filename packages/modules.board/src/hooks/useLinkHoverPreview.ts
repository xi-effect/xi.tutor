import { useEffect, useState } from 'react';
import { Editor } from '@ibodr/draw';
import { useThrottle } from './useThrottle';

export type LinkHoverPreviewT = {
  href: string;
  x: number;
  y: number;
};

const HOVER_THROTTLE_MS = 32;

export const useLinkHoverPreview = (editor: Editor | null): LinkHoverPreviewT | null => {
  const [hover, setHover] = useState<LinkHoverPreviewT | null>(null);
  const setHoverThrottled = useThrottle(setHover, HOVER_THROTTLE_MS);

  useEffect(() => {
    if (!editor) return;

    const container = editor.getContainer();
    let rafId = 0;

    const pointerMoveHandler = (e: PointerEvent) => {
      if (rafId) return;

      const { document } = editor.getContainerWindow();

      rafId = requestAnimationFrame(() => {
        rafId = 0;

        const stack = document.elementsFromPoint(e.clientX, e.clientY);
        const link = stack.map((el) => el.closest('a')).find((el) => el != null);
        const href = link?.getAttribute('href') ?? null;

        if (href) {
          setHoverThrottled({ href, x: e.clientX, y: e.clientY });
          return;
        }

        setHover((current) => (current === null ? current : null));
      });
    };

    const pointerLeaveHandler = () => setHover(null);

    const pointerDownCaptureHandler = (e: PointerEvent) => {
      const { document } = editor.getContainerWindow();
      const isOnLink = document
        .elementsFromPoint(e.clientX, e.clientY)
        .some((el) => el.closest('a'));
      if (!isOnLink) return;

      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener('pointermove', pointerMoveHandler);
    container.addEventListener('pointerleave', pointerLeaveHandler);
    container.addEventListener('pointerdown', pointerDownCaptureHandler, { capture: true });

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', pointerMoveHandler);
      container.removeEventListener('pointerleave', pointerLeaveHandler);
      container.removeEventListener('pointerdown', pointerDownCaptureHandler, { capture: true });
    };
  }, [editor, setHoverThrottled]);

  return hover;
};
