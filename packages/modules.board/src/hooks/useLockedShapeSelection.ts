import { useEffect } from 'react';
import { Editor } from 'tldraw';

export const useLockedShapeSelection = (editor: Editor | null) => {
  useEffect(() => {
    if (!editor) return;

    const container = editor.getContainer();

    const updateLockedSelectionAttribute = () => {
      const selectedShapes = editor.getSelectedShapes();
      const hasLockedSelection = selectedShapes.some((shape) => shape.isLocked);

      if (hasLockedSelection) {
        container.setAttribute('data-has-locked-selection', 'true');
      } else {
        container.removeAttribute('data-has-locked-selection');
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;

      const isInsideCanvas = target.closest('.tl-canvas');

      if (!isInsideCanvas) {
        return;
      }
      const currentTool = editor.getCurrentToolId();

      if (currentTool !== 'select') {
        return;
      }

      const point = editor.screenToPage({
        x: event.clientX,
        y: event.clientY,
      });

      const allShapesAtPoint = editor.getCurrentPageShapes().filter((shape) => {
        const bounds = editor.getShapePageBounds(shape.id);
        return bounds && bounds.containsPoint(point);
      });

      if (allShapesAtPoint.length === 0) return;

      allShapesAtPoint.sort((a, b) => {
        return a.index < b.index ? -1 : 1;
      });

      const topShape = allShapesAtPoint[allShapesAtPoint.length - 1];

      if (topShape.isLocked) {
        editor.select(topShape.id);
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const unsubscribe = editor.store.listen(() => {
      updateLockedSelectionAttribute();
    });

    container.addEventListener('pointerdown', handlePointerDown, { capture: true });

    updateLockedSelectionAttribute();

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      unsubscribe();
    };
  }, [editor]);
};
