import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { Check, Inbox } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCloseOnOutsideClick } from 'modules.board';
import { useYjsContext } from '../../hooks';
import { focusEditorComment } from '../../utils/editorDeepLink';
import { getCommentAuthorAvatarUrl } from '../utils/commentAvatar';
import { getAllCommentThreads, getThreadMessages } from '../commentQueries';
import { useCommentUnreadChecker, useMarkCommentThreadRead } from '../hooks/useCommentReads';
import { useYMapVersion } from '../hooks/useYMapVersion';
import { useCommentMarkIds } from '../hooks/useCommentMarkIds';
import type { EditorCommentThread } from '../commentRecords';

/** Кнопка в шапке редактора + выпадающая лента всех комментариев (прочитанных и непрочитанных). */
export const CommentsFeedButton = () => {
  const { t } = useTranslation('editor');
  const { editor, commentThreadsMap, commentMessagesMap } = useYjsContext();
  const [open, setOpen] = useState(false);
  const isUnread = useCommentUnreadChecker();
  const markRead = useMarkCommentThreadRead();
  const markIds = useCommentMarkIds(editor);

  // Ре-рендер при изменениях тредов/сообщений (свои и чужие правки через Yjs).
  useYMapVersion(commentThreadsMap);
  useYMapVersion(commentMessagesMap);

  useCloseOnOutsideClick(open, () => setOpen(false));

  const sorted = getAllCommentThreads(commentThreadsMap)
    // тред без марки в документе (текст удалили) открыть нельзя — не показываем
    .filter((thread) => markIds.has(thread.id))
    .map((thread) => ({ thread, messages: getThreadMessages(commentMessagesMap, thread.id) }))
    .sort((a, b) => {
      const aUnread = isUnread(a.thread.id, a.messages);
      const bUnread = isUnread(b.thread.id, b.messages);
      if (aUnread !== bUnread) return aUnread ? -1 : 1;
      const aLast = a.messages[a.messages.length - 1]?.createdAt ?? a.thread.createdAt;
      const bLast = b.messages[b.messages.length - 1]?.createdAt ?? b.thread.createdAt;
      return bLast - aLast;
    });

  const unreadCount = sorted.filter(({ thread, messages }) => isUnread(thread.id, messages)).length;

  const handleSelect = (thread: EditorCommentThread) => {
    if (!editor || editor.isDestroyed) return;

    const handled = focusEditorComment(editor, commentThreadsMap, thread.id);
    if (!handled) {
      toast.error(t('comments.notFound'));
      return;
    }

    // Панель треда тоже отмечает прочитанным при открытии, но так бейдж гаснет сразу.
    markRead(thread.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="none"
          data-comment-ui
          className="hover:bg-status-info-background relative h-6 w-6 p-0"
          title={t('comments.title')}
          data-umami-event="editor-comments-feed"
        >
          <Inbox size="s" className="fill-icon-primary size-5" />
          {unreadCount > 0 && (
            <span className="bg-action-primary-background-default border-border-default absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 px-0.5 pt-px text-center text-[9px] leading-none font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        data-comment-ui
        className="w-80 rounded-xl p-2"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <p className="text-text-secondary px-2 py-1 text-xs">{t('comments.inEditor')}</p>
        {sorted.length === 0 ? (
          <p className="text-text-disabled px-2 py-6 text-center text-sm">{t('comments.empty')}</p>
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
                    'flex items-start gap-2 rounded-lg px-2 py-2 text-left',
                    'hover:bg-background-page appearance-none bg-transparent shadow-none transition-colors',
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
                        <Check className="fill-status-success-text size-3 shrink-0" />
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
};
