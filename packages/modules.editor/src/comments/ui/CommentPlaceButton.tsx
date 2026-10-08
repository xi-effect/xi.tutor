import type { Editor } from '@tiptap/core';
import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Chat } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { useCommentsUiStore } from '../commentsUiStore';
import { useCommentAuthor } from '../hooks/useCommentAuthor';
import { createEditorCommentThreadId } from '../commentRecords';
import { applyDraftCommentMark } from '../commentQueries';

type CommentPlaceButtonProps = {
  editor: Editor;
};

export const CommentPlaceButton = ({ editor }: CommentPlaceButtonProps) => {
  const { t } = useTranslation('editor');
  const author = useCommentAuthor();

  const handleMouseDown = (e: SyntheticEvent) => {
    // preventDefault — иначе клик по кнопке в BubbleMenu снимает selection раньше,
    // чем мы успеваем его прочитать
    e.preventDefault();
    if (!author) return;
    const { from, to } = editor.state.selection;
    const threadId = createEditorCommentThreadId();
    applyDraftCommentMark(editor, { from, to }, threadId, author.authorId);
    useCommentsUiStore.getState().setDraftRange({ threadId, from, to });
  };

  return (
    <Button
      className="[&_svg]:fill-icon-primary h-6 w-6 rounded-[2px] p-1"
      variant="none"
      data-umami-event="editor-comment-place"
      onMouseDown={handleMouseDown}
      onClick={handleMouseDown}
      onPointerDown={handleMouseDown}
      aria-label={t('bubbleMenu.comment')}
    >
      <Chat />
    </Button>
  );
};
