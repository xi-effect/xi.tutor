import { BaseRecord, createCustomRecordId, RecordId, T, type CustomRecordInfo } from '@ibodr/draw';
import { idValidator } from '@ibodr/schema';

/**
 * Тред комментария — «пин» на доске. Крепится либо к конкретной фигуре
 * (shapeId + offset в локальных координатах фигуры), либо к точке страницы (x, y).
 * Первое сообщение треда создаётся вместе с ним как отдельная запись `comment_message`.
 */
export interface DrCommentThread extends BaseRecord<'comment_thread', RecordId<DrCommentThread>> {
  pageId: string;
  /** Точка на странице — фолбэк-позиция, если shapeId не задан (или фигура удалена) */
  x: number;
  y: number;
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
  shapeId: string | null;
  offsetX: number | null;
  offsetY: number | null;
  authorId: string;
  authorName: string;
};

export function createCommentThreadRecord(input: NewCommentThreadInput): DrCommentThread {
  return {
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
