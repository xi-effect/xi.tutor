import { useCallback, useRef, useState } from 'react';

const DRAG_THRESHOLD = 4;

type DragState = {
  cardId: string;
  sourceColumnId: string;
  pointerId: number;
  startX: number;
  startY: number;
  dragged: boolean;
};

export type KanbanDropTarget = {
  columnId: string;
  index: number;
};

type UseKanbanDragOptions = {
  isInteractive: boolean;
  onDrop: (
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetIndex: number,
  ) => void;
};

function resolveDropTarget(clientX: number, clientY: number): KanbanDropTarget | null {
  const element = document.elementFromPoint(clientX, clientY);
  const columnEl = element?.closest('[data-kanban-column-id]') as HTMLElement | null;
  if (!columnEl) return null;

  const columnId = columnEl.dataset.kanbanColumnId;
  if (!columnId) return null;

  const cardEls = columnEl.querySelectorAll('[data-kanban-card-id]');
  if (cardEls.length === 0) {
    return { columnId, index: 0 };
  }

  let index = cardEls.length;
  for (let i = 0; i < cardEls.length; i += 1) {
    const cardEl = cardEls[i];
    if (!(cardEl instanceof HTMLElement)) continue;
    const rect = cardEl.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      index = i;
      break;
    }
  }

  return { columnId, index };
}

export function useKanbanDrag({ isInteractive, onDrop }: UseKanbanDragOptions) {
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<KanbanDropTarget | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const justDraggedRef = useRef(false);

  const startCardDrag = useCallback(
    (event: React.PointerEvent<HTMLElement>, cardId: string, sourceColumnId: string) => {
      if (!isInteractive) return;
      if (event.button !== 0 && event.pointerType === 'mouse') return;

      event.stopPropagation();
      event.preventDefault();

      const state: DragState = {
        cardId,
        sourceColumnId,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        dragged: false,
      };
      dragStateRef.current = state;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const current = dragStateRef.current;
        if (!current || moveEvent.pointerId !== current.pointerId) return;

        const dx = moveEvent.clientX - current.startX;
        const dy = moveEvent.clientY - current.startY;

        if (!current.dragged && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

        current.dragged = true;
        setDraggingCardId(current.cardId);
        setDropTarget(resolveDropTarget(moveEvent.clientX, moveEvent.clientY));
      };

      const handlePointerUp = (upEvent: PointerEvent) => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        const current = dragStateRef.current;
        dragStateRef.current = null;

        if (current?.dragged) {
          const target = resolveDropTarget(upEvent.clientX, upEvent.clientY);
          if (target) {
            onDrop(current.cardId, current.sourceColumnId, target.columnId, target.index);
          }
          justDraggedRef.current = true;
          setTimeout(() => {
            justDraggedRef.current = false;
          }, 0);
        }

        setDraggingCardId(null);
        setDropTarget(null);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [isInteractive, onDrop],
  );

  const wasJustDragged = useCallback(() => justDraggedRef.current, []);

  return {
    draggingCardId,
    dropTarget,
    startCardDrag,
    wasJustDragged,
  };
}
