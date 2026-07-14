import { create } from 'zustand';

type DraftPoint = { x: number; y: number } | null;

interface CommentsUiState {
  /** Активен режим «поставить комментарий» — следующий клик по канвасу создаёт черновик треда */
  isPlacing: boolean;
  setPlacing: (value: boolean) => void;
  /** Точка на странице для ещё не созданного треда (открыта форма первого сообщения) */
  draftPoint: DraftPoint;
  setDraftPoint: (point: DraftPoint) => void;
  /** id открытого (просматриваемого) треда — попап на канвасе */
  openThreadId: string | null;
  openThread: (id: string | null) => void;
  /** Видимость пинов комментариев на канвасе — переключается из меню «ещё» */
  commentsVisible: boolean;
  setCommentsVisible: (value: boolean) => void;
}

export const useCommentsUiStore = create<CommentsUiState>((set) => ({
  isPlacing: false,
  setPlacing: (value) =>
    set((state) => ({
      isPlacing: value,
      draftPoint: value ? state.draftPoint : null,
      openThreadId: value ? null : state.openThreadId,
    })),
  draftPoint: null,
  setDraftPoint: (point) => set({ draftPoint: point, isPlacing: false }),
  openThreadId: null,
  openThread: (id) => set({ openThreadId: id, isPlacing: false, draftPoint: null }),
  commentsVisible: true,
  setCommentsVisible: (value) =>
    set((state) => ({
      commentsVisible: value,
      isPlacing: value ? state.isPlacing : false,
      draftPoint: value ? state.draftPoint : null,
      openThreadId: value ? state.openThreadId : null,
    })),
}));
