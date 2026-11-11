import { Eyeoff, Eyeon } from '@xipkg/icons';
import { useCommentsUiStore } from '../commentsUiStore';
import { useTranslation } from 'react-i18next';
import { DropdownMenuItem } from '@xipkg/dropdown';
import { cn } from '@xipkg/utils';

export const CommentVisibilityToggle = () => {
  const commentsVisible = useCommentsUiStore((s) => s.commentsVisible);
  const setCommentsVisible = useCommentsUiStore((s) => s.setCommentsVisible);
  const { t } = useTranslation('editor');

  return (
    <DropdownMenuItem
      className={cn(
        'flex gap-2 p-1',
        'text-text-primary [&_svg]:fill-icon-primary',
        'hover:text-text-primary hover:[&_svg]:fill-icon-primary',
        'focus:text-text-primary focus:[&_svg]:fill-icon-primary',
        'data-[highlighted]:text-text-primary data-[highlighted]:[&_svg]:fill-icon-primary',
      )}
      onClick={() => setCommentsVisible(!commentsVisible)}
      data-umami-event="board-comments-toggle-visibility"
      data-umami-event-state={commentsVisible ? 'hide' : 'show'}
    >
      {commentsVisible ? <Eyeoff /> : <Eyeon />}
      <span>{commentsVisible ? t('comments.hideComments') : t('comments.showComments')}</span>
    </DropdownMenuItem>
  );
};
