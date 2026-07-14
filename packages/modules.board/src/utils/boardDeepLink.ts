import type { DrPageId, DrShapeId, Editor } from '@ibodr/draw';
import { env } from 'common.env';
import { toast } from 'sonner';
import { getCommentThreadPagePoint } from '../comments/commentQueries';
import type { DrCommentThread } from '../comments/commentRecords';

export type BoardDeepLinkSearch = {
  shape?: string;
  comment?: string;
  call?: string;
};

type BuildBoardDeepLinkArgs = {
  /** Текущий pathname доски — `/board/…`, `/materials/…/board` или `/classrooms/…/boards/…`. */
  pathname: string;
  origin?: string;
  /** Существующие query-параметры страницы (например, `call` из звонка). */
  currentSearch?: BoardDeepLinkSearch;
  shapeIds?: string[];
  commentId?: string;
};

export function buildBoardDeepLink({
  pathname,
  origin,
  currentSearch,
  shapeIds,
  commentId,
}: BuildBoardDeepLinkArgs): string {
  const base = (
    origin ?? (typeof window !== 'undefined' ? window.location.origin : env.VITE_APP_DOMAIN)
  ).replace(/\/$/, '');

  const params = new URLSearchParams();
  if (currentSearch?.call) params.set('call', currentSearch.call);
  if (shapeIds?.length) params.set('shape', shapeIds.join(','));
  if (commentId) params.set('comment', commentId);

  const qs = params.toString();
  return `${base}${pathname}${qs ? `?${qs}` : ''}`;
}

export async function copyBoardDeepLink(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Ссылка скопирована');
  } catch {
    toast.error('Не удалось скопировать ссылку');
  }
}

export function parseShapeIdsFromSearch(shape?: string): string[] {
  if (!shape) return [];
  return shape
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/** Переключает страницу, выделяет фигуры и центрирует камеру на выделении. */
export function focusBoardShapes(editor: Editor, shapeIds: string[]): boolean {
  const validIds = shapeIds.filter((id) => editor.getShape(id as DrShapeId)) as DrShapeId[];
  if (!validIds.length) return false;

  const firstShape = editor.getShape(validIds[0]);
  if (!firstShape) return false;

  const pageId = editor.getAncestorPageId(firstShape);
  if (pageId && pageId !== editor.getCurrentPageId()) {
    editor.setCurrentPage(pageId as DrPageId);
  }

  const isReadonly = editor.getInstanceState().isReadonly;

  if (isReadonly) {
    let bounds = editor.getShapePageBounds(validIds[0]);
    if (!bounds) return false;
    for (let i = 1; i < validIds.length; i++) {
      const next = editor.getShapePageBounds(validIds[i]);
      if (next) bounds = bounds.union(next);
    }
    editor.zoomToBounds(bounds, { animation: { duration: 300 }, inset: 128 });
  } else {
    editor.select(...validIds);
    editor.setCurrentTool('select');
    editor.zoomToSelection({ animation: { duration: 300 } });
  }

  return true;
}

/** Показывает комментарии, центрирует камеру на пине и открывает тред. */
export function focusBoardComment(
  editor: Editor,
  threadId: string,
  {
    openThread,
    setCommentsVisible,
  }: {
    openThread: (id: string | null) => void;
    setCommentsVisible: (value: boolean) => void;
  },
): boolean {
  const thread = editor.store.get(threadId as never) as DrCommentThread | undefined;
  if (!thread) return false;

  if (thread.pageId !== editor.getCurrentPageId()) {
    editor.setCurrentPage(thread.pageId as DrPageId);
  }

  setCommentsVisible(true);
  const pagePoint = getCommentThreadPagePoint(editor, thread);
  editor.centerOnPoint(pagePoint, { animation: { duration: 300 } });
  openThread(thread.id);
  return true;
}

export function hasBoardDeepLinkSearch(search: BoardDeepLinkSearch): boolean {
  return Boolean(search.shape || search.comment);
}
