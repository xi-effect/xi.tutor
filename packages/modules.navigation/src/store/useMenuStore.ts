import { create } from 'zustand';

interface MenuState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  isOpen: false,
  toggle: () => set((state: MenuState) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
