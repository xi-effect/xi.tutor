import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { Chat } from '@xipkg/icons';
import { useCommentsUiStore } from './commentsUiStore';

export const CommentToggleButton = ({ t }: { t: (key: string) => string }) => {
  const commentsVisible = useCommentsUiStore((s) => s.commentsVisible);
  const setCommentsVisible = useCommentsUiStore((s) => s.setCommentsVisible);
  return (
    <Button
      variant="none"
      data-comment-ui
      className={cn(
        'absolute -top-2 right-6 z-10 flex size-7 items-center justify-center rounded-lg p-0 transition-colors md:right-30',
      )}
      title={commentsVisible ? t('comments.hide') : t('comments.show')}
      onClick={() => setCommentsVisible(!commentsVisible)}
    >
      <Chat className="size-6" />
    </Button>
  );
};
