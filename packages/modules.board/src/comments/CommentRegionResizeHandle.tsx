import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useEditor } from '@ibodr/draw';
import {
  computeResizedRegion,
  createGrabOffsetTracker,
  getCommentRegionSize,
  resizeCommentThreadRegionFromTopLeft,
} from './commentQueries';
import { useCommentsUiStore } from './commentsUiStore';
import type { DrCommentThread } from './commentRecords';

/** Минимальное смещение указателя (px), после которого нажатие считается перетаскиванием. */
const DRAG_THRESHOLD = 4;

type CommentRegionResizeHandleProps = {
  thread: DrCommentThread;
  /** Экранные координаты левого верхнего угла рамки (px относительно контейнера канваса). */
  left: number;
  top: number;
};

/**
 * Ручка resize в левом верхнем углу выделенной области. Правый нижний угол (пин) при этом
 * зафиксирован — зеркально к перетаскиванию пина, где фиксируется левый верхний угол.
 * Показывается, только когда тред открыт (см. `CommentsOverlay`).
 */
export const CommentRegionResizeHandle = ({
  thread,
  left,
  top,
}: CommentRegionResizeHandleProps) => {
  const editor = useEditor();
  const setRegionDrag = useCommentsUiStore((s) => s.setRegionDrag);
  const abortRef = useRef<AbortController | null>(null);

  // Прерываем незавершённый жест и сбрасываем предпросмотр, если ручка исчезла в его середине
  // (тред закрыли/удалили) — pointercancel/pointerup в этом случае могут не прийти.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
      if (useCommentsUiStore.getState().regionDrag?.threadId === thread.id) setRegionDrag(null);
    },
    [thread.id, setRegionDrag],
  );

  const size = getCommentRegionSize(thread);
  if (!size) return null;

  const pinRect = { x: thread.x, y: thread.y, w: size.w, h: size.h };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const startX = e.clientX;
    const startY = e.clientY;
    let dragged = false;

    // Компенсация «недохвата»: цель угла = его позиция на старте + смещение курсора.
    const targetFor = createGrabOffsetTracker(
      editor,
      { x: thread.x - size.w, y: thread.y - size.h },
      e.clientX,
      e.clientY,
    );

    const ac = new AbortController();
    abortRef.current = ac;

    const finish = () => {
      ac.abort();
      abortRef.current = null;
      setRegionDrag(null);
    };

    window.addEventListener(
      'pointermove',
      (ev: PointerEvent) => {
        if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD) {
          return;
        }
        dragged = true;
        const r = computeResizedRegion(pinRect, 'tl', targetFor(ev.clientX, ev.clientY));
        setRegionDrag({ threadId: thread.id, x: r.x, y: r.y, w: r.w, h: r.h });
      },
      { signal: ac.signal },
    );

    window.addEventListener(
      'pointerup',
      (ev: PointerEvent) => {
        if (dragged) {
          resizeCommentThreadRegionFromTopLeft(
            editor,
            thread.id,
            targetFor(ev.clientX, ev.clientY),
          );
        }
        finish();
      },
      { signal: ac.signal },
    );

    // Браузер может забрать жест себе (скролл на тач-устройствах) — приходит pointercancel:
    // снимаем слушатели, размер не меняем.
    window.addEventListener('pointercancel', () => finish(), { signal: ac.signal });
  };

  return (
    <div
      data-comment-ui
      data-comment-region-handle
      onPointerDown={handlePointerDown}
      className="pointer-events-auto absolute z-31 flex size-6 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize touch-none items-center justify-center"
      style={{ left, top }}
    >
      <div className="border-border-focus bg-background-surface size-3 rounded-sm border-2 shadow-sm" />
    </div>
  );
};
