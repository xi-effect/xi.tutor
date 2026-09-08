import { BaseRecord, createCustomRecordId, RecordId, T, type CustomRecordInfo } from '@ibodr/draw';
import { idValidator } from '@ibodr/schema';

/**
 * Тред комментария — «пин» на доске. Крепится либо к конкретной фигуре
 * (shapeId + offset в локальных координатах фигуры), либо к точке страницы (x, y).
 * Первое сообщение треда создаётся вместе с ним как отдельная запись `comment_message`.
 */
export interface DrCommentThread extends BaseRecord<'comment_thread', RecordId<DrCommentThread>> {
  pageId: string;
  /** Точка на странице — фолбэк-позиция, если shapeId не задан (или фигура удалена).
   * Для комментария к области это правый нижний угол выделения (там же стоит пин). */
  x: number;
  y: number;
  /**
   * Размер выделенной области в координатах страницы.
   * Не заданы для обычного точечного пина — тогда рамка не рисуется.
   * Левый верхний угол области = (x - w, y - h).
   */
  w?: number;
  h?: number;
  /** Фигура, к которой прикреплён пин (null — пин привязан к точке страницы) */
  shapeId: string | null;
  /** Смещение в локальных координатах фигуры (валидно только вместе с shapeId) */
  offsetX: number | null;
  offsetY: number | null;
  resolved: boolean;
  createdAt: number;
  authorId: string;
  authorName: string;
}

/** Отдельное сообщение в треде. */
export interface DrCommentMessage extends BaseRecord<
  'comment_message',
  RecordId<DrCommentMessage>
> {
  threadId: RecordId<DrCommentThread>;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: number;
}

declare module '@ibodr/schema' {
  interface DrGlobalRecordPropsMap {
    comment_thread: DrCommentThread;
    comment_message: DrCommentMessage;
  }
}

const commentThreadValidator = T.object({
  id: idValidator<RecordId<DrCommentThread>>('comment_thread'),
  typeName: T.literal('comment_thread'),
  pageId: T.string,
  x: T.number,
  y: T.number,
  w: T.number.optional(),
  h: T.number.optional(),
  shapeId: T.string.nullable(),
  offsetX: T.number.nullable(),
  offsetY: T.number.nullable(),
  resolved: T.boolean,
  createdAt: T.number,
  authorId: T.string,
  authorName: T.string,
});

const commentMessageValidator = T.object({
  id: idValidator<RecordId<DrCommentMessage>>('comment_message'),
  typeName: T.literal('comment_message'),
  threadId: idValidator<RecordId<DrCommentThread>>('comment_thread'),
  text: T.string,
  authorId: T.string,
  authorName: T.string,
  createdAt: T.number,
});

/** Конфигурация для `createDrStore({ records })` — регистрирует оба типа записей в схеме доски. */
export const commentCustomRecords: Record<string, CustomRecordInfo> = {
  comment_thread: {
    scope: 'document',
    validator: commentThreadValidator,
  },
  comment_message: {
    scope: 'document',
    validator: commentMessageValidator,
  },
};

export function createCommentThreadId(): RecordId<DrCommentThread> {
  return createCustomRecordId('comment_thread') as RecordId<DrCommentThread>;
}

export function createCommentMessageId(): RecordId<DrCommentMessage> {
  return createCustomRecordId('comment_message') as RecordId<DrCommentMessage>;
}

type NewCommentThreadInput = {
  pageId: string;
  x: number;
  y: number;
  /** Размер выделенной области (комментарий к области). Оба значения задаются вместе. */
  w?: number;
  h?: number;
  shapeId: string | null;
  offsetX: number | null;
  offsetY: number | null;
  authorId: string;
  authorName: string;
};

export function createCommentThreadRecord(input: NewCommentThreadInput): DrCommentThread {
  const thread: DrCommentThread = {
    id: createCommentThreadId(),
    typeName: 'comment_thread',
    pageId: input.pageId,
    x: input.x,
    y: input.y,
    shapeId: input.shapeId,
    offsetX: input.offsetX,
    offsetY: input.offsetY,
    resolved: false,
    createdAt: Date.now(),
    authorId: input.authorId,
    authorName: input.authorName,
  };

  // Область пишем только если оба измерения — конечные положительные числа; иначе тред
  // остаётся точечным (строгий валидатор `T.number` всё равно отверг бы NaN/Infinity на put).
  if (
    Number.isFinite(input.w) &&
    Number.isFinite(input.h) &&
    (input.w as number) > 0 &&
    (input.h as number) > 0
  ) {
    thread.w = input.w;
    thread.h = input.h;
  }

  return thread;
}

type NewCommentMessageInput = {
  threadId: RecordId<DrCommentThread>;
  text: string;
  authorId: string;
  authorName: string;
};

export function createCommentMessageRecord(input: NewCommentMessageInput): DrCommentMessage {
  return {
    id: createCommentMessageId(),
    typeName: 'comment_message',
    threadId: input.threadId,
    text: input.text,
    authorId: input.authorId,
    authorName: input.authorName,
    createdAt: Date.now(),
  };
}
