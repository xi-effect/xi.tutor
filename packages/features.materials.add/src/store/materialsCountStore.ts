import { create } from 'zustand';

type MaterialsCountStore = {
  notesCount: number;
  boardsCount: number;
  incrementNotes: () => void;
  incrementBoards: () => void;
  decrementNotes: () => void;
  decrementBoards: () => void;
};

export const useMaterialsCountStore = create<MaterialsCountStore>((set) => ({
  notesCount: 0,
  boardsCount: 0,
  incrementNotes: () => set((state) => ({ notesCount: state.notesCount + 1 })),
  incrementBoards: () => set((state) => ({ boardsCount: state.boardsCount + 1 })),
  decrementNotes: () => set((state) => ({ notesCount: Math.max(0, state.notesCount - 1) })),
  decrementBoards: () => set((state) => ({ boardsCount: Math.max(0, state.boardsCount - 1) })),
}));

export const materialsSelectors = {
  useNotesCount: () => useMaterialsCountStore((s) => s.notesCount),
  useBoardsCount: () => useMaterialsCountStore((s) => s.boardsCount),
  useIncrementNotes: () => useMaterialsCountStore((s) => s.incrementNotes),
  useDecrementNotes: () => useMaterialsCountStore((s) => s.decrementNotes),
  useIncrementBoards: () => useMaterialsCountStore((s) => s.incrementBoards),
  useDecrementBoards: () => useMaterialsCountStore((s) => s.decrementBoards),
};
