import type { Editor } from '@tiptap/react';
import type * as Y from 'yjs';
import {
  createEditorCommentMessageId,
  createEditorCommentThreadId,
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
  let range: { from: number; to: number } | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (range) return false;
    const mark = node.marks.find((m) => m.type.name === 'comment' && m.attrs.threadId === threadId);
    if (mark) range = { from: pos, to: pos + node.nodeSize };
    return true;
  });
  return range;
}

export function createCommentThreadAt(
  editor: Editor,
  threadsMap: Y.Map<EditorCommentThread>,
  messagesMap: Y.Map<EditorCommentMessage>,
  range: { from: number; to: number },
  text: string,
  author: NewCommentAuthor,
): EditorCommentThread {
  const threadId = createEditorCommentThreadId();
  const color = generateUserColor(author.authorId);
  editor.chain().setTextSelection(range).setComment(threadId, color).run();

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
