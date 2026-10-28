import type { Editor } from '@tiptap/react';
import type * as Y from 'yjs';
import {
  createEditorCommentMessageId,
  type EditorCommentMessage,
  type EditorCommentThread,
} from './commentRecords';
import { generateUserColor } from '../utils/userColor';
import { getCommentableNodeAt } from '../extensions/comment/commentableNodes';
import { NodeSelection } from '@tiptap/pm/state';

export type NewCommentAuthor = { authorId: string; authorName: string };

export function getAllCommentThreads(
  threadsMap: Y.Map<EditorCommentThread>,
): EditorCommentThread[] {
  return [...threadsMap.values()];
}

export function getThreadMessages(
  messagesMap: Y.Map<EditorCommentMessage>,
  threadId: string,
): EditorCommentMessage[] {
  return [...messagesMap.values()]
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Диапазон марки треда в текущем документе. null — текст удалили, марка исчезла. */
export function getThreadMarkRange(
  editor: Editor,
  threadId: string,
): { from: number; to: number } | null {
  let from = Infinity;
  let to = -Infinity;

  editor.state.doc.descendants((node, pos) => {
    const anchored = node.isText
      ? node.marks.some((m) => m.type.name === 'comment' && m.attrs.threadId === threadId)
      : node.attrs.commentThreadId === threadId;
    if (anchored) {
      from = Math.min(from, pos);
      to = Math.max(to, pos + node.nodeSize);
    }
    return true;
  });

  return from === Infinity ? null : { from, to };
}

export function createCommentThreadAt(
  editor: Editor,
  threadId: string,
  threadsMap: Y.Map<EditorCommentThread>,
  messagesMap: Y.Map<EditorCommentMessage>,
  range: { from: number; to: number },
  text: string,
  author: NewCommentAuthor,
): EditorCommentThread {
  const color = generateUserColor(author.authorId);
  applyCommentAnchor(editor, range, threadId, color);
  // для ноды выделение не трогаем: setTextSelection на границе блоков невалиден
  if (!getCommentableNodeAt(editor.state.doc, range)) {
    editor.commands.setTextSelection(range.to);
  }

  editor.chain().setTextSelection(range).setComment(threadId, color).run();
  editor.commands.setTextSelection(range.to);

  const thread: EditorCommentThread = {
    id: threadId,
    resolved: false,
    createdAt: Date.now(),
    authorId: author.authorId,
    authorName: author.authorName,
  };
  const message: EditorCommentMessage = {
    id: createEditorCommentMessageId(),
    threadId,
    text,
    authorId: author.authorId,
    authorName: author.authorName,
    createdAt: Date.now(),
  };

  threadsMap.set(threadId, thread);
  messagesMap.set(message.id, message);
  return thread;
}

export function addCommentReply(
  messagesMap: Y.Map<EditorCommentMessage>,
  threadId: string,
  text: string,
  author: NewCommentAuthor,
): void {
  const message: EditorCommentMessage = {
    id: createEditorCommentMessageId(),
    threadId,
    text,
    authorId: author.authorId,
    authorName: author.authorName,
    createdAt: Date.now(),
  };

  messagesMap.set(message.id, message);
}

export function setCommentThreadResolved(
  threadsMap: Y.Map<EditorCommentThread>,
  threadId: string,
  resolved: boolean,
): void {
  const thread = threadsMap.get(threadId);
  if (!thread) return;
  threadsMap.set(threadId, { ...thread, resolved });
}

export function deleteCommentThread(
  editor: Editor,
  threadsMap: Y.Map<EditorCommentThread>,
  messagesMap: Y.Map<EditorCommentMessage>,
  threadId: string,
): void {
  removeCommentAnchor(editor, threadId);
  threadsMap.delete(threadId);
  for (const m of getThreadMessages(messagesMap, threadId)) messagesMap.delete(m.id);
}

export function deleteCommentMessage(
  editor: Editor,
  threadsMap: Y.Map<EditorCommentThread>,
  messagesMap: Y.Map<EditorCommentMessage>,
  threadId: string,
  messageId: string,
): void {
  const messages = getThreadMessages(messagesMap, threadId);
  const isLast = messages.length <= 1;
  messagesMap.delete(messageId);
  if (isLast) {
    removeCommentAnchor(editor, threadId);
    threadsMap.delete(threadId);
  }
}

export function applyDraftCommentMark(
  editor: Editor,
  range: { from: number; to: number },
  threadId: string,
  authorId: string,
): void {
  applyCommentAnchor(editor, range, threadId, generateUserColor(authorId));
}

export function cancelDraftComment(editor: Editor, threadId: string): void {
  removeCommentAnchor(editor, threadId);
  if (!(editor.state.selection instanceof NodeSelection)) {
    editor.commands.setTextSelection(editor.state.selection.to);
  }
}

/** Ставит якорь треда: attr для блочной ноды или mark для текста. */
export function applyCommentAnchor(
  editor: Editor,
  range: { from: number; to: number },
  threadId: string,
  color: string,
): void {
  if (getCommentableNodeAt(editor.state.doc, range)) {
    editor.chain().setNodeComment(range.from, threadId, color).run();
    return;
  }
  editor.chain().setTextSelection(range).setComment(threadId, color).run();
}

/** Снимает якорь треда и с текста, и с нод. */
export function removeCommentAnchor(editor: Editor, threadId: string): void {
  editor.commands.unsetComment(threadId);
  editor.commands.unsetNodeComment(threadId);
}
