import { useEffect } from 'react';
import { Editor } from '@ibodr/draw';
import { invokeAudioControlGesture } from '../shapes/audio/boardAudioGesture';

export const BOARD_CONTROL_SELECTOR = '[data-board-control], [data-audio-control]';

function findControl(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const control = target.closest(BOARD_CONTROL_SELECTOR);
  return control instanceof HTMLElement ? control : null;
}

function retargetPointer(
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  event: PointerEvent,
  control: HTMLElement,
) {
  control.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      button: event.button,
      buttons: event.buttons,
    }),
  );
}

/**
 * Кнопки внутри HTML-фигур сидят в карточке с pointer-events: none.
 * На мыши дочерний pointer-events: auto получает клик, на таче Huawei/Android
 * и iOS жест часто попадает в канвас: фигура едет, перемотка молчит.
 *
 * play() вызываем из исходного события. Повторно посланный PointerEvent
 * не считается жестом, и телефон глушит звук.
 */
export function useBoardControlPointer(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return;

    const container = editor.getContainer();
    let tracked: { pointerId: number; control: HTMLElement } | null = null;

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isTrusted) return;

      const fromEvent = findControl(event.target);
      if (fromEvent) {
        editor.markEventAsHandled(event);
        return;
      }

      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;

      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const control = findControl(hit);
      if (!control) return;

      editor.markEventAsHandled(event);
      const action = control.dataset.audioAction;

      if (action === 'play' || action === 'enable') {
        invokeAudioControlGesture(control, { clientX: event.clientX, clientY: event.clientY });
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      if (action === 'seek') {
        tracked = { pointerId: event.pointerId, control };
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          /* указатель уже перехвачен */
        }
      }

      retargetPointer('pointerdown', event, control);
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!event.isTrusted || !tracked || tracked.pointerId !== event.pointerId) return;
      editor.markEventAsHandled(event);
      retargetPointer('pointermove', event, tracked.control);
      event.preventDefault();
    };

    const finish = (event: PointerEvent, type: 'pointerup' | 'pointercancel') => {
      if (!event.isTrusted || !tracked || tracked.pointerId !== event.pointerId) return;
      const control = tracked.control;
      tracked = null;
      editor.markEventAsHandled(event);
      try {
        if (container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId);
        }
      } catch {
        /* захват уже снят */
      }
      retargetPointer(type, event, control);
    };

    const onPointerUp = (event: PointerEvent) => finish(event, 'pointerup');
    const onPointerCancel = (event: PointerEvent) => finish(event, 'pointercancel');

    container.addEventListener('pointerdown', onPointerDown, { capture: true });
    container.addEventListener('pointermove', onPointerMove, { capture: true });
    container.addEventListener('pointerup', onPointerUp, { capture: true });
    container.addEventListener('pointercancel', onPointerCancel, { capture: true });

    return () => {
      container.removeEventListener('pointerdown', onPointerDown, true);
      container.removeEventListener('pointermove', onPointerMove, true);
      container.removeEventListener('pointerup', onPointerUp, true);
      container.removeEventListener('pointercancel', onPointerCancel, true);
    };
  }, [editor]);
}
