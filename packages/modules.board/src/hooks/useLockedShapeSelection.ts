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
      const point = editor.screenToPage({
        x: event.clientX,
        y: event.clientY,
      });

      const shapes = editor.getCurrentPageShapes();
      const lockedShapes = shapes.filter((s) => s.isLocked);

      let foundShape = null;

      for (const shape of lockedShapes) {
        const bounds = editor.getShapePageBounds(shape.id);
        if (bounds && bounds.containsPoint(point)) {
          foundShape = shape;
          break;
        }
      }

      if (foundShape) {
        editor.select(foundShape.id);
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
