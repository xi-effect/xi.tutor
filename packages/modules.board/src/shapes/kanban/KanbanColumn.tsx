import { Button } from '@xipkg/button';
import { Plus, Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import type { KanbanDropTarget } from './hooks/useKanbanDrag';
import type { KanbanColumn as KanbanColumnType } from './KanbanShape';
import { KANBAN_COLUMN_WIDTH } from './KanbanShape';
import { KanbanCardItem } from './KanbanCardItem';

type KanbanColumnProps = {
  column: KanbanColumnType;
  isInteractive: boolean;
  canDeleteColumn: boolean;
  draggingCardId: string | null;
  dropTarget: KanbanDropTarget | null;
  onRename: (title: string) => void;
  onAddCard: () => void;
  onDeleteColumn: () => void;
  onOpenCard: (cardId: string) => void;
  onDragStart: (event: React.PointerEvent<HTMLElement>, cardId: string, columnId: string) => void;
};

export function KanbanColumn({
  column,
  isInteractive,
  canDeleteColumn,
  draggingCardId,
  dropTarget,
  onRename,
  onAddCard,
  onDeleteColumn,
  onOpenCard,
  onDragStart,
}: KanbanColumnProps) {
  const isDropTarget = dropTarget?.columnId === column.id;

  return (
    <div
      data-kanban-column-id={column.id}
      className={cn(
        'bg-gray-5 pointer-events-auto flex h-full shrink-0 flex-col rounded-xl',
        isDropTarget && 'ring-brand-60 ring-2',
      )}
      style={{ width: KANBAN_COLUMN_WIDTH }}
    >
      <div className="border-gray-10 flex shrink-0 items-center gap-2 border-b px-3 py-2">
        {isInteractive ? (
          <input
            className="placeholder:text-gray-40 min-w-0 flex-1 bg-transparent text-sm font-semibold text-gray-100 outline-none"
            value={column.title}
            onChange={(event) => onRename(event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-100">
            {column.title}
          </span>
        )}
        <span className="text-gray-40 shrink-0 text-xs tabular-nums">{column.cards.length}</span>
        {isInteractive && canDeleteColumn ? (
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-gray-40 hover:text-red-80 hover:bg-gray-10 h-7 w-7 shrink-0 rounded-lg p-0"
            aria-label="Удалить колонку"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDeleteColumn();
            }}
          >
            <Trash className="size-3.5" />
          </Button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {column.cards.map((card, index) => (
          <div key={card.id} className="relative">
            {isDropTarget && dropTarget?.index === index ? (
              <div className="bg-brand-60 mb-2 h-1 rounded-full" />
            ) : null}
            <KanbanCardItem
              card={card}
              columnId={column.id}
              isInteractive={isInteractive}
              isDragging={draggingCardId === card.id}
              onOpen={() => onOpenCard(card.id)}
              onDragStart={onDragStart}
            />
          </div>
        ))}
        {isDropTarget && dropTarget?.index >= column.cards.length ? (
          <div className="bg-brand-60 h-1 rounded-full" />
        ) : null}
      </div>

      {isInteractive ? (
        <div className="border-gray-10 shrink-0 border-t p-2">
          <Button
            type="button"
            variant="none"
            size="s"
            className="text-gray-60 hover:bg-gray-10 h-9 w-full justify-center gap-1.5 rounded-lg text-sm font-normal hover:text-gray-100"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onAddCard();
            }}
          >
            <Plus className="size-4" />
            Добавить карточку
          </Button>
        </div>
      ) : null}
    </div>
  );
}
