import { useCallback, useState } from 'react';
import { useEditor } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import type { KanbanColumn as KanbanColumnType, KanbanShape } from './KanbanShape';
import {
  addCardToColumn,
  addColumn,
  createEmptyCard,
  createEmptyColumn,
  deleteColumn,
  getKanbanShapePropsAfterColumnsChange,
  moveCardInColumns,
  renameColumn,
} from './kanbanHelpers';
import { KanbanColumn as KanbanColumnComponent } from './KanbanColumn';
import { KanbanCardModal } from './KanbanCardModal';
import { useIsKanbanInteractive } from './hooks/useIsKanbanInteractive';
import { useKanbanDrag } from './hooks/useKanbanDrag';

type SelectedCard = {
  columnId: string;
  cardId: string;
};

type KanbanBoardProps = {
  shape: KanbanShape;
};

export function KanbanBoard({ shape }: KanbanBoardProps) {
  const editor = useEditor();
  const isInteractive = useIsKanbanInteractive(shape.id);
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);

  const updateColumns = useCallback(
    (columns: KanbanColumnType[]) => {
      editor.updateShape({
        id: shape.id,
        type: 'kanban',
        props: getKanbanShapePropsAfterColumnsChange(columns),
      });
    },
    [editor, shape.id],
  );

  const handleDrop = useCallback(
    (cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
      updateColumns(
        moveCardInColumns(shape.props.columns, cardId, sourceColumnId, targetColumnId, targetIndex),
      );
    },
    [shape.props.columns, updateColumns],
  );

  const { draggingCardId, dropTarget, startCardDrag, wasJustDragged } = useKanbanDrag({
    isInteractive,
    onDrop: handleDrop,
  });

  const handleAddColumn = () => {
    updateColumns(addColumn(shape.props.columns, createEmptyColumn()));
  };

  const selectedCardData = selectedCard
    ? shape.props.columns
        .find((column) => column.id === selectedCard.columnId)
        ?.cards.find((card) => card.id === selectedCard.cardId)
    : null;

  return (
    <div
      className="border-gray-10 bg-gray-0 flex h-full w-full flex-col overflow-hidden rounded-xl border shadow-md"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden p-3"
        style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
      >
        {shape.props.columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            isInteractive={isInteractive}
            canDeleteColumn={shape.props.columns.length > 1}
            draggingCardId={draggingCardId}
            dropTarget={dropTarget}
            onRename={(title) => updateColumns(renameColumn(shape.props.columns, column.id, title))}
            onAddCard={() =>
              updateColumns(addCardToColumn(shape.props.columns, column.id, createEmptyCard()))
            }
            onDeleteColumn={() => updateColumns(deleteColumn(shape.props.columns, column.id))}
            onOpenCard={(cardId) => {
              if (wasJustDragged()) return;
              setSelectedCard({ columnId: column.id, cardId });
            }}
            onDragStart={startCardDrag}
          />
        ))}

        {isInteractive ? (
          <Button
            type="button"
            variant="none"
            className="border-gray-10 text-gray-60 hover:border-gray-20 hover:bg-gray-5 pointer-events-auto h-full min-h-[160px] w-[272px] shrink-0 flex-col gap-2 rounded-xl border border-dashed text-sm font-normal hover:text-gray-100"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              handleAddColumn();
            }}
          >
            <Plus className="size-5" />
            Добавить колонку
          </Button>
        ) : null}
      </div>

      {selectedCard && selectedCardData ? (
        <KanbanCardModal
          open
          columnId={selectedCard.columnId}
          card={selectedCardData}
          columns={shape.props.columns}
          onOpenChange={(open) => {
            if (!open) setSelectedCard(null);
          }}
          onSave={(columns) => {
            updateColumns(columns);
          }}
        />
      ) : null}
    </div>
  );
}
