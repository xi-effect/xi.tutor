import { useEffect } from 'react';
import { Editor } from '@ibodr/draw';

export const BOARD_CONTROL_SELECTOR = '[data-board-control], [data-audio-control]';

/**
 * Кнопки внутри HTML-фигур (аудио, файл, PDF) сидят в pointer-events: none
 * карточке. На мыши дочерний pointer-events: auto получает клик, на таче
 * Huawei/Android жест часто попадает в канвас: фигура двигается, кнопка молчит.
 */
export function useBoardControlPointer(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return;

    const container = editor.getContainer();

    const onPointerDown = (e: PointerEvent) => {
      const eventTarget = e.target as HTMLElement | null;
      const fromEvent = eventTarget?.closest?.(BOARD_CONTROL_SELECTOR) as HTMLElement | null;

      if (fromEvent) {
        editor.markEventAsHandled(e);
        return;
      }

      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;

      const hit = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const control = hit?.closest?.(BOARD_CONTROL_SELECTOR) as HTMLElement | null;
      if (!control) return;

      editor.markEventAsHandled(e);
      e.preventDefault();
      e.stopImmediatePropagation();

      control.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: e.clientX,
          clientY: e.clientY,
          pointerId: e.pointerId,
          pointerType: e.pointerType,
          button: 0,
          buttons: 1,
        }),
      );
    };

    container.addEventListener('pointerdown', onPointerDown, { capture: true });
    return () => container.removeEventListener('pointerdown', onPointerDown, { capture: true });
  }, [editor]);
}
