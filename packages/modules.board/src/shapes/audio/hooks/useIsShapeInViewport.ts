import { useEditor, useValue } from 'tldraw';
import type { TLShapeId } from 'tldraw';

export function useIsShapeInViewport(shapeId: TLShapeId): boolean {
  const editor = useEditor();
  return useValue('isShapeInViewport', () => !editor.getCulledShapes().has(shapeId), [
    editor,
    shapeId,
  ]);
}
