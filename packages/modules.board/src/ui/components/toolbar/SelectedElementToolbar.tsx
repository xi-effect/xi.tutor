import { useEffect, useMemo } from 'react';
import { Button } from '@xipkg/button';
import { Trash, Copy, MoreVert } from '@xipkg/icons';
import { useBoardStore } from '../../../store';
import { useIsStageScaling } from '../../../hooks';
import { ToolbarElement } from '../../../types';
import { useTrackedTransaction } from '../../../features';

export const SelectedElementToolbar = () => {
  const {
    selectedElementId,
    removeElement,
    selectElement,
    boardElements,
    isElementTransforming,
    selectToolbarPosition,
  } = useBoardStore();

  const { isScaling } = useIsStageScaling();

  const { executeTrackedTransaction } = useTrackedTransaction();

  useEffect(() => {
    const selectedExists = boardElements.some((el) => el.id === selectedElementId);
    if (!selectedExists && selectedElementId) {
      selectElement(null);
    }
  }, [boardElements, selectedElementId, selectElement]);

  const position = useMemo(() => {
    if (selectToolbarPosition && (selectToolbarPosition.x !== 0 || selectToolbarPosition.y !== 0)) {
      return selectToolbarPosition;
    }

    const toolbarElement = boardElements.find(
      (el) => el.id === 'toolbar' && el.type === 'toolbar',
    ) as ToolbarElement;

    return toolbarElement ? { x: toolbarElement.x || 0, y: toolbarElement.y || 0 } : { x: 0, y: 0 };
  }, [selectToolbarPosition, boardElements]);

  const handleDelete = useMemo(
    () => () => {
      if (selectedElementId) {
        executeTrackedTransaction(() => removeElement(selectedElementId));
        selectElement(null);
      }
    },
    [selectedElementId, executeTrackedTransaction, selectElement, removeElement],
  );

  if (!selectedElementId || isElementTransforming) {
    return null;
  }

  return (
    <div
      className="border-gray-10 bg-gray-0 absolute z-50 flex gap-2 rounded-xl border p-1"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(0, -100%)',
        opacity: isScaling ? 0 : 1,
        visibility: isScaling ? 'hidden' : 'visible',
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
};
