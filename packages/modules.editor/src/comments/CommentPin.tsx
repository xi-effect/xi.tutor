import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { Check } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useYjsContext } from '../hooks';
import { getCommentAuthorAvatarUrl } from './commentAvatar';
import { getThreadMessages } from './commentQueries';
import { useCommentsUiStore } from './commentsUiStore';
import { CommentThreadPanel } from './CommentThreadPanel';
import { useThreadUnread } from './useCommentReads';
import type { EditorCommentThread } from './commentRecords';
import { generateUserColor } from '../utils/userColor';

type CommentPinProps = {
  thread: EditorCommentThread;
  left: number;
  top: number;
};

export const CommentPin = ({ thread, left, top }: CommentPinProps) => {
  const { commentMessagesMap } = useYjsContext();
  const openThreadId = useCommentsUiStore((s) => s.openThreadId);
  const openThread = useCommentsUiStore((s) => s.openThread);
  const color = generateUserColor(thread.authorId);

  const messages = getThreadMessages(commentMessagesMap, thread.id);
  const isUnread = useThreadUnread(thread.id, messages);
  const isOpen = openThreadId === thread.id;
  const lastMessage = messages[messages.length - 1];
  const lastAuthorId = lastMessage?.authorId ?? thread.authorId;
  const lastAuthorName = lastMessage?.authorName ?? thread.authorName;

  return (
    <Popover open={isOpen} onOpenChange={(open) => openThread(open ? thread.id : null)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-comment-ui
          // TODO: clear styles
          className={cn(
            'pointer-events-auto absolute z-30 flex size-8 items-center justify-center rounded-full border-2 shadow-md transition-transform select-none hover:z-31 hover:scale-110',
            thread.resolved
              ? 'border-border-control bg-action-secondary-background-pressed opacity-70'
              : 'border-border-focus bg-background-surface',
            'focus-visible:ring-border-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          )}
          style={{
            left,
            top,
            transform: 'translate(-50%, -100%)',
            borderColor: thread.resolved ? undefined : color,
          }}
          data-umami-event="editor-comment-open"
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
        side="top"
        sideOffset={10}
        data-comment-ui
        className="w-auto rounded-xl p-3"
      >
        <CommentThreadPanel threadId={thread.id} onClose={() => openThread(null)} />
      </PopoverContent>
    </Popover>
  );
};
