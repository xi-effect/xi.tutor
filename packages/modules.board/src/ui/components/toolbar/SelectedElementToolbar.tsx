import { useMemo } from 'react';
import { Button } from '@xipkg/button';
import { Trash, Copy, MoreVert } from '@xipkg/icons';
import { track, useEditor } from '@tldraw/tldraw';

export const SelectedElementToolbar = track(() => {
  const editor = useEditor();

  const selectedShapeIds = editor.getSelectedShapeIds();

  const handleDelete = useMemo(
    () => () => {
      if (selectedShapeIds.length > 0) {
        editor.deleteShapes(selectedShapeIds);
      }
    },
    [selectedShapeIds, editor],
  );

  // Получаем позицию для отображения тулбара
  const position = useMemo(() => {
    if (selectedShapeIds.length === 0) return { x: 0, y: 0 };

    const bounds = editor.getSelectionPageBounds();
    if (!bounds) return { x: 0, y: 0 };

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y;

    return {
      x: centerX,
      y: centerY,
    };
  }, [selectedShapeIds, editor]);

  if (selectedShapeIds.length === 0) {
    return null;
  }

  return (
    <div
      className="border-gray-10 bg-gray-0 absolute z-50 flex gap-2 rounded-xl border p-1"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <Button variant="ghost" size="s" className="p-1" onClick={handleDelete}>
        <Trash />
      </Button>
      <Button variant="ghost" size="s" className="p-1">
        <Copy />
      </Button>
      <Button variant="ghost" size="s" className="p-1">
        <MoreVert />
      </Button>
    </div>
  );
});
