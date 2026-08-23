import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OcrLanguage, OcrLanguageChoice } from './types';
import { isOcrLanguage, isOcrLanguageChoice } from './resolveOcrLanguage';

type OcrPreferencesState = {
  languageChoice: OcrLanguageChoice;
  lastResolvedLanguage: OcrLanguage | null;
  setLanguageChoice: (choice: OcrLanguageChoice) => void;
  rememberResolvedLanguage: (language: OcrLanguage) => void;
};

export const useOcrPreferencesStore = create<OcrPreferencesState>()(
  persist(
    (set) => ({
      languageChoice: 'auto',
      lastResolvedLanguage: null,
      setLanguageChoice: (languageChoice) => set({ languageChoice }),
      rememberResolvedLanguage: (lastResolvedLanguage) => set({ lastResolvedLanguage }),
    }),
    {
      name: 'board-ocr-language',
      partialize: (state) => ({
        languageChoice: state.languageChoice,
        lastResolvedLanguage: state.lastResolvedLanguage,
      }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<OcrPreferencesState> | undefined;
        return {
          ...current,
          languageChoice: isOcrLanguageChoice(stored?.languageChoice)
            ? stored.languageChoice
            : current.languageChoice,
          lastResolvedLanguage: isOcrLanguage(stored?.lastResolvedLanguage)
            ? stored.lastResolvedLanguage
            : current.lastResolvedLanguage,
        };
      },
    },
  ),
);

type OcrProcessingState = {
  processingShapeIds: string[];
  start: (shapeId: string) => void;
  finish: (shapeId: string) => void;
  isProcessing: (shapeId: string) => boolean;
};

export const useOcrProcessingStore = create<OcrProcessingState>((set, get) => ({
  processingShapeIds: [],
  start: (shapeId) =>
    set((state) =>
      state.processingShapeIds.includes(shapeId)
        ? state
        : { processingShapeIds: [...state.processingShapeIds, shapeId] },
    ),
  finish: (shapeId) =>
    set((state) => ({
      processingShapeIds: state.processingShapeIds.filter((id) => id !== shapeId),
    })),
  isProcessing: (shapeId) => get().processingShapeIds.includes(shapeId),
}));
