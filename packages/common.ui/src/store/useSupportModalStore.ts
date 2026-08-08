import { create } from 'zustand';

type SupportModalState = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  open: () => void;
};

export const useSupportModalStore = create<SupportModalState>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  open: () => set({ isOpen: true }),
}));
