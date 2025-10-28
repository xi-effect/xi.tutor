import { useCallback } from 'react';
import { track, useEditor } from 'tldraw';
import { Button } from '@xipkg/button';
import { Trash, Copy, Unlocked } from '@xipkg/icons';
import { MoreActionsMenu } from './MoreActionsMenu';

export const SelectionMenu = track(function SelectionMenu() {
  const editor = useEditor();

  const selectedShapes = editor.getSelectedShapes();
  const isLocked = selectedShapes.every((shape) => shape.isLocked);

  // --- Данные / вычисления (без ранних return) ---
  const selectedIds = editor.getSelectedShapeIds();
  const isSelect = editor.isIn('select');
  const isBrushing = editor.isIn('select.brushing');
  const screenBounds = editor.getSelectionRotatedScreenBounds();

  // --- Обработчики (хуки всегда вызываются) ---
  const handleDuplicate = useCallback(() => {
    if (!selectedIds.length) return;
    editor.duplicateShapes(selectedIds);
  }, [editor, selectedIds]);

  const handleDelete = useCallback(() => {
    if (!selectedIds.length) return;
    editor.deleteShapes(selectedIds);
  }, [editor, selectedIds]);

  // --- Логика показа ПОСЛЕ хуков ---
  const shouldShow = selectedIds.length > 0 && isSelect && !isBrushing && !!screenBounds;

  if (!shouldShow) return null;

  // --- Перевод координат в систему контейнера ---
  const container = editor.getContainer();
  const rect = container.getBoundingClientRect();
  const localX = screenBounds!.x - rect.left;
  const localY = screenBounds!.y - rect.top;
  const centerX = localX + screenBounds!.width / 2;
  const topY = localY - 16;

  return (
    <div
      className="border-gray-10 bg-gray-0 absolute z-30 flex gap-2 rounded-xl border p-1 shadow-md"
      style={{
        left: centerX,
        top: topY,
        transform: 'translate(-50%, -100%)',
        transition: 'left 60ms linear, top 60ms linear',
      }}
    >
      {isLocked ? (
        <>
          <Button
            variant="ghost"
            size="s"
            className="hover:bg-brand-0 p-1"
            onClick={() => {
              editor.toggleLock(selectedIds);
            }}
            title="Разблокировать"
          >
            <Unlocked />
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="s"
            className="hover:bg-brand-0 p-1"
            onClick={handleDuplicate}
            title="Дублировать (Ctrl+D)"
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="s"
            className="hover:bg-brand-0 p-1"
            onClick={handleDelete}
            title="Удалить (Del)"
          >
            <Trash />
          </Button>
          <MoreActionsMenu />
        </>
      )}
    </div>
  );
});
