import { useEffect } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { CommentComposer } from './CommentComposer';
import { CommentPin } from './CommentPin';
import {
  createCommentThreadAt,
  getAllCommentThreads,
  getCommentThreadPagePoint,
} from './commentQueries';
import { useCommentsUiStore } from './commentsUiStore';
import { useCommentAuthor } from './useCommentAuthor';
import { useCloseOnOutsideClick } from './useCloseOnOutsideClick';

/** Пины комментариев + слой размещения нового треда поверх канваса (`InFrontOfTheCanvas`). */
export const CommentsOverlay = track(function CommentsOverlay() {
  const editor = useEditor();
  const author = useCommentAuthor();
  const isPlacing = useCommentsUiStore((s) => s.isPlacing);
  const draftPoint = useCommentsUiStore((s) => s.draftPoint);
  const setPlacing = useCommentsUiStore((s) => s.setPlacing);
  const setDraftPoint = useCommentsUiStore((s) => s.setDraftPoint);
  const openThreadId = useCommentsUiStore((s) => s.openThreadId);
  const openThread = useCommentsUiStore((s) => s.openThread);
  const commentsVisible = useCommentsUiStore((s) => s.commentsVisible);

  useCloseOnOutsideClick(!!openThreadId, () => openThread(null));
  useCloseOnOutsideClick(!!draftPoint, () => setDraftPoint(null));

  useEffect(() => {
    if (!isPlacing && !draftPoint) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPlacing(false);
      setDraftPoint(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlacing, draftPoint, setPlacing, setDraftPoint]);

  if (!commentsVisible) return null;

  const container = editor.getContainer();
  const rect = container.getBoundingClientRect();

  const threads = getAllCommentThreads(editor.store).filter(
    (t) => t.pageId === editor.getCurrentPageId(),
  );

  const draftScreenPoint = draftPoint ? editor.pageToScreen(draftPoint) : null;

  return (
    <>
      {isPlacing && (
        <div
          className="pointer-events-auto absolute inset-0 z-40 cursor-crosshair"
          onPointerDown={(e) => {
            e.stopPropagation();
            const pagePoint = editor.screenToPage({ x: e.clientX, y: e.clientY });
            setDraftPoint({ x: pagePoint.x, y: pagePoint.y });
          }}
        />
      )}

      {threads.map((thread) => {
        const pagePoint = getCommentThreadPagePoint(editor, thread);
        const screenPoint = editor.pageToScreen(pagePoint);
        return (
          <CommentPin
            key={thread.id}
            thread={thread}
            left={screenPoint.x - rect.left}
            top={screenPoint.y - rect.top}
          />
        );
      })}

      {draftScreenPoint && author && (
        <CommentComposer
          left={draftScreenPoint.x - rect.left}
          top={draftScreenPoint.y - rect.top}
          authorId={author.authorId}
          authorName={author.authorName}
          onSubmit={(text) => {
            if (!draftPoint) return;
            const thread = createCommentThreadAt(editor, draftPoint, text, author);
            setDraftPoint(null);
            openThread(thread.id);
          }}
          onCancel={() => setDraftPoint(null)}
        />
      )}
    </>
  );
});
