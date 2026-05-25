import { create } from 'zustand';
import { ERASER_CATEGORIES } from '../config';
import { areAllEraserCategoriesEnabled } from '../utils/areAllEraserCategoriesEnabled';

type EraserSettings = Record<string, boolean>;

const STORAGE_KEY = 'board-eraser-settings';

const DEFAULT_ERASER_SETTINGS: EraserSettings = {
  text: true,
  images: true,
  files: true,
  shapes: true,
  stickers: true,
  frames: true,
  arrows: true,
  lines: true,
};

type Store = {
  settings: EraserSettings;
  toggleCategory: (key: string) => void;
  toggleAll: () => void;
  isTypeErasable: (shapeType: string) => boolean;
};

const loadSettings = (): EraserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return DEFAULT_ERASER_SETTINGS;

    return {
      ...DEFAULT_ERASER_SETTINGS,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_ERASER_SETTINGS;
  }
};

export const useEraserSettingsStore = create<Store>((set, get) => ({
  settings: loadSettings(),

  toggleCategory: (key) => {
    set((state) => {
      const next = {
        ...state.settings,
        [key]: !state.settings[key],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      return { settings: next };
    });
  },

  toggleAll: () =>
    set((state) => {
      const allEnabled = areAllEraserCategoriesEnabled(state.settings);
      return {
        settings: Object.fromEntries(ERASER_CATEGORIES.map(({ key }) => [key, !allEnabled])),
      };
    }),

  isTypeErasable: (shapeType) => {
    const settings = get().settings;

    const category = ERASER_CATEGORIES.find((item) => item.types.includes(shapeType));

    if (!category) return true;

    return settings[category.key];
  },
}));
