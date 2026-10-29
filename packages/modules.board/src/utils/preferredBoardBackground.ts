import * as Y from 'yjs';
import {
  DEFAULT_BOARD_BACKGROUND_COLOR,
  DEFAULT_BOARD_BACKGROUND_TYPE,
  normalizeBoardBackgroundColor,
  normalizeBoardBackgroundType,
  type BoardBackgroundColorId,
  type BoardBackgroundPattern,
} from './boardBackgroundCatalog';

export const BOARD_PREFERENCES_STORAGE_KEY = 'board-preferences';

export type PreferredBoardBackground = {
  type: BoardBackgroundPattern;
  color: BoardBackgroundColorId;
};

const FALLBACK_BOARD_BACKGROUND: PreferredBoardBackground = {
  type: DEFAULT_BOARD_BACKGROUND_TYPE,
  color: DEFAULT_BOARD_BACKGROUND_COLOR,
};

type PersistedBoardPreferences = {
  state?: {
    defaultBackgroundType?: unknown;
    defaultBackgroundColor?: unknown;
  };
};

/** Читает сохранённый фон напрямую: zustand persist может ещё не успеть восстановиться. */
export function readPreferredBoardBackground(): PreferredBoardBackground {
  try {
    if (typeof localStorage === 'undefined') return FALLBACK_BOARD_BACKGROUND;
    const raw = localStorage.getItem(BOARD_PREFERENCES_STORAGE_KEY);
    if (!raw) return FALLBACK_BOARD_BACKGROUND;

    const parsed = JSON.parse(raw) as PersistedBoardPreferences;
    return {
      type: normalizeBoardBackgroundType(parsed.state?.defaultBackgroundType),
      color: normalizeBoardBackgroundColor(parsed.state?.defaultBackgroundColor),
    };
  } catch {
    return FALLBACK_BOARD_BACKGROUND;
  }
}

/** Записывает фон по умолчанию в пустую карту новой доски. Уже заданный фон не трогает. */
export function writePreferredBoardBackground(yDoc: Y.Doc) {
  const map = yDoc.getMap<string>('boardBackground');
  if (map.has('type') || map.has('color')) return;

  const preferred = readPreferredBoardBackground();
  map.set('type', preferred.type);
  map.set('color', preferred.color);
}
