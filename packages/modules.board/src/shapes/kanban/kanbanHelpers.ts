import { nanoid } from 'nanoid';
import type { KanbanCard, KanbanCardLabel, KanbanColumn } from './KanbanShape';

export { createDefaultColumns } from './KanbanShape';

export function createEmptyCard(title = 'Новая карточка'): KanbanCard {
  return {
    id: nanoid(),
    title,
    description: '',
    labels: [],
  };
}

export function createEmptyColumn(title = 'Новая колонка'): KanbanColumn {
  return {
    id: nanoid(),
    title,
    cards: [],
  };
}

export function createLabel(text: string, color: string): KanbanCardLabel {
  return { id: nanoid(), text, color };
}

export function updateCardInColumns(
  columns: KanbanColumn[],
  columnId: string,
  cardId: string,
  patch: Partial<Omit<KanbanCard, 'id'>>,
): KanbanColumn[] {
  return columns.map((column) => {
    if (column.id !== columnId) return column;
    return {
      ...column,
      cards: column.cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card)),
    };
  });
}

export function deleteCardFromColumns(
  columns: KanbanColumn[],
  columnId: string,
  cardId: string,
): KanbanColumn[] {
  return columns.map((column) => {
    if (column.id !== columnId) return column;
    return {
      ...column,
      cards: column.cards.filter((card) => card.id !== cardId),
    };
  });
}

export function addCardToColumn(
  columns: KanbanColumn[],
  columnId: string,
  card: KanbanCard,
): KanbanColumn[] {
  return columns.map((column) => {
    if (column.id !== columnId) return column;
    return { ...column, cards: [...column.cards, card] };
  });
}

export function renameColumn(
  columns: KanbanColumn[],
  columnId: string,
  title: string,
): KanbanColumn[] {
  return columns.map((column) => (column.id === columnId ? { ...column, title } : column));
}

export function deleteColumn(columns: KanbanColumn[], columnId: string): KanbanColumn[] {
  return columns.filter((column) => column.id !== columnId);
}

export function addColumn(columns: KanbanColumn[], column: KanbanColumn): KanbanColumn[] {
  return [...columns, column];
}

export function moveCardInColumns(
  columns: KanbanColumn[],
  cardId: string,
  sourceColumnId: string,
  targetColumnId: string,
  targetIndex: number,
): KanbanColumn[] {
  const next = columns.map((column) => ({ ...column, cards: [...column.cards] }));

  const sourceColumn = next.find((column) => column.id === sourceColumnId);
  if (!sourceColumn) return columns;

  const sourceCardIndex = sourceColumn.cards.findIndex((card) => card.id === cardId);
  if (sourceCardIndex === -1) return columns;

  const [movedCard] = sourceColumn.cards.splice(sourceCardIndex, 1);

  const targetColumn = next.find((column) => column.id === targetColumnId);
  if (!targetColumn) return columns;

  let insertIndex = targetIndex;
  if (sourceColumnId === targetColumnId && sourceCardIndex < targetIndex) {
    insertIndex -= 1;
  }
  insertIndex = Math.max(0, Math.min(insertIndex, targetColumn.cards.length));
  targetColumn.cards.splice(insertIndex, 0, movedCard);

  return next;
}

export function getKanbanShapePropsAfterColumnsChange(columns: KanbanColumn[]) {
  return { columns };
}

export const KANBAN_LABEL_COLORS = [
  { id: 'blue', value: 'hsl(210, 80%, 90%)', text: 'hsl(210, 70%, 35%)' },
  { id: 'green', value: 'hsl(140, 60%, 88%)', text: 'hsl(140, 50%, 30%)' },
  { id: 'yellow', value: 'hsl(45, 90%, 88%)', text: 'hsl(35, 70%, 35%)' },
  { id: 'red', value: 'hsl(0, 75%, 92%)', text: 'hsl(0, 60%, 40%)' },
  { id: 'violet', value: 'hsl(270, 60%, 92%)', text: 'hsl(270, 50%, 38%)' },
] as const;
