import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { getCommentAuthorAvatarUrl } from '../utils/commentAvatar';
import { CommentMessageInput } from './CommentMessageInput';
import { useTranslation } from 'react-i18next';

type CommentComposerProps = {
  top: number;
  authorId: string;
  authorName: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
};

export const CommentComposer = ({
  top,
  authorId,
  authorName,
  onSubmit,
  onCancel,
}: CommentComposerProps) => {
  const { t } = useTranslation('editor');

  return (
    <Popover open modal={false}>
      <PopoverAnchor asChild>
        <div
          data-comment-ui
          className="border-border-focus bg-background-surface pointer-events-none absolute right-5 z-30 flex size-8 items-center justify-center rounded-full border-2 shadow-md md:right-30"
          style={{
            top,
          }}
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
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={10}
        collisionPadding={12}
        data-comment-ui
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn('w-70 rounded-xl p-3 shadow-md md:w-90')}
      >
        <CommentMessageInput
          placeholder={t('comments.writePlaceholder')}
          submitLabel={t('comments.send')}
          autoFocus
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </PopoverContent>
    </Popover>
  );
};
