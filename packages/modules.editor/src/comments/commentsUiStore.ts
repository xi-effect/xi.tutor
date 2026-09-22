import { create } from 'zustand';

type DraftComment = { threadId: string; from: number; to: number } | null;

interface CommentsUiState {
  draftRange: DraftComment;
  setDraftRange: (range: DraftComment) => void;
  openThreadId: string | null;
  openThread: (id: string | null, options?: { focusReply?: boolean }) => void;
  focusReplyOnOpen: boolean;
  consumeFocusReplyOnOpen: () => void;
  commentsVisible: boolean;
  setCommentsVisible: (value: boolean) => void;
}

export const useCommentsUiStore = create<CommentsUiState>((set) => ({
  draftRange: null,
  setDraftRange: (range) => set({ draftRange: range, openThreadId: null }),

  openThreadId: null,
  openThread: (id, options) =>
    set({ openThreadId: id, draftRange: null, focusReplyOnOpen: !!options?.focusReply }),

  focusReplyOnOpen: false,
  consumeFocusReplyOnOpen: () => set({ focusReplyOnOpen: false }),

  commentsVisible: true,
  setCommentsVisible: (value) =>
    set((state) => ({
      commentsVisible: value,
      draftRange: value ? state.draftRange : null,
      openThreadId: value ? state.openThreadId : null,
    })),
}));
