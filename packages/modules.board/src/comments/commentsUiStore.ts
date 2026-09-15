import { create } from 'zustand';

type DraftPoint = { x: number; y: number } | null;
type DraftRegion = { w: number; h: number } | null;

interface CommentsUiState {
  /** Активен режим «поставить комментарий» — следующий клик/выделение по канвасу создаёт черновик треда */
  isPlacing: boolean;
  setPlacing: (value: boolean) => void;
  /** Точка на странице для ещё не созданного треда (открыта форма первого сообщения).
   * Для комментария к области — правый нижний угол выделения. */
  draftPoint: DraftPoint;
  /** Размер выделенной области черновика (координаты страницы). null — точечный комментарий. */
  draftRegion: DraftRegion;
  setDraftPoint: (point: DraftPoint, region?: DraftRegion) => void;
  /** id открытого (просматриваемого) треда — попап на канвасе */
  openThreadId: string | null;
  openThread: (id: string | null) => void;
  /** id треда под курсором — для подсветки рамки выделенной области при наведении на пин */
  hoveredThreadId: string | null;
  setHoveredThread: (id: string | null) => void;
  /**
   * Живой предпросмотр прямоугольника области при resize (координаты страницы, левый верхний угол + размер).
   * Пока задан — рамка этого треда рисуется по preview-прямоугольнику, а не по сохранённому.
   */
  regionDrag: { threadId: string; x: number; y: number; w: number; h: number } | null;
  setRegionDrag: (
    value: { threadId: string; x: number; y: number; w: number; h: number } | null,
  ) => void;
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
      draftRegion: value ? state.draftRegion : null,
      openThreadId: value ? null : state.openThreadId,
    })),
  draftPoint: null,
  draftRegion: null,
  setDraftPoint: (point, region = null) =>
    set({ draftPoint: point, draftRegion: point ? region : null, isPlacing: false }),
  openThreadId: null,
  // Открытие треда — намеренная смена фокуса: гасим залипший ховер/предпросмотр другого треда.
  openThread: (id) =>
    set({
      openThreadId: id,
      isPlacing: false,
      draftPoint: null,
      draftRegion: null,
      hoveredThreadId: null,
      regionDrag: null,
    }),
  hoveredThreadId: null,
  setHoveredThread: (id) => set({ hoveredThreadId: id }),
  regionDrag: null,
  setRegionDrag: (value) => set({ regionDrag: value }),
  commentsVisible: true,
  setCommentsVisible: (value) =>
    set((state) => ({
      commentsVisible: value,
      isPlacing: value ? state.isPlacing : false,
      draftPoint: value ? state.draftPoint : null,
      draftRegion: value ? state.draftRegion : null,
      openThreadId: value ? state.openThreadId : null,
      hoveredThreadId: value ? state.hoveredThreadId : null,
      regionDrag: value ? state.regionDrag : null,
    })),
}));
