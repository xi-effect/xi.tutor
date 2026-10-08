import { env } from 'common.env';
import { toast } from 'sonner';
import { writeText } from 'common.platform';
import i18n from 'i18next';
import type { Editor } from '@tiptap/react';
import { getThreadMarkRange } from '../comments/commentQueries';
import type { EditorCommentThread } from '../comments/commentRecords';
import type * as Y from 'yjs';

export type EditorDeepLinkSearch = {
  comment?: string;
  call?: string;
};

type BuildEditorDeepLinkArgs = {
  /** Текущий pathname страницы редактора — `/notes/…` или `/classrooms/…/materials/…`. */
  pathname: string;
  origin?: string;
  /** Существующие query-параметры страницы (например, `call` из звонка). */
  currentSearch?: EditorDeepLinkSearch;
  commentId?: string;
};

export function buildEditorDeepLink({
  pathname,
  origin,
  currentSearch,
  commentId,
}: BuildEditorDeepLinkArgs): string {
  const base = (
    origin ?? (typeof window !== 'undefined' ? window.location.origin : env.VITE_APP_DOMAIN)
  ).replace(/\/$/, '');

  const params = new URLSearchParams();
  if (currentSearch?.call) params.set('call', currentSearch.call);
  if (commentId) params.set('comment', commentId);

  const qs = params.toString();
  return `${base}${pathname}${qs ? `?${qs}` : ''}`;
}

export async function copyEditorDeepLink(url: string): Promise<void> {
  try {
    await writeText(url);
    toast.success(i18n.t('toast.linkCopied', { ns: 'editor' }));
  } catch {
    toast.error(i18n.t('toast.linkCopyFailed', { ns: 'editor' }));
  }
}

/** Скроллит к треду и открывает его. `false`, если тред не найден или его марка ещё не подгружена. */
export function focusEditorComment(
  editor: Editor,
  commentThreadsMap: Y.Map<EditorCommentThread>,
  threadId: string,
  {
    openThread,
    setCommentsVisible,
  }: {
    openThread: (id: string | null) => void;
    setCommentsVisible: (value: boolean) => void;
  },
): boolean {
  const thread = commentThreadsMap.get(threadId);
  if (!thread) return false;

  const range = getThreadMarkRange(editor, threadId);
  if (!range) return false;

  setCommentsVisible(true);
  openThread(threadId);
  return true;
}

export function hasEditorDeepLinkSearch(search: EditorDeepLinkSearch): boolean {
  return Boolean(search.comment);
}
