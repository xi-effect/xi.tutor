import { create } from 'zustand';

interface FocusModeState {
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
}

export const useFocusModeStore = create<FocusModeState>((set) => ({
  focusMode: false,
  setFocusMode: (value) => set({ focusMode: value }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
}));
