import { useEffect } from 'react';
import { Editor } from '@ibodr/draw';

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

      if (!target.closest('.dr-canvas')) return;
      if (editor.getCurrentToolId() !== 'select') return;

      // Не мешаем мультивыделению и стандартному select tool
      if (event.shiftKey || event.metaKey || event.ctrlKey) return;

      const point = editor.screenToPage({
        x: event.clientX,
        y: event.clientY,
      });

      const hitShape = editor.getShapeAtPoint(point, { hitLocked: true });
      if (!hitShape?.isLocked) return;

      editor.select(hitShape.id);
      event.preventDefault();
      event.stopPropagation();
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
