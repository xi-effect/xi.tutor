import { Fragment, useEffect } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { CommentComposer } from './CommentComposer';
import { CommentPin } from './CommentPin';
import { CommentPlacementLayer } from './CommentPlacementLayer';
import { CommentRegionBox } from './CommentRegionBox';
import { CommentRegionResizeHandle } from './CommentRegionResizeHandle';
import {
  createCommentThreadAt,
  getAllCommentThreads,
  getCommentThreadPageBounds,
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
  const draftRegion = useCommentsUiStore((s) => s.draftRegion);
  const setPlacing = useCommentsUiStore((s) => s.setPlacing);
  const setDraftPoint = useCommentsUiStore((s) => s.setDraftPoint);
  const openThreadId = useCommentsUiStore((s) => s.openThreadId);
  const openThread = useCommentsUiStore((s) => s.openThread);
  const hoveredThreadId = useCommentsUiStore((s) => s.hoveredThreadId);
  const regionDrag = useCommentsUiStore((s) => s.regionDrag);
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
  const zoom = editor.getZoomLevel();

  const threads = getAllCommentThreads(editor.store).filter(
    (t) => t.pageId === editor.getCurrentPageId(),
  );

  const draftScreenPoint = draftPoint ? editor.pageToScreen(draftPoint) : null;

  const handleSubmitDraft = (text: string) => {
    if (!draftPoint || !author) return;

    const thread = createCommentThreadAt(
      editor,
      draftPoint,
      text,
      author,
      draftRegion ?? undefined,
    );
    setDraftPoint(null);
    openThread(thread.id);
  };

  return (
    <>
      {isPlacing && (
        <CommentPlacementLayer
          onPoint={(point) => setDraftPoint(point)}
          onRegion={(pinPoint, size) => setDraftPoint(pinPoint, size)}
        />
      )}

      {threads.map((thread) => {
        // Позицию пина считаем один раз и переиспользуем для рамки области того же треда.
        const pagePoint = getCommentThreadPagePoint(editor, thread);
        const screenPoint = editor.pageToScreen(pagePoint);
        const pinLeft = screenPoint.x - rect.left;
        const pinTop = screenPoint.y - rect.top;

        const isResizing = regionDrag?.threadId === thread.id;
        const showRegion =
          openThreadId === thread.id || hoveredThreadId === thread.id || isResizing;

        let regionUi = null;
        if (showRegion) {
          const bounds = getCommentThreadPageBounds(editor, thread, pagePoint);
          if (bounds) {
            // При resize берём живой прямоугольник из regionDrag (двигаться может любой угол).
            const live = isResizing ? regionDrag! : bounds;
            const topLeft = editor.pageToScreen({ x: live.x, y: live.y });
            const boxLeft = topLeft.x - rect.left;
            const boxTop = topLeft.y - rect.top;

            regionUi = (
              <>
                <CommentRegionBox
                  left={boxLeft}
                  top={boxTop}
                  width={live.w * zoom}
                  height={live.h * zoom}
                />
                {(openThreadId === thread.id || isResizing) && (
                  <CommentRegionResizeHandle thread={thread} left={boxLeft} top={boxTop} />
                )}
              </>
            );
          }
        }

        return (
          <Fragment key={thread.id}>
            {regionUi}
            <CommentPin thread={thread} left={pinLeft} top={pinTop} />
          </Fragment>
        );
      })}

      {draftPoint && draftRegion && draftScreenPoint && (
        <CommentRegionBox
          left={draftScreenPoint.x - rect.left - draftRegion.w * zoom}
          top={draftScreenPoint.y - rect.top - draftRegion.h * zoom}
          width={draftRegion.w * zoom}
          height={draftRegion.h * zoom}
        />
      )}

      {draftScreenPoint && author && (
        <CommentComposer
          left={draftScreenPoint.x - rect.left}
          top={draftScreenPoint.y - rect.top}
          authorId={author.authorId}
          authorName={author.authorName}
          variant={draftRegion ? 'region' : 'point'}
          onSubmit={handleSubmitDraft}
          onCancel={() => setDraftPoint(null)}
        />
      )}
    </>
  );
});
