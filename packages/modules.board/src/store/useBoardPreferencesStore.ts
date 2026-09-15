import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function readLegacyAutoClose(): boolean {
  try {
    const raw = localStorage.getItem('draw-storage');
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: { autoCloseDrawShapes?: boolean } };
    return parsed.state?.autoCloseDrawShapes === true;
  } catch {
    return false;
  }
}

interface BoardPreferencesState {
  /** Замыкать почти замкнутый штрих карандаша в фигуру с заливкой */
  autoCloseDrawShapes: boolean;
  setAutoCloseDrawShapes: (value: boolean) => void;
}

export const useBoardPreferencesStore = create<BoardPreferencesState>()(
  persist(
    (set) => ({
      autoCloseDrawShapes: readLegacyAutoClose(),
      setAutoCloseDrawShapes: (value) => set({ autoCloseDrawShapes: value }),
    }),
    { name: 'board-preferences' },
  ),
);
