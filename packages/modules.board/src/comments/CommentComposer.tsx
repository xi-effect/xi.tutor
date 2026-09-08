import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { boardDropdownZClass, boardMenuSurfaceClass } from '../ui/boardTheme';
import { getCommentAuthorAvatarUrl } from './commentAvatar';
import { CommentMessageInput } from './CommentMessageInput';
import { useTranslation } from 'react-i18next';

type CommentComposerProps = {
  left: number;
  top: number;
  authorId: string;
  authorName: string;
  /**
   * `region` — черновик комментария к области: маркер(аватар) позиционируется не
   * в точке клика,а «свисает» на правом нижнем углу протянутой рамки.
   */
  variant?: 'point' | 'region';
  onSubmit: (text: string) => void;
  onCancel: () => void;
};

/**
 * Попап первого сообщения нового треда — появляется по клику в режиме «поставить комментарий».
 * Popover отвечает за умный флип попапа с учётом границ вьюпорта.
 */
export const CommentComposer = ({
  left,
  top,
  authorId,
  authorName,
  variant = 'point',
  onSubmit,
  onCancel,
}: CommentComposerProps) => {
  const { t } = useTranslation('board');
  const isRegion = variant === 'region';

  return (
    <Popover open modal={false}>
      <PopoverAnchor asChild>
        <div
          data-comment-ui
          className="border-border-focus bg-background-surface pointer-events-none absolute z-30 flex size-8 items-center justify-center rounded-full border-2 shadow-md"
          style={{
            left,
            top,
            transform: isRegion ? 'translate(8px, -100%)' : 'translate(-50%, -100%)',
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
        side={isRegion ? 'right' : 'top'}
        align="start"
        sideOffset={10}
        collisionPadding={12}
        data-comment-ui
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(boardMenuSurfaceClass, boardDropdownZClass, 'w-80 rounded-xl p-3 shadow-md')}
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
