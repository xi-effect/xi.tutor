import { useEffect, useRef } from 'react';
import { useEditor, startEditingShapeWithRichText, type DrEventInfo } from '@ibodr/draw';
import type { FlipCardShape } from '../FlipCardShape';
import { FACE_CLICK_THRESHOLD_PX } from '../consts';

export const useFaceClickToEdit = (id: FlipCardShape['id'], isEditing: boolean) => {
  const editor = useEditor();
  const faceRef = useRef<HTMLDivElement>(null);
  const pointerDownState = useRef<{
    x: number;
    y: number;
    pointerId: number;
    button: number;
    pointerType: string;
    shiftKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
  } | null>(null);

  useEffect(() => {
    const el = faceRef.current;
    if (!el) return;

    const onPointerDownCapture = (e: PointerEvent) => {
      if (isEditing) return;
      if (!el.contains(e.target as Node)) return;

      const wasAlreadySelected = editor.getOnlySelectedShapeId() === id;
      if (!wasAlreadySelected) return;

      pointerDownState.current = {
        x: e.clientX,
        y: e.clientY,
        pointerId: e.pointerId,
        button: e.button,
        pointerType: e.pointerType,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
      };
    };

    const onPointerUpWindow = (e: PointerEvent) => {
      const start = pointerDownState.current;
      pointerDownState.current = null;
      if (!start || isEditing) return;

      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx > FACE_CLICK_THRESHOLD_PX || dy > FACE_CLICK_THRESHOLD_PX) return;

      const shape = editor.getShape(id);
      if (!shape) return;

      const pagePoint = editor.screenToPage({ x: start.x, y: start.y });

      const info: DrEventInfo = {
        type: 'pointer',
        name: 'pointer_down',
        point: pagePoint,
        pointerId: start.pointerId,
        button: start.button,
        isPen: start.pointerType === 'pen',
        target: 'shape',
        shape,
        shiftKey: start.shiftKey,
        altKey: start.altKey,
        ctrlKey: start.ctrlKey,
        metaKey: start.metaKey,
        accelKey: start.ctrlKey || start.metaKey,
      };

      startEditingShapeWithRichText(editor, id, { info, selectAll: false });

      requestAnimationFrame(() => {
        editor.emit('place-caret', { shapeId: id, point: pagePoint });
      });
    };

    el.addEventListener('pointerdown', onPointerDownCapture, { capture: true });
    window.addEventListener('pointerup', onPointerUpWindow);

    return () => {
      el.removeEventListener('pointerdown', onPointerDownCapture, { capture: true });
      window.removeEventListener('pointerup', onPointerUpWindow);
    };
  }, [editor, id, isEditing]);

  return { faceRef };
};
