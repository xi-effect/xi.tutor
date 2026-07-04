import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Check } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { boardMenuSurfaceClass } from '../ui/boardTheme';
import { getCommentAuthorAvatarUrl } from './commentAvatar';
import { getThreadMessages, moveCommentThreadTo } from './commentQueries';
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

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const info = dragInfoRef.current;
      if (!info) return;
      const dx = moveEvent.clientX - info.startClientX;
      const dy = moveEvent.clientY - info.startClientY;
      if (!info.dragged && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      info.dragged = true;
      setDragPos({ left: info.startLeft + dx, top: info.startTop + dy });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      const info = dragInfoRef.current;
      dragInfoRef.current = null;

      if (info?.dragged) {
        const pagePoint = editor.screenToPage({ x: upEvent.clientX, y: upEvent.clientY });
        moveCommentThreadTo(editor, thread.id, pagePoint);
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 0);
      }

      setDragPos(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const pos = dragPos ?? { left, top };

  return (
    <Popover open={isOpen} onOpenChange={(open) => openThread(open ? thread.id : null)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-comment-ui
          className={cn(
            'pointer-events-auto absolute flex size-8 touch-none items-center justify-center rounded-full border-2 shadow-md select-none hover:z-10',
            !dragPos && 'transition-transform hover:scale-110',
            dragPos ? 'z-20 cursor-grabbing' : 'cursor-grab',
            thread.resolved ? 'border-gray-30 bg-gray-20 opacity-70' : 'border-brand-80 bg-gray-0',
            'focus-visible:ring-brand-60 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          )}
          style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -100%)' }}
          onPointerDown={handlePointerDown}
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
            <span className="border-gray-0 bg-brand-80 absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2" />
          )}
          {thread.resolved && (
            <span className="bg-green-80 absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full">
              <Check className="size-2.5 fill-white" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={10}
        data-comment-ui
        className={cn(boardMenuSurfaceClass, 'z-100 w-auto rounded-xl p-3')}
      >
        <CommentThreadPanel threadId={thread.id} onClose={() => openThread(null)} />
      </PopoverContent>
    </Popover>
  );
});
