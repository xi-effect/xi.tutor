import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_BOARD_BACKGROUND_COLOR,
  DEFAULT_BOARD_BACKGROUND_TYPE,
  normalizeBoardBackgroundColor,
  normalizeBoardBackgroundType,
  type BoardBackgroundColorId,
  type BoardBackgroundPattern,
} from '../utils/boardBackgroundCatalog';
import { BOARD_PREFERENCES_STORAGE_KEY } from '../utils/preferredBoardBackground';

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
  /** Тип фона, с которым создаётся новая доска */
  defaultBackgroundType: BoardBackgroundPattern;
  setDefaultBackgroundType: (value: BoardBackgroundPattern) => void;
  /** Цвет фона, с которым создаётся новая доска */
  defaultBackgroundColor: BoardBackgroundColorId;
  setDefaultBackgroundColor: (value: BoardBackgroundColorId) => void;
}

export const useBoardPreferencesStore = create<BoardPreferencesState>()(
  persist(
    (set) => ({
      autoCloseDrawShapes: readLegacyAutoClose(),
      setAutoCloseDrawShapes: (value) => set({ autoCloseDrawShapes: value }),
      defaultBackgroundType: DEFAULT_BOARD_BACKGROUND_TYPE,
      setDefaultBackgroundType: (value) =>
        set({ defaultBackgroundType: normalizeBoardBackgroundType(value) }),
      defaultBackgroundColor: DEFAULT_BOARD_BACKGROUND_COLOR,
      setDefaultBackgroundColor: (value) =>
        set({ defaultBackgroundColor: normalizeBoardBackgroundColor(value) }),
    }),
    {
      name: BOARD_PREFERENCES_STORAGE_KEY,
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<BoardPreferencesState>;

        return {
          ...currentState,
          ...persisted,
          defaultBackgroundType: normalizeBoardBackgroundType(
            persisted.defaultBackgroundType ?? currentState.defaultBackgroundType,
          ),
          defaultBackgroundColor: normalizeBoardBackgroundColor(
            persisted.defaultBackgroundColor ?? currentState.defaultBackgroundColor,
          ),
        };
      },
    },
  ),
);

export {
  BOARD_BACKGROUND_COLOR_CHOICES,
  BOARD_BACKGROUND_TYPE_CHOICES,
  isBoardBackgroundColorId,
  isBoardBackgroundType,
  type BoardBackgroundColorId,
  type BoardBackgroundPattern,
} from '../utils/boardBackgroundCatalog';
