import { T, DrBaseShape } from '@ibodr/draw';
import { nanoid } from 'nanoid';

export function createDefaultColumns(): KanbanColumn[] {
  return [
    { id: nanoid(), title: 'К выполнению', cards: [] },
    { id: nanoid(), title: 'В работе', cards: [] },
    { id: nanoid(), title: 'Готово', cards: [] },
  ];
}

export const KANBAN_COLUMN_WIDTH = 272;
export const KANBAN_COLUMN_GAP = 12;
export const KANBAN_BOARD_PADDING = 12;
export const KANBAN_DEFAULT_WIDTH =
  KANBAN_BOARD_PADDING * 2 + 3 * KANBAN_COLUMN_WIDTH + 2 * KANBAN_COLUMN_GAP;
export const KANBAN_DEFAULT_HEIGHT = 480;
export const KANBAN_MIN_WIDTH = 320;
export const KANBAN_MIN_HEIGHT = 280;

export type KanbanCardLabel = {
  id: string;
  text: string;
  color: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  description: string;
  labels: KanbanCardLabel[];
};

export type KanbanColumn = {
  id: string;
  title: string;
  cards: KanbanCard[];
};

export type KanbanShapeProps = {
  w: number;
  h: number;
  columns: KanbanColumn[];
};

export type KanbanShape = DrBaseShape<'kanban', KanbanShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    kanban: KanbanShapeProps;
  }
}

const labelValidator = T.object({
  id: T.string,
  text: T.string,
  color: T.string,
});

const cardValidator = T.object({
  id: T.string,
  title: T.string,
  description: T.string,
  labels: T.arrayOf(labelValidator),
});

const columnValidator = T.object({
  id: T.string,
  title: T.string,
  cards: T.arrayOf(cardValidator),
});

const columnsValidator = {
  validate(value: unknown): KanbanColumn[] {
    if (value === undefined || value === null) return createDefaultColumns();
    return T.arrayOf(columnValidator).validate(value);
  },
  validateUsingKnownGoodVersion(_knownGood: KanbanColumn[], value: unknown): KanbanColumn[] {
    if (value === undefined || value === null) return createDefaultColumns();
    return T.arrayOf(columnValidator).validate(value);
  },
};

export const kanbanShapeProps = {
  w: T.number,
  h: T.number,
  columns: columnsValidator,
};

export const KANBAN_CARD_HEIGHT = 72;
export const KANBAN_COLUMN_HEADER_HEIGHT = 40;
export const KANBAN_ADD_CARD_BUTTON_HEIGHT = 36;
export const KANBAN_CARD_GAP = 8;

export function computeKanbanShapeHeight(columns: KanbanColumn[]): number {
  const maxCards = Math.max(0, ...columns.map((column) => column.cards.length));
  const cardsBlock =
    maxCards > 0 ? maxCards * KANBAN_CARD_HEIGHT + (maxCards - 1) * KANBAN_CARD_GAP : 0;

  return (
    KANBAN_BOARD_PADDING * 2 +
    KANBAN_COLUMN_HEADER_HEIGHT +
    cardsBlock +
    KANBAN_ADD_CARD_BUTTON_HEIGHT +
    16
  );
}
