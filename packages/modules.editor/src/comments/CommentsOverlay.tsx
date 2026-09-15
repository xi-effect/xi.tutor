import { useYjsContext } from '../hooks/useYjsContext';
import { useCommentAuthor } from './useCommentAuthor';
import { useCommentsUiStore } from './commentsUiStore';
import { useCloseOnOutsideClick } from './useCloseOnOutsideClick';
import { useYMapVersion } from './useYMapVersion';
import { CommentComposer } from './CommentComposer';
import { CommentPin } from './CommentPin';
import { createCommentThreadAt, getAllCommentThreads, getThreadMarkRange } from './commentQueries';

export const CommentsOverlay = () => {
  const { editor, commentThreadsMap, commentMessagesMap } = useYjsContext();
  const author = useCommentAuthor();
  const draftRange = useCommentsUiStore((s) => s.draftRange);
  const setDraftRange = useCommentsUiStore((s) => s.setDraftRange);
  const openThreadId = useCommentsUiStore((s) => s.openThreadId);
  const openThread = useCommentsUiStore((s) => s.openThread);
  const commentsVisible = useCommentsUiStore((s) => s.commentsVisible);

  // Ре-рендер при любых изменениях тредов/сообщений (свои и чужие правки через Yjs).
  useYMapVersion(commentThreadsMap);
  useYMapVersion(commentMessagesMap);

  useCloseOnOutsideClick(!!openThreadId, () => openThread(null));
  useCloseOnOutsideClick(!!draftRange, () => setDraftRange(null));

  if (!commentsVisible || !editor) return null;

  const container = editor.view.dom.closest('.xi-editor') as HTMLElement | null;
  const rect = container?.getBoundingClientRect();
  if (!rect) return null;

  const threads = getAllCommentThreads(commentThreadsMap);
  const draftCoords = draftRange ? editor.view.coordsAtPos(draftRange.to) : null;

  const handleSubmitDraft = (text: string) => {
    if (!draftRange || !author) return;
    const thread = createCommentThreadAt(
      editor,
      commentThreadsMap,
      commentMessagesMap,
      draftRange,
      text,
      author,
    );
    setDraftRange(null);
    openThread(thread.id);
  };

  return (
    <>
      {threads.map((thread) => {
        const range = getThreadMarkRange(editor, thread.id);
        if (!range) return null;
        const coords = editor.view.coordsAtPos(range.to);

        return (
          <CommentPin
            key={thread.id}
            thread={thread}
            left={coords.left - rect.left}
            top={coords.top - rect.top}
          />
        );
      })}

      {draftCoords && author && (
        <CommentComposer
          left={draftCoords.left - rect.left}
          top={draftCoords.top - rect.top}
          authorId={author.authorId}
          authorName={author.authorName}
          onSubmit={handleSubmitDraft}
          onCancel={() => setDraftRange(null)}
        />
      )}
    </>
  );
};
