import { useState } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { Check, Inbox } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { boardIconClass, boardMenuSurfaceClass, boardPopoverListItemClass } from '../ui/boardTheme';
import { getCommentAuthorAvatarUrl } from './commentAvatar';
import {
  getAllCommentThreads,
  getCommentThreadPagePoint,
  getThreadMessages,
} from './commentQueries';
import { useCommentsUiStore } from './commentsUiStore';
import { useCloseOnOutsideClick } from './useCloseOnOutsideClick';
import { useCommentUnreadChecker } from './useCommentReads';
import type { DrCommentThread } from './commentRecords';

/** Кнопка в шапке доски + выпадающая лента всех комментариев (прочитанных и непрочитанных). */
export const CommentsFeedButton = track(function CommentsFeedButton() {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const openThread = useCommentsUiStore((s) => s.openThread);
  const setCommentsVisible = useCommentsUiStore((s) => s.setCommentsVisible);
  const isUnread = useCommentUnreadChecker();

  useCloseOnOutsideClick(open, () => setOpen(false));

  const items = getAllCommentThreads(editor.store).map((thread) => ({
    thread,
    messages: getThreadMessages(editor.store, thread.id),
  }));

  const sorted = [...items].sort((a, b) => {
    const aUnread = isUnread(a.thread.id, a.messages);
    const bUnread = isUnread(b.thread.id, b.messages);
    if (aUnread !== bUnread) return aUnread ? -1 : 1;
    const aLast = a.messages[a.messages.length - 1]?.createdAt ?? a.thread.createdAt;
    const bLast = b.messages[b.messages.length - 1]?.createdAt ?? b.thread.createdAt;
    return bLast - aLast;
  });

  const unreadCount = sorted.filter(({ thread, messages }) => isUnread(thread.id, messages)).length;

  const handleSelect = (thread: DrCommentThread) => {
    setOpen(false);
    setCommentsVisible(true);
    const pagePoint = getCommentThreadPagePoint(editor, thread);
    editor.centerOnPoint(pagePoint, { animation: { duration: 200 } });
    openThread(thread.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="none"
          data-comment-ui
          className="hover:bg-status-info-background relative flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          title="Комментарии"
          data-umami-event="board-comments-feed"
        >
          <Inbox size="s" className={cn('h-4 w-4 lg:h-6 lg:w-6', boardIconClass)} />
          {unreadCount > 0 && (
            <span className="bg-action-primary-background-default border-border-default absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 px-0.5 text-[9px] leading-none font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={12}
        data-comment-ui
        className={cn(boardMenuSurfaceClass, 'z-100 w-80 rounded-xl p-2')}
      >
        <p className="text-text-secondary px-2 py-1 text-xs">Комментарии на доске</p>
        {sorted.length === 0 ? (
          <p className="text-text-disabled px-2 py-6 text-center text-sm">Пока нет комментариев</p>
        ) : (
          <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
            {sorted.map(({ thread, messages }) => {
              const unread = isUnread(thread.id, messages);
              const lastMessage = messages[messages.length - 1];
              const authorId = lastMessage?.authorId ?? thread.authorId;
              const authorName = lastMessage?.authorName ?? thread.authorName;

              return (
                <button
                  key={thread.id}
                  type="button"
                  className={cn(
                    boardPopoverListItemClass,
                    'flex items-start gap-2 px-2 py-2 text-left',
                  )}
                  onClick={() => handleSelect(thread)}
                >
                  <Avatar size="s">
                    <AvatarImage
                      src={getCommentAuthorAvatarUrl(authorId)}
                      alt={authorName}
                      size="s"
                      draggable={false}
                    />
                    <AvatarFallback size="s">{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{authorName}</span>
                      {thread.resolved && (
                        <Check className="text-status-success-text size-3 shrink-0" />
                      )}
                      {unread && (
                        <span className="bg-action-primary-background-default size-1.5 shrink-0 rounded-full" />
                      )}
                    </div>
                    <p className="truncate text-xs opacity-80">{lastMessage?.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
