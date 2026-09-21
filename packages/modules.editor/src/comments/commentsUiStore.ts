import { create } from 'zustand';

type DraftRange = { from: number; to: number } | null;

interface CommentsUiState {
  /** Диапазон текста для ещё не созданного треда — открыта форма первого сообщения. */
  draftRange: DraftRange;
  setDraftRange: (range: DraftRange) => void;
  /** id открытого (просматриваемого) треда — попап у пина. */
  openThreadId: string | null;
  openThread: (id: string | null) => void;
  commentsVisible: boolean;
  setCommentsVisible: (value: boolean) => void;
}

export const useCommentsUiStore = create<CommentsUiState>((set) => ({
  draftRange: null,
  setDraftRange: (range) => set({ draftRange: range, openThreadId: null }),

  openThreadId: null,
  openThread: (id) => set({ openThreadId: id, draftRange: null }),

  commentsVisible: true,
  setCommentsVisible: (value) =>
    set((state) => ({
      commentsVisible: value,
      draftRange: value ? state.draftRange : null,
      openThreadId: value ? state.openThreadId : null,
    })),
}));
