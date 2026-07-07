import { create } from 'zustand';

type KanbanUiStore = {
  isCardModalOpen: boolean;
  setCardModalOpen: (open: boolean) => void;
};

export const useKanbanUiStore = create<KanbanUiStore>((set) => ({
  isCardModalOpen: false,
  setCardModalOpen: (open) => set({ isCardModalOpen: open }),
}));
