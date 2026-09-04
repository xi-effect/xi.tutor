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

export type CommentRegionSize = {
  w: number;
  h: number;
};

export type CommentRegionRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Минимальный размер выделенной области комментария. */
export const MIN_REGION_SIZE = 16;

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
 * Если под точкой оказывается фигура — пин крепится к ней через локальное смещение
 * (двигается вместе с ней при переносе/повороте/масштабировании).
 *
 * Если передан `region` — это комментарий к области: `pagePoint` считается правым нижним
 * углом выделения, рамка не привязывается к фигуре (координаты страницы фиксированы).
 */
export function createCommentThreadAt(
  editor: Editor,
  pagePoint: { x: number; y: number },
  text: string,
  author: NewCommentAuthor,
  region?: CommentRegionSize,
): DrCommentThread {
  let shapeId: string | null = null;
  let offsetX: number | null = null;
  let offsetY: number | null = null;

  if (!region) {
    const hitShape = editor.getShapeAtPoint(pagePoint, { hitInside: true, margin: 0 });
    if (hitShape && !hitShape.isLocked) {
      const localPoint = editor.getPointInShapeSpace(hitShape, pagePoint);
      shapeId = hitShape.id;
      offsetX = localPoint.x;
      offsetY = localPoint.y;
    }
  }

  const thread = createCommentThreadRecord({
    pageId: editor.getCurrentPageId(),
    x: pagePoint.x,
    y: pagePoint.y,
    w: region?.w,
    h: region?.h,
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

/**
 * Размер выделенной области треда, если он валиден: оба измерения — конечные положительные числа.
 * `null` — обычный точечный комментарий, либо в записи лежит мусор (NaN/Infinity/≤0), который
 * строгий валидатор `T.number` пропускает. Единая точка проверки для рендера и resize.
 */
export function getCommentRegionSize(thread: DrCommentThread): { w: number; h: number } | null {
  const { w, h } = thread;
  if (typeof w !== 'number' || typeof h !== 'number') return null;
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
  return { w, h };
}

/**
 * Новый прямоугольник области при перетаскивании угла `corner` в точку `cornerTarget`.
 * Противоположный угол зафиксирован, размеры клампятся по {@link MIN_REGION_SIZE}.
 * Единая точка правды: и живой предпросмотр (drag-хендлеры), и коммит в стор идут через неё.
 *
 * @param pin `x`/`y` — правый нижний угол области (он же пин), `w`/`h` — текущий размер.
 */
export function computeResizedRegion(
  pin: CommentRegionRect,
  corner: 'br' | 'tl',
  cornerTarget: { x: number; y: number },
): CommentRegionRect {
  if (corner === 'br') {
    const x = pin.x - pin.w;
    const y = pin.y - pin.h;
    return {
      x,
      y,
      w: Math.max(MIN_REGION_SIZE, cornerTarget.x - x),
      h: Math.max(MIN_REGION_SIZE, cornerTarget.y - y),
    };
  }
  const x = Math.min(cornerTarget.x, pin.x - MIN_REGION_SIZE);
  const y = Math.min(cornerTarget.y, pin.y - MIN_REGION_SIZE);
  return { x, y, w: pin.x - x, h: pin.y - y };
}

function commitResizedRegion(
  editor: Editor,
  threadId: RecordId<DrCommentThread>,
  corner: 'br' | 'tl',
  cornerTarget: { x: number; y: number },
): void {
  const thread = editor.store.get(threadId as never) as DrCommentThread | undefined;
  const size = thread && getCommentRegionSize(thread);
  if (!thread || !size) return;

  const r = computeResizedRegion(
    { x: thread.x, y: thread.y, w: size.w, h: size.h },
    corner,
    cornerTarget,
  );
  if (!Number.isFinite(r.w) || !Number.isFinite(r.h)) return;

  // Пин (x/y) = правый нижний угол = левый верхний + размер (для 'tl' не меняется).
  editor.store.put([{ ...thread, x: r.x + r.w, y: r.y + r.h, w: r.w, h: r.h }]);
}

/**
 * Коммитит resize перетаскиванием пина (правый нижний угол). Левый верхний угол зафиксирован.
 * Вызывается только для тредов с областью; точечные треды двигает {@link moveCommentThreadTo}.
 */
export function resizeCommentThreadRegionTo(
  editor: Editor,
  threadId: RecordId<DrCommentThread>,
  cornerTarget: { x: number; y: number },
): void {
  commitResizedRegion(editor, threadId, 'br', cornerTarget);
}

/** Коммитит resize перетаскиванием левого верхнего угла. Правый нижний (пин) зафиксирован. */
export function resizeCommentThreadRegionFromTopLeft(
  editor: Editor,
  threadId: RecordId<DrCommentThread>,
  cornerTarget: { x: number; y: number },
): void {
  commitResizedRegion(editor, threadId, 'tl', cornerTarget);
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

/**
 * Прямоугольник выделенной области треда в координатах страницы (левый верхний угол + размер).
 * `null`, если это обычный точечный комментарий без области.
 * Пин стоит в правом нижнем углу, поэтому левый верхний = пин − (w, h).
 *
 * @param pagePoint Позиция пина, если вызывающий код её уже посчитал (например, для того же
 * треда параллельно нужна и позиция пина, и рамка) — экономит повторный `getShape`-лукап
 * для тредов, привязанных к фигуре. По умолчанию считается внутри.
 */
export function getCommentThreadPageBounds(
  editor: Editor,
  thread: DrCommentThread,
  pagePoint: { x: number; y: number } = getCommentThreadPagePoint(editor, thread),
): { x: number; y: number; w: number; h: number } | null {
  const size = getCommentRegionSize(thread);
  if (!size) return null;
  return { x: pagePoint.x - size.w, y: pagePoint.y - size.h, w: size.w, h: size.h };
}

/**
 * Компенсация «недохвата» при drag: если объект схватили не за его опорную точку `origin`,
 * а рядом, курсор и объект должны двигаться синхронно — без прыжка объекта под курсор
 * на первом же `pointermove`. Вызвать один раз на `pointerdown`, дальше на каждый
 * `pointermove`/`pointerup` вызывать возвращённую функцию с клиентскими координатами курсора.
 */
export function createGrabOffsetTracker(
  editor: Editor,
  origin: { x: number; y: number },
  grabClientX: number,
  grabClientY: number,
): (clientX: number, clientY: number) => { x: number; y: number } {
  const grab0 = editor.screenToPage({ x: grabClientX, y: grabClientY });
  return (clientX, clientY) => {
    const p = editor.screenToPage({ x: clientX, y: clientY });
    return { x: origin.x + (p.x - grab0.x), y: origin.y + (p.y - grab0.y) };
  };
}
