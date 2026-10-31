import { Button } from '@xipkg/button';
import { Chat } from '@xipkg/icons';
import { useCommentsUiStore } from '../commentsUiStore';
import { useTranslation } from 'react-i18next';

export const CommentToggleButton = () => {
  const commentsVisible = useCommentsUiStore((s) => s.commentsVisible);
  const setCommentsVisible = useCommentsUiStore((s) => s.setCommentsVisible);
  const { t } = useTranslation('editor');

  return (
    <Button
      variant="none"
      data-comment-ui
      className="flex size-7 items-center justify-center rounded-lg p-0 transition-colors"
      title={commentsVisible ? t('comments.hide') : t('comments.show')}
      onClick={() => setCommentsVisible(!commentsVisible)}
    >
      <Chat className="size-6" />
    </Button>
  );
};
