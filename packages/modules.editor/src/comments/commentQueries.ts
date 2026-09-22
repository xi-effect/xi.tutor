import type { Editor } from '@tiptap/react';
import type * as Y from 'yjs';
import {
  createEditorCommentMessageId,
  type EditorCommentMessage,
  type EditorCommentThread,
} from './commentRecords';
import { generateUserColor } from '../utils/userColor';

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
    if (!node.isText) return true;
    const hasMark = node.marks.some(
      (m) => m.type.name === 'comment' && m.attrs.threadId === threadId,
    );
    if (hasMark) {
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
  console.log(message);
  messagesMap.set(message.id, message);
  console.log(messagesMap);
  //TODO: fix sending replay for student in view-only note
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
  editor.commands.unsetComment(threadId);
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
    editor.commands.unsetComment(threadId);
    threadsMap.delete(threadId);
  }
}

export function applyDraftCommentMark(
  editor: Editor,
  range: { from: number; to: number },
  threadId: string,
  authorId: string,
): void {
  const color = generateUserColor(authorId);
  editor.chain().setTextSelection(range).setComment(threadId, color).run();
}

export function cancelDraftComment(editor: Editor, threadId: string): void {
  editor.commands.unsetComment(threadId);
  editor.commands.setTextSelection(editor.state.selection.to);
}
