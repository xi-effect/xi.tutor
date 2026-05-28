import { useEditor, useValue } from '@ibodr/draw';
import type { DrShapeId } from '@ibodr/draw';

export function useIsShapeInViewport(shapeId: DrShapeId): boolean {
  const editor = useEditor();
  return useValue('isShapeInViewport', () => !editor.getCulledShapes().has(shapeId), [
    editor,
    shapeId,
  ]);
}
