export type EditorCommentThread = {
  id: string;
  resolved: boolean;
  createdAt: number;
  authorId: string;
  authorName: string;
};

export type EditorCommentMessage = {
  id: string;
  threadId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: number;
};

export function createEditorCommentThreadId(): string {
  return crypto.randomUUID();
}

export function createEditorCommentMessageId(): string {
  return crypto.randomUUID();
}
