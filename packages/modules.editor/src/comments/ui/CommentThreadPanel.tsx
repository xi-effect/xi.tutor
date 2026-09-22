import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Button } from '@xipkg/button';
import { Check, Close, Link, Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from 'common.ui';
import { useCopyEditorDeepLink, useYjsContext } from '../../hooks';
import { getCommentAuthorAvatarUrl } from '../utils/commentAvatar';
import { CommentMessageInput } from './CommentMessageInput';
import {
  addCommentReply,
  deleteCommentMessage,
  deleteCommentThread,
  getThreadMessages,
  setCommentThreadResolved,
} from '../commentQueries';
import { useCommentAuthor } from '../hooks/useCommentAuthor';
import { useMarkCommentThreadRead } from '../hooks/useCommentReads';

type CommentThreadPanelProps = {
  threadId: string;
  onClose: () => void;
  showHeader?: boolean;
};

function formatMessageTime(ts: number): string {
  return new Date(ts).toLocaleString(getDateLocale(), {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const CommentThreadPanel = ({
  threadId,
  onClose,
  showHeader = true,
}: CommentThreadPanelProps) => {
  const { t } = useTranslation('editor');
  const { editor, commentThreadsMap, commentMessagesMap } = useYjsContext();
  const author = useCommentAuthor();
  const markRead = useMarkCommentThreadRead();
  const copyDeepLink = useCopyEditorDeepLink({ commentId: threadId });

  const thread = commentThreadsMap.get(threadId);
  const messages = getThreadMessages(commentMessagesMap, threadId);

  useEffect(() => {
    markRead(threadId);
  }, [threadId, messages.length, markRead]);

  if (!thread || !editor) return null;

  const handleReply = (text: string) => {
    if (!author) return;
    addCommentReply(commentMessagesMap, threadId, text, author);
  };

  const handleToggleResolved = () => {
    setCommentThreadResolved(commentThreadsMap, threadId, !thread.resolved);
  };

  const handleDelete = () => {
    deleteCommentThread(editor, commentThreadsMap, commentMessagesMap, threadId);
    onClose();
  };

  const handleDeleteMessage = (messageId: string) => {
    const isLastMessage = messages.length <= 1;
    deleteCommentMessage(editor, commentThreadsMap, commentMessagesMap, threadId, messageId);
    if (isLastMessage) onClose();
  };

  const isOwnThread = author?.authorId === thread.authorId;

  return (
    <div
      className="flex w-50 flex-col gap-3"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {showHeader && (
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-xs">
            {thread.resolved ? t('comments.resolved') : t('comments.comment')}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="none"
              className="hover:bg-status-info-background flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent"
              title={t('comments.copyLink')}
              onClick={() => copyDeepLink()}
              data-umami-event="editor-copy-comment-link"
            >
              <Link className="fill-icon-secondary size-4" />
            </Button>
            <Button
              variant="none"
              className={cn(
                'hover:bg-status-info-background flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent',
                thread.resolved &&
                  'bg-status-success-background hover:bg-status-success-background',
              )}
              title={thread.resolved ? t('comments.reopen') : t('comments.markResolved')}
              onClick={handleToggleResolved}
            >
              <Check
                className={cn(
                  'size-4',
                  thread.resolved ? 'fill-status-success-text' : 'fill-icon-secondary',
                )}
              />
            </Button>
            {isOwnThread && (
              <Button
                variant="none"
                className="hover:bg-status-info-background flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent"
                title={t('comments.deleteComment')}
                onClick={handleDelete}
              >
                <Trash className="fill-icon-secondary size-4" />
              </Button>
            )}
            <Button
              variant="none"
              className="hover:bg-status-info-background flex h-7 w-7 items-center justify-center rounded-lg p-0 focus:bg-transparent"
              title={t('comments.close')}
              onClick={onClose}
            >
              <Close className="fill-icon-secondary size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex max-h-72 flex-col gap-3 overflow-x-hidden overflow-y-auto">
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
              <div className="min-w-0 flex-1 pr-1">
                <div className="flex items-start gap-1">
                  <div className="flex max-w-[95%] flex-col">
                    <span className="text-text-primary truncate text-sm font-medium">
                      {message.authorName}
                    </span>
                    <div className="flex gap-1">
                      <span className="text-text-disabled shrink-0 text-xs">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isOwnMessage && (
                        <button
                          type="button"
                          className="hover:bg-status-info-background shrink-0 rounded bg-transparent px-1 opacity-100 transition-opacity group-hover:opacity-100 pointer-fine:opacity-0"
                          title={t('comments.deleteMessage')}
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash className="fill-icon-disabled size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-text-primary text-sm wrap-break-word whitespace-pre-wrap">
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <CommentMessageInput
        placeholder={t('comments.replyPlaceholder')}
        submitLabel={t('comments.reply')}
        onSubmit={handleReply}
      />
    </div>
  );
};
