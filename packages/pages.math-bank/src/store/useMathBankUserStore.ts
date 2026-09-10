import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 30;

type MathBankUserState = {
  favoriteTaskIds: string[];
  recentTaskIds: string[];
  toggleFavorite: (taskId: string) => boolean;
  addRecent: (taskId: string) => void;
  isFavorite: (taskId: string) => boolean;
};

export const useMathBankUserStore = create<MathBankUserState>()(
  persist(
    (set, get) => ({
      favoriteTaskIds: [],
      recentTaskIds: [],
      toggleFavorite: (taskId) => {
        const current = get().favoriteTaskIds;
        const exists = current.includes(taskId);
        const isFirstFavorite = !exists && current.length === 0;

        set({
          favoriteTaskIds: exists ? current.filter((id) => id !== taskId) : [...current, taskId],
        });

        return isFirstFavorite;
      },
      addRecent: (taskId) => {
        set((state) => ({
          recentTaskIds: [taskId, ...state.recentTaskIds.filter((id) => id !== taskId)].slice(
            0,
            MAX_RECENT,
          ),
        }));
      },
      isFavorite: (taskId) => get().favoriteTaskIds.includes(taskId),
    }),
    {
      name: 'math-bank-user',
      version: 1,
      partialize: (state) => ({
        favoriteTaskIds: state.favoriteTaskIds,
        recentTaskIds: state.recentTaskIds,
      }),
    },
  ),
);
