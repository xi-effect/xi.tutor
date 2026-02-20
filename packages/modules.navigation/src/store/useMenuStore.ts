import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MenuState {
  isOpen: boolean; // Для Mobile Drawer
  isDesktopOpen: boolean; // Для Desktop Sidebar
  toggle: () => void;
  open: () => void;
  close: () => void;
  setDesktopOpen: (open: boolean) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      isOpen: false,
      isDesktopOpen: true, // Значение по умолчанию, persist восстановит сохраненное значение
      toggle: () => set((state: MenuState) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setDesktopOpen: (open: boolean) => set({ isDesktopOpen: open }),
    }),
    {
      name: 'menu-store',
      partialize: (state) => ({ isDesktopOpen: state.isDesktopOpen }),
    },
  ),
);
