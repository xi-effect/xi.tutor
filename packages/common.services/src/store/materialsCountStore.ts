import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MaterialsCountStore = {
  notesCount: number;
  boardsCount: number;
  incrementNotes: () => void;
  incrementBoards: () => void;
  decrementNotes: () => void;
  decrementBoards: () => void;
};

export const useMaterialsCountStore = create<MaterialsCountStore>()(
  persist(
    (set) => ({
      notesCount: 1,
      boardsCount: 1,
      incrementNotes: () => set((state) => ({ notesCount: state.notesCount + 1 })),
      incrementBoards: () => set((state) => ({ boardsCount: state.boardsCount + 1 })),
      decrementNotes: () => set((state) => ({ notesCount: Math.max(1, state.notesCount - 1) })),
      decrementBoards: () => set((state) => ({ boardsCount: Math.max(1, state.boardsCount - 1) })),
    }),
    {
      name: 'materials-count-storage',
    },
  ),
);

export const materialsSelectors = {
  useNotesCount: () => useMaterialsCountStore((s) => s.notesCount),
  useBoardsCount: () => useMaterialsCountStore((s) => s.boardsCount),
  useIncrementNotes: () => useMaterialsCountStore((s) => s.incrementNotes),
  useDecrementNotes: () => useMaterialsCountStore((s) => s.decrementNotes),
  useIncrementBoards: () => useMaterialsCountStore((s) => s.incrementBoards),
  useDecrementBoards: () => useMaterialsCountStore((s) => s.decrementBoards),
};
