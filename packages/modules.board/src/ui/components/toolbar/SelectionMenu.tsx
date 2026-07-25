import { useCallback } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { Trash, Copy, Locked, Unlocked } from '@xipkg/icons';
import { MoreActionsMenu } from './MoreActionsMenu';
import { ColorPicker } from './ColorPicker';
import { useYjsContext } from '../../../providers/YjsProvider';
import { isMac } from '../../../utils';
import { BorderPicker } from '../../../shapes/geo';
import { CoordinateAxesSettingsPicker } from '../../../shapes/coordinate-axes';
import { useTranslation } from 'react-i18next';

const modKey = isMac ? '⌘' : 'Ctrl';

export const SelectionMenu = track(function SelectionMenu() {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const { isReadonly } = useYjsContext();

  const selectedShapes = editor.getSelectedShapes();
  const isLocked = selectedShapes.every((shape) => shape.isLocked);
  const isFrame = selectedShapes.length === 1 && selectedShapes[0].type === 'frame';
  const isGeo = selectedShapes.some((shape) => shape.type === 'xi-geo');
  const isCoordinateAxes =
    selectedShapes.length === 1 && selectedShapes[0].type === 'coordinate-axes';

  // --- Данные / вычисления (без ранних return) ---
  const selectedIds = editor.getSelectedShapeIds();
  const isSelect = editor.isIn('select');
  const isBrushing = editor.isIn('select.brushing');
  const isEditingShape = editor.isIn('select.editing_shape');
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
  // Скрываем меню в readonly режиме или если нет выделения
  if (isReadonly) return null;

  const shouldShow =
    selectedIds.length > 0 && isSelect && !isBrushing && !isEditingShape && !!screenBounds;

  if (!shouldShow) return null;

  // --- Перевод координат в систему контейнера ---
  const container = editor.getContainer();
  const rect = container.getBoundingClientRect();
  const localX = screenBounds!.x - rect.left;
  const localY = screenBounds!.y - rect.top;
  const centerX = localX + screenBounds!.width / 2;
  const topY = isFrame ? localY - 30 : localY - 16;

  return (
    <div
      className="border-border-default bg-background-surface pointer-events-auto absolute z-30 flex gap-2 rounded-xl border p-1 shadow-md"
      style={{
        left: centerX,
        top: topY,
        transform: 'translate(-50%, -100%)',
        transition: 'left 60ms linear, top 60ms linear',
      }}
      onPointerDown={(e) => {
        editor.markEventAsHandled(e);
        e.stopPropagation();
      }}
    >
      {isLocked ? (
        <>
          <Button
            variant="none"
            size="s"
            className="hover:bg-status-info-background p-1"
            onClick={() => {
              editor.toggleLock(selectedIds);
            }}
            title={t('toolbar.unlock', { modKey })}
          >
            <Unlocked />
          </Button>
          <MoreActionsMenu />
        </>
      ) : (
        <>
          <Button
            variant="none"
            size="s"
            className="hover:bg-status-info-background p-1"
            onClick={handleDuplicate}
            title={t('toolbar.duplicate')}
          >
            <Copy />
          </Button>
          <Button
            variant="none"
            size="s"
            className="hover:bg-status-info-background p-1"
            onClick={handleDelete}
            title={t('toolbar.delete')}
          >
            <Trash />
          </Button>
          <Button
            variant="none"
            size="s"
            className="hover:bg-status-info-background p-1"
            onClick={() => {
              editor.toggleLock(selectedIds);
            }}
            title={t('toolbar.lock', { modKey })}
          >
            <Locked />
          </Button>
          {isGeo && <BorderPicker />}
          {isCoordinateAxes && <CoordinateAxesSettingsPicker />}
          <ColorPicker />
          <MoreActionsMenu />
        </>
      )}
    </div>
  );
});
