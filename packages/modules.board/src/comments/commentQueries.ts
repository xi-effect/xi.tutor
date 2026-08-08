import type { DrStore, Editor, RecordId } from '@ibodr/draw';
import {
  createCommentMessageRecord,
  createCommentThreadRecord,
  type DrCommentMessage,
  type DrCommentThread,
} from './commentRecords';

export type NewCommentAuthor = {
  authorId: string;
  authorName: string;
};

/** Все треды комментариев в сторе (на всех страницах — доска обычно использует одну страницу). */
export function getAllCommentThreads(store: DrStore): DrCommentThread[] {
  return store.query.records('comment_thread').get() as DrCommentThread[];
}

/** Все сообщения конкретного треда, отсортированные по времени создания. */
export function getThreadMessages(
  store: DrStore,
  threadId: RecordId<DrCommentThread>,
): DrCommentMessage[] {
  const all = store.query.records('comment_message').get() as DrCommentMessage[];
  return all.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Создаёт новый тред с точкой на странице + первым сообщением.
 * Если courseShapeId передан — пин крепится к фигуре через локальное смещение
 * (двигается вместе с ней при переносе/повороте/масштабировании).
 */
export function createCommentThreadAt(
  editor: Editor,
  pagePoint: { x: number; y: number },
  text: string,
  author: NewCommentAuthor,
): DrCommentThread {
  const hitShape = editor.getShapeAtPoint(pagePoint, { hitInside: true, margin: 0 });

  let shapeId: string | null = null;
  let offsetX: number | null = null;
  let offsetY: number | null = null;

  if (hitShape && !hitShape.isLocked) {
    const localPoint = editor.getPointInShapeSpace(hitShape, pagePoint);
    shapeId = hitShape.id;
    offsetX = localPoint.x;
    offsetY = localPoint.y;
  }

  const thread = createCommentThreadRecord({
    pageId: editor.getCurrentPageId(),
    x: pagePoint.x,
    y: pagePoint.y,
    shapeId,
    offsetX,
    offsetY,
    authorId: author.authorId,
    authorName: author.authorName,
  });

  const message = createCommentMessageRecord({
    threadId: thread.id,
    text,
    authorId: author.authorId,
    authorName: author.authorName,
  });

  editor.store.put([thread, message]);

  return thread;
}

export function addCommentReply(
  store: DrStore,
  threadId: RecordId<DrCommentThread>,
  text: string,
  author: NewCommentAuthor,
): void {
  const message = createCommentMessageRecord({
    threadId,
    text,
    authorId: author.authorId,
    authorName: author.authorName,
  });
  store.put([message]);
}

export function setCommentThreadResolved(
  store: DrStore,
  threadId: RecordId<DrCommentThread>,
  resolved: boolean,
): void {
  const thread = store.get(threadId as never) as DrCommentThread | undefined;
  if (!thread) return;
  store.put([{ ...thread, resolved }]);
}

export function deleteCommentThread(store: DrStore, threadId: RecordId<DrCommentThread>): void {
  const messages = getThreadMessages(store, threadId);
  store.remove([threadId as never, ...messages.map((m) => m.id as never)]);
}

/**
 * Удаляет одно сообщение треда (свой ответ). Если оно было единственным в треде —
 * удаляет и сам тред, так как треда без сообщений быть не должно.
 */
export function deleteCommentMessage(
  store: DrStore,
  threadId: RecordId<DrCommentThread>,
  messageId: RecordId<DrCommentMessage>,
): void {
  const messages = getThreadMessages(store, threadId);
  const isLast = messages.length <= 1;

  store.remove(isLast ? [threadId as never, messageId as never] : [messageId as never]);
}

/**
 * Перемещает уже созданный тред в новую точку страницы — вызывается при перетаскивании пина.
 * Как и при создании, если под точкой оказывается фигура — пин переанкеривается на неё локальным
 * смещением (снова начинает двигаться вместе с фигурой), иначе крепится к фиксированным координатам.
 */
export function moveCommentThreadTo(
  editor: Editor,
  threadId: RecordId<DrCommentThread>,
  pagePoint: { x: number; y: number },
): void {
  const thread = editor.store.get(threadId as never) as DrCommentThread | undefined;
  if (!thread) return;

  const hitShape = editor.getShapeAtPoint(pagePoint, { hitInside: true, margin: 0 });

  let shapeId: string | null = null;
  let offsetX: number | null = null;
  let offsetY: number | null = null;

  if (hitShape && !hitShape.isLocked) {
    const localPoint = editor.getPointInShapeSpace(hitShape, pagePoint);
    shapeId = hitShape.id;
    offsetX = localPoint.x;
    offsetY = localPoint.y;
  }

  editor.store.put([{ ...thread, x: pagePoint.x, y: pagePoint.y, shapeId, offsetX, offsetY }]);
}

/** Текущая позиция пина на странице — если пин крепится к фигуре, пересчитывается по её трансформу. */
export function getCommentThreadPagePoint(
  editor: Editor,
  thread: DrCommentThread,
): { x: number; y: number } {
  if (thread.shapeId && thread.offsetX != null && thread.offsetY != null) {
    const shape = editor.getShape(thread.shapeId as never);
    if (shape) {
      const transform = editor.getShapePageTransform(shape);
      return transform.applyToPoint({ x: thread.offsetX, y: thread.offsetY });
    }
  }
  return { x: thread.x, y: thread.y };
}
