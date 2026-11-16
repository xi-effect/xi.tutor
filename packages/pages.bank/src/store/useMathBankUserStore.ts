import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BankSubject } from 'features.bank';

const MAX_RECENT = 30;

type MathBankUserState = {
  subject: BankSubject;
  recentTaskIds: string[];
  legacyFavoriteTaskIds: string[];
  setSubject: (subject: BankSubject) => void;
  addRecent: (taskId: string) => void;
  clearLegacyFavorites: () => void;
};

type PersistedMathBankUserState = {
  subject?: BankSubject;
  recentTaskIds?: string[];
  favoriteTaskIds?: unknown;
  legacyFavoriteTaskIds?: unknown;
};

const readIdList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : [];

export const useMathBankUserStore = create<MathBankUserState>()(
  persist(
    (set) => ({
      subject: 'mathematics',
      recentTaskIds: [],
      legacyFavoriteTaskIds: [],
      setSubject: (subject) => set({ subject }),
      addRecent: (taskId) => {
        set((state) => ({
          recentTaskIds: [taskId, ...state.recentTaskIds.filter((id) => id !== taskId)].slice(
            0,
            MAX_RECENT,
          ),
        }));
      },
      clearLegacyFavorites: () => set({ legacyFavoriteTaskIds: [] }),
    }),
    {
      name: 'math-bank-user',
      // Избранное хранится на бэкенде по UUID. Старые строковые id остаются только до одноразовой отправки.
      version: 3,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as PersistedMathBankUserState;
        const legacyFavoriteTaskIds = readIdList(state.legacyFavoriteTaskIds);
        return {
          subject: state.subject ?? 'mathematics',
          recentTaskIds: readIdList(state.recentTaskIds),
          legacyFavoriteTaskIds: legacyFavoriteTaskIds.length
            ? legacyFavoriteTaskIds
            : readIdList(state.favoriteTaskIds),
        };
      },
      partialize: (state) => ({
        subject: state.subject,
        recentTaskIds: state.recentTaskIds,
        legacyFavoriteTaskIds: state.legacyFavoriteTaskIds,
      }),
    },
  ),
);
