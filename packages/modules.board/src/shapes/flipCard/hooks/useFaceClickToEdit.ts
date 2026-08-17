import { useCallback, useRef } from 'react';
import { useEditor } from '@ibodr/draw';
import type { FlipCardShape } from '../FlipCardShape';
import { FACE_CLICK_THRESHOLD_PX } from '../consts';

export const useFaceClickToEdit = (
  id: FlipCardShape['id'],
  isEditing: boolean,
  startEditing: () => void,
) => {
  const editor = useEditor();
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const handleFacePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isEditing) return;
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
    },
    [isEditing],
  );

  const handleFacePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerDownPos.current;
      pointerDownPos.current = null;
      if (!start || isEditing) return;

      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx > FACE_CLICK_THRESHOLD_PX || dy > FACE_CLICK_THRESHOLD_PX) return;

      editor.setSelectedShapes([id]);
      requestAnimationFrame(() => startEditing());
    },
    [editor, id, isEditing, startEditing],
  );

  return { handleFacePointerDown, handleFacePointerUp };
};
