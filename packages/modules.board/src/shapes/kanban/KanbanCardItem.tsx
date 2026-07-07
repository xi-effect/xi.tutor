import { cn } from '@xipkg/utils';
import { MenuDots } from '@xipkg/icons';
import type { KanbanCard } from './KanbanShape';

type KanbanCardItemProps = {
  card: KanbanCard;
  columnId: string;
  isInteractive: boolean;
  isDragging: boolean;
  onOpen: () => void;
  onDragStart: (event: React.PointerEvent<HTMLElement>, cardId: string, columnId: string) => void;
};

export function KanbanCardItem({
  card,
  columnId,
  isInteractive,
  isDragging,
  onOpen,
  onDragStart,
}: KanbanCardItemProps) {
  return (
    <div
      data-kanban-card-id={card.id}
      className={cn(
        'border-gray-10 bg-gray-0 flex overflow-hidden rounded-lg border shadow-sm select-none',
        isDragging && 'pointer-events-none opacity-35',
      )}
    >
      {isInteractive ? (
        <button
          type="button"
          className="text-gray-40 hover:text-gray-80 hover:bg-gray-5 pointer-events-auto flex w-7 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
          aria-label="Перетащить карточку"
          onPointerDown={(event) => onDragStart(event, card.id, columnId)}
        >
          <MenuDots className="size-4 rotate-90" />
        </button>
      ) : null}

      <button
        type="button"
        className={cn(
          'pointer-events-auto min-w-0 flex-1 p-3 text-left',
          isInteractive ? 'cursor-pointer' : 'cursor-default',
        )}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        {card.labels.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-1">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="rounded px-1.5 py-0.5 text-[11px] leading-none font-medium"
                style={{ backgroundColor: label.color }}
              >
                {label.text}
              </span>
            ))}
          </div>
        ) : null}
        <p className="line-clamp-2 text-sm leading-snug font-medium text-gray-100">{card.title}</p>
        {card.description ? (
          <p className="text-gray-60 mt-1 line-clamp-2 text-xs leading-snug">{card.description}</p>
        ) : null}
      </button>
    </div>
  );
}
