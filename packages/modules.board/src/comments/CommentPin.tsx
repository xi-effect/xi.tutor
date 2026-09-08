import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Check } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { boardDropdownZClass, boardMenuSurfaceClass } from '../ui/boardTheme';
import { getCommentAuthorAvatarUrl } from './commentAvatar';
import {
  computeResizedRegion,
  createGrabOffsetTracker,
  getCommentRegionSize,
  getCommentThreadPagePoint,
  getThreadMessages,
  moveCommentThreadTo,
  resizeCommentThreadRegionTo,
} from './commentQueries';
import { useCommentsUiStore } from './commentsUiStore';
import { CommentThreadPanel } from './CommentThreadPanel';
import { useThreadUnread } from './useCommentReads';
import type { DrCommentThread } from './commentRecords';

type CommentPinProps = {
  thread: DrCommentThread;
  left: number;
  top: number;
};

/** Минимальное смещение указателя (px), после которого клик по пину считается перетаскиванием. */
const DRAG_THRESHOLD = 4;

export const CommentPin = track(function CommentPin({ thread, left, top }: CommentPinProps) {
  const editor = useEditor();
  const openThreadId = useCommentsUiStore((s) => s.openThreadId);
  const openThread = useCommentsUiStore((s) => s.openThread);
  const setHoveredThread = useCommentsUiStore((s) => s.setHoveredThread);
  const setRegionDrag = useCommentsUiStore((s) => s.setRegionDrag);
  const region = getCommentRegionSize(thread);
  const isRegion = region !== null;

  const dragAbortRef = useRef<AbortController | null>(null);

  // Пин исчез посреди жеста (тред удалили / сменили страницу): обрываем незавершённый drag и
  // снимаем подсветку/предпросмотр — pointerup/pointerleave в этом случае могут не прийти.
  useEffect(
    () => () => {
      dragAbortRef.current?.abort();
      const s = useCommentsUiStore.getState();
      if (s.hoveredThreadId === thread.id) setHoveredThread(null);
      if (s.regionDrag?.threadId === thread.id) setRegionDrag(null);
    },
    [thread.id, setHoveredThread, setRegionDrag],
  );

  const messages = getThreadMessages(editor.store, thread.id);
  const isUnread = useThreadUnread(thread.id, messages);
  const isOpen = openThreadId === thread.id;

  const lastMessage = messages[messages.length - 1];
  const lastAuthorId = lastMessage?.authorId ?? thread.authorId;
  const lastAuthorName = lastMessage?.authorName ?? thread.authorName;

  const [dragPos, setDragPos] = useState<{ left: number; top: number } | null>(null);
  const dragInfoRef = useRef<{
    startClientX: number;
    startClientY: number;
    startLeft: number;
    startTop: number;
    dragged: boolean;
  } | null>(null);
  const justDraggedRef = useRef(false);

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragInfoRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startLeft: left,
      startTop: top,
      dragged: false,
    };

    const ac = new AbortController();
    dragAbortRef.current = ac;

    // Компенсация «недохвата»: цель под курсором = опорная точка пина + смещение курсора
    // от точки захвата. Так пин/угол двигается ровно на смещение курсора, без прыжка на старте.
    const targetFor = createGrabOffsetTracker(
      editor,
      getCommentThreadPagePoint(editor, thread),
      e.clientX,
      e.clientY,
    );
    const containerRect = editor.getContainer().getBoundingClientRect();

    const endDrag = () => {
      ac.abort();
      dragAbortRef.current = null;
      dragInfoRef.current = null;
      setRegionDrag(null);
      setDragPos(null);
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const info = dragInfoRef.current;
      if (!info) return;
      const dx = moveEvent.clientX - info.startClientX;
      const dy = moveEvent.clientY - info.startClientY;
      if (!info.dragged && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      info.dragged = true;

      // Resize области за правый нижний угол, тянем пин(аватар).
      if (region) {
        // Держим левый верхний угол на месте и пересчитываем новый прямоугольник по цели, клампя размер снизу до MIN_REGION_SIZE
        // Переводим курсор в page-координаты и компенсируем «недохват» — угол двигается вровень с курсором.
        const r = computeResizedRegion(
          { x: thread.x, y: thread.y, w: region.w, h: region.h },
          'br',
          targetFor(moveEvent.clientX, moveEvent.clientY),
        );

        // Публикуем live-прямоугольник в стор — по нему `CommentsOverlay`,
        // рисует рамку и ручку resize, пока жест не завершён (запись в тред ещё не ушла).
        setRegionDrag({ threadId: thread.id, x: r.x, y: r.y, w: r.w, h: r.h });

        // Пересчитываем экранную позицию пина и обновляем `dragPos`.
        const corner = editor.pageToScreen({ x: r.x + r.w, y: r.y + r.h });
        setDragPos({ left: corner.x - containerRect.left, top: corner.y - containerRect.top });

        return;
      }

      setDragPos({ left: info.startLeft + dx, top: info.startTop + dy });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      const info = dragInfoRef.current;

      /**
       * Коммит перетаскивания — только если это был реальный drag (`info.dragged`), а не просто
       * клик по пину (клик без сдвига ниже DRAG_THRESHOLD открывает попап треда через сам Popover).
       *
       * `target` — та же компенсация «недохвата» через `targetFor`, что и в `handlePointerMove`,
       * применённая к точке отпускания курсора: пин/угол приземляется там же, где показывало превью.
       *
       * Дальше — ровно то ветвление, что и в превью: у треда с областью `target` это новый правый
       * нижний угол (`resizeCommentThreadRegionTo` держит левый верхний угол на месте), у точечного —
       * новая точка пина (`moveCommentThreadTo`, при необходимости переанкеривает на фигуру под ней).
       *
       * Коммит выполняется до `endDrag()` (сбрасывает `dragPos`/`regionDrag`) специально в этом
       * порядке: иначе между сбросом live-превью и обновлением стора будет кадр, в котором пин
       * рисуется в старой позиции.
       *
       * `justDraggedRef` — на один тик подавляет клик, который браузер генерирует следом за`pointerup`
       */
      if (info?.dragged) {
        const target = targetFor(upEvent.clientX, upEvent.clientY);
        if (isRegion) {
          resizeCommentThreadRegionTo(editor, thread.id, target);
        } else {
          moveCommentThreadTo(editor, thread.id, target);
        }
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 0);
      }

      endDrag();
    };

    window.addEventListener('pointermove', handlePointerMove, { signal: ac.signal });
    window.addEventListener('pointerup', handlePointerUp, { signal: ac.signal });
    window.addEventListener('pointercancel', () => endDrag(), { signal: ac.signal });
  };

  const pos = dragPos ?? { left, top };
  const pinTransform = isRegion ? 'translate(8px, -100%)' : 'translate(-50%, -100%)';

  return (
    <Popover open={isOpen} onOpenChange={(open) => openThread(open ? thread.id : null)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-comment-ui
          className={cn(
            'pointer-events-auto absolute z-30 flex size-8 touch-none items-center justify-center rounded-full border-2 shadow-md select-none hover:z-31',
            !dragPos && 'transition-transform hover:scale-110',
            dragPos && 'z-32',
            isRegion ? 'cursor-nwse-resize' : dragPos ? 'cursor-grabbing' : 'cursor-grab',
            thread.resolved
              ? 'border-border-control bg-action-secondary-background-pressed opacity-70'
              : 'border-border-focus bg-background-surface',
            'focus-visible:ring-border-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          )}
          style={{ left: pos.left, top: pos.top, transform: pinTransform }}
          onPointerDown={handlePointerDown}
          onPointerEnter={() => setHoveredThread(thread.id)}
          onPointerLeave={() => setHoveredThread(null)}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => {
            if (!justDraggedRef.current) return;
            e.preventDefault();
            e.stopPropagation();
          }}
          data-umami-event="board-comment-open"
        >
          <Avatar size="s">
            <AvatarImage
              src={getCommentAuthorAvatarUrl(lastAuthorId)}
              alt={lastAuthorName}
              size="s"
              draggable={false}
            />
            <AvatarFallback size="s">{lastAuthorName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isUnread && (
            <span className="border-border-default bg-action-primary-background-default absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2" />
          )}
          {thread.resolved && (
            <span className="bg-status-success-accent absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full">
              <Check className="size-2.5 fill-white" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={isRegion ? 'right' : 'top'}
        sideOffset={10}
        data-comment-ui
        onFocusOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          const target = e.detail.originalEvent.target as Element | null;
          if (target?.closest('[data-comment-region-handle]')) e.preventDefault();
        }}
        className={cn(boardMenuSurfaceClass, boardDropdownZClass, 'w-auto rounded-xl p-3')}
      >
        <CommentThreadPanel threadId={thread.id} onClose={() => openThread(null)} />
      </PopoverContent>
    </Popover>
  );
});
