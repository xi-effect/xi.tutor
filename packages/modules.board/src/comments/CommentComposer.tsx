import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { cn } from '@xipkg/utils';
import { boardMenuSurfaceClass } from '../ui/boardTheme';
import { getCommentAuthorAvatarUrl } from './commentAvatar';
import { CommentMessageInput } from './CommentMessageInput';

type CommentComposerProps = {
  left: number;
  top: number;
  authorId: string;
  authorName: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
};

/**
 * Карточка первого сообщения нового треда — появляется по клику в режиме «поставить комментарий».
 * Позиционируется так же, как и пин уже созданного комментария (маркер в точке клика + карточка
 * над ним), чтобы не выглядеть «оторванной» от канваса.
 */
export const CommentComposer = ({
  left,
  top,
  authorId,
  authorName,
  onSubmit,
  onCancel,
}: CommentComposerProps) => {
  return (
    <div
      className="pointer-events-none absolute z-100"
      data-comment-ui
      style={{ left, top, transform: 'translate(-50%, -100%)' }}
    >
      <div
        className={cn(
          boardMenuSurfaceClass,
          'pointer-events-auto absolute bottom-[calc(100%+10px)] left-0 w-80 rounded-xl p-3 shadow-md',
        )}
      >
        <CommentMessageInput
          placeholder="Написать комментарий..."
          submitLabel="Отправить"
          autoFocus
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
      <div className="border-brand-80 bg-gray-0 flex size-8 items-center justify-center rounded-full border-2 shadow-md">
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
    </div>
  );
};
