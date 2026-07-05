import { useEffect } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { Check, Close, Trash, Link } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { getCommentAuthorAvatarUrl } from './commentAvatar';
import { CommentMessageInput } from './CommentMessageInput';
import {
  addCommentReply,
  deleteCommentMessage,
  deleteCommentThread,
  getThreadMessages,
  setCommentThreadResolved,
} from './commentQueries';
import { useCommentAuthor } from './useCommentAuthor';
import { useMarkCommentThreadRead } from './useCommentReads';
import { useCopyBoardDeepLink } from '../hooks/useBoardDeepLinkFocus';
import type { DrCommentMessage, DrCommentThread } from './commentRecords';
import type { RecordId } from '@ibodr/draw';

type CommentThreadPanelProps = {
  threadId: RecordId<DrCommentThread>;
  onClose: () => void;
  /** Показать заголовок с крестиком закрытия — не нужен, когда попап уже сам закрывается по клику вне */
  showHeader?: boolean;
};

function formatMessageTime(ts: number): string {
  return new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const CommentThreadPanel = track(function CommentThreadPanel({
  threadId,
  onClose,
  showHeader = true,
}: CommentThreadPanelProps) {
  const editor = useEditor();
  const author = useCommentAuthor();
  const markRead = useMarkCommentThreadRead();
  const copyDeepLink = useCopyBoardDeepLink({ commentId: threadId });

  const thread = editor.store.get(threadId as never) as DrCommentThread | undefined;
  const messages = getThreadMessages(editor.store, threadId);

  useEffect(() => {
    markRead(threadId);
  }, [threadId, messages.length, markRead]);

  if (!thread) return null;

  const handleReply = (text: string) => {
    if (!author) return;
    addCommentReply(editor.store, threadId, text, author);
  };

  const handleToggleResolved = () => {
    setCommentThreadResolved(editor.store, threadId, !thread.resolved);
  };

  const handleDelete = () => {
    deleteCommentThread(editor.store, threadId);
    onClose();
  };

  const handleDeleteMessage = (messageId: RecordId<DrCommentMessage>) => {
    const isLastMessage = messages.length <= 1;
    deleteCommentMessage(editor.store, threadId, messageId);
    if (isLastMessage) onClose();
  };

  const isOwnThread = author?.authorId === thread.authorId;

  return (
    <div
      className="flex w-80 flex-col gap-3"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {showHeader && (
        <div className="flex items-center justify-between">
          <span className="text-gray-60 text-xs">{thread.resolved ? 'Решено' : 'Комментарий'}</span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="none"
              className="hover:bg-brand-0 flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent"
              title="Скопировать ссылку"
              onClick={() => void copyDeepLink()}
              data-umami-event="board-copy-comment-link"
            >
              <Link className="fill-gray-60 size-4" />
            </Button>
            <Button
              variant="none"
              className={cn(
                'hover:bg-brand-0 flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent',
                thread.resolved && 'bg-green-0 hover:bg-green-0',
              )}
              title={thread.resolved ? 'Открыть заново' : 'Отметить решённым'}
              onClick={handleToggleResolved}
            >
              <Check className={cn('size-4', thread.resolved ? 'fill-green-80' : 'fill-gray-60')} />
            </Button>
            {isOwnThread && (
              <Button
                variant="none"
                className="hover:bg-brand-0 flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent"
                title="Удалить комментарий"
                onClick={handleDelete}
              >
                <Trash className="fill-gray-60 size-4" />
              </Button>
            )}
            <Button
              variant="none"
              className="hover:bg-brand-0 flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent"
              title="Закрыть"
              onClick={onClose}
            >
              <Close className="fill-gray-60 size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
        {messages.map((message) => {
          const isOwnMessage = author?.authorId === message.authorId;

          return (
            <div key={message.id} className="group flex items-start gap-2">
              <Avatar size="s">
                <AvatarImage
                  src={getCommentAuthorAvatarUrl(message.authorId)}
                  alt={message.authorName}
                  size="s"
                  draggable={false}
                />
                <AvatarFallback size="s">
                  {message.authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-gray-100">
                    {message.authorName}
                  </span>
                  <span className="text-gray-40 shrink-0 text-xs">
                    {formatMessageTime(message.createdAt)}
                  </span>
                  {isOwnMessage && (
                    <button
                      type="button"
                      className="hover:bg-brand-0 ml-auto shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      title="Удалить сообщение"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      <Trash className="fill-gray-40 size-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm wrap-break-word whitespace-pre-wrap text-gray-100">
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <CommentMessageInput
        placeholder="Ответить..."
        submitLabel="Ответить"
        onSubmit={handleReply}
      />
    </div>
  );
});
